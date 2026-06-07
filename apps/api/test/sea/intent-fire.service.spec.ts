// apps/api/test/sea/intent-fire.service.spec.ts
// DB-free coverage for IntentFireService — the Phase 3 CL fire path.
// All collaborators are mocked so we test fire-service logic in isolation.
import { BadRequestException } from '@nestjs/common';
import {
  IntentFireService,
  type FireableIntent,
} from '../../src/sea/intent-fire.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import type { IntentValidatorService } from '../../src/sea/intent-validator.service';
import type { OrdersPlacementService } from '../../src/matching/orders-placement.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { ZeroExSigningService } from '../../src/zeroex/signing.service';
import { IntentEventType, IntentStatus } from '@prisma/client';

const OWNER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const BASE_ADDR = '0x1111111111111111111111111111111111111111';
const QUOTE_ADDR = '0x2222222222222222222222222222222222222222';
const COMPUTED_HASH = '0x' + 'b'.repeat(64);
const PLACED_HASH = '0x' + 'c'.repeat(64);

const sizeBase = 1_000_000_000_000_000_000n;
const limitPriceTicks = 295_000n;
const priceTickQ = 10_000n;
const minSizeB = 100_000_000_000_000n;
const minNotionalQ = 1_000_000n;

const expectedMakerAmount =
  (limitPriceTicks * priceTickQ * sizeBase) /
  (() => {
    let r = 1n;
    for (let i = 0; i < 18; i++) r *= 10n;
    return r;
  })();

function buildBuyOrderJson() {
  return {
    makerToken: QUOTE_ADDR,
    takerToken: BASE_ADDR,
    makerAmount: expectedMakerAmount.toString(),
    takerAmount: sizeBase.toString(),
    takerTokenFeeAmount: '0',
    maker: OWNER,
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pool: '0x' + '0'.repeat(64),
    expiry: Math.floor(Date.now() / 1000) + 3600 * 24,
    salt: '12345',
  };
}

function buildIntent(overrides: Partial<FireableIntent> = {}): FireableIntent {
  // 65-byte signature hex (130 nibbles after 0x).
  const sigHex = '0x' + 'a'.repeat(130);
  return {
    id: 'cl_intent_xyz',
    owner: OWNER,
    marketId: 'm1',
    marketSymbol: 'WETH-USDC',
    side: 'BUY',
    sizeBase,
    limitPriceTicks,
    preSignedOrder: buildBuyOrderJson(),
    preSignedSignature: Buffer.from(sigHex.slice(2), 'hex'),
    preSignedOrderHash: COMPUTED_HASH,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    ...overrides,
  };
}

type RepoMock = {
  transitionStatus: jest.Mock;
  markPlaced: jest.Mock;
};
type EventsMock = { append: jest.Mock };
type ValidatorMock = { validateAtFire: jest.Mock };
type PlacementMock = { place: jest.Mock };
type PersistenceMock = { getTradingContext: jest.Mock };
type SigningMock = { getOrderHash: jest.Mock };

function buildService(opts?: {
  latched?: boolean;
  validatorThrows?: BadRequestException;
  placementThrows?: Error;
  placementResult?: { ok: true; orderHash: string; status: string };
}): {
  service: IntentFireService;
  repo: RepoMock;
  events: EventsMock;
  validator: ValidatorMock;
  placement: PlacementMock;
  persistence: PersistenceMock;
  signing: SigningMock;
} {
  const repo: RepoMock = {
    transitionStatus: jest
      .fn()
      .mockResolvedValue(
        opts?.latched === false ? null : { id: 'cl_intent_xyz' },
      ),
    markPlaced: jest.fn().mockResolvedValue(true),
  };
  const events: EventsMock = {
    append: jest.fn().mockResolvedValue(undefined),
  };
  const validator: ValidatorMock = {
    validateAtFire: jest.fn().mockImplementation(() => {
      if (opts?.validatorThrows) throw opts.validatorThrows;
      return Promise.resolve();
    }),
  };
  const placement: PlacementMock = {
    place: jest.fn().mockImplementation(() => {
      if (opts?.placementThrows) throw opts.placementThrows;
      return Promise.resolve(
        opts?.placementResult ?? {
          ok: true,
          orderHash: PLACED_HASH,
          status: 'placed',
        },
      );
    }),
  };
  const persistence: PersistenceMock = {
    getTradingContext: jest.fn().mockResolvedValue({
      id: 'm1',
      symbol: 'WETH-USDC',
      baseDecimals: 18,
      quoteDecimals: 6,
      minNotionalQ,
      minSizeB,
      priceTickQ,
      baseAddress: BASE_ADDR,
      quoteAddress: QUOTE_ADDR,
    }),
  };
  const signing: SigningMock = {
    getOrderHash: jest.fn().mockReturnValue(PLACED_HASH),
  };

  const service = new IntentFireService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
    validator as unknown as IntentValidatorService,
    placement as unknown as OrdersPlacementService,
    persistence as unknown as PersistenceRepository,
    signing as unknown as ZeroExSigningService,
  );
  return { service, repo, events, validator, placement, persistence, signing };
}

describe('IntentFireService.fire', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    process.env.CHAIN_ID = '84532';
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('clean fire: validates, places with postOnly:true, marks PLACED, emits IntentEvent', async () => {
    const { service, repo, events, placement } = buildService();
    await service.fire(buildIntent());
    expect(repo.transitionStatus).toHaveBeenCalledWith(
      'cl_intent_xyz',
      IntentStatus.ACTIVE,
      IntentStatus.TRIGGERED,
    );
    expect(placement.place).toHaveBeenCalledTimes(1);
    const callArgs = placement.place.mock.calls[0][0] as {
      postOnly: boolean;
      source?: string;
      signature: unknown;
    };
    expect(callArgs.postOnly).toBe(true);
    expect(callArgs.source).toBe('sea');
    // Phase 5 P0 fix contract: the fire path MUST pass the signature as a
    // tuple `{ signatureType, v, r, s }` so the on-chain ABI gets the right
    // discriminator (ETHSIGN orders would silently be filled as EIP-712 if
    // we ever regressed to a hex-string here).
    expect(typeof callArgs.signature).toBe('object');
    expect(callArgs.signature).toEqual(
      expect.objectContaining({
        signatureType: expect.any(Number),
        v: expect.any(Number),
        r: expect.stringMatching(/^0x[0-9a-fA-F]{64}$/),
        s: expect.stringMatching(/^0x[0-9a-fA-F]{64}$/),
      }),
    );
    // Phase 5 P0 follow-up contract: sanitizeOrder produces a LimitOrder
    // with bigint primitives for makerAmount / takerAmount /
    // takerTokenFeeAmount / salt (the validator code does bigint math on
    // them). OrderBookService.attachRaw is the safety net that normalises
    // these to decimal strings before they reach the in-memory LOB / the
    // /match/quote response. Document the bigint shape here so a future
    // refactor doesn't quietly switch fire to strings and bypass that
    // safety net.
    const orderArg = (
      placement.place.mock.calls[0][0] as { order: Record<string, unknown> }
    ).order;
    expect(typeof orderArg.makerAmount).toBe('bigint');
    expect(typeof orderArg.takerAmount).toBe('bigint');
    expect(typeof orderArg.takerTokenFeeAmount).toBe('bigint');
    expect(typeof orderArg.salt).toBe('bigint');
    expect(repo.markPlaced).toHaveBeenCalledWith('cl_intent_xyz', PLACED_HASH);
    expect(events.append).toHaveBeenCalledWith(
      'cl_intent_xyz',
      IntentEventType.PLACED,
      expect.objectContaining({ linkedOrderHash: PLACED_HASH }),
    );
  });

  it('would-cross → terminal FAILED("would_cross_at_fire") with suggestion, no markPlaced, no PLACED event', async () => {
    const { service, repo, events, placement } = buildService({
      placementThrows: new BadRequestException('post_only_would_cross'),
    });
    await service.fire(buildIntent());
    expect(placement.place).toHaveBeenCalledTimes(1);
    expect(repo.markPlaced).not.toHaveBeenCalled();
    // Second transitionStatus call: TRIGGERED → FAILED with reason.
    const failCall = repo.transitionStatus.mock.calls.find(
      (c: unknown[]) => c[2] === IntentStatus.FAILED,
    );
    expect(failCall).toBeDefined();
    expect(failCall![3]).toMatchObject({
      failureReason: 'would_cross_at_fire',
    });
    // FAILED event includes suggestion.
    const failedEvent = events.append.mock.calls.find(
      (c: unknown[]) => c[1] === IntentEventType.FAILED,
    );
    expect(failedEvent).toBeDefined();
    expect(failedEvent![2]).toMatchObject({
      reason: 'would_cross_at_fire',
      suggestion: 'use_conditional_market_ready',
    });
  });

  it('placement rejects with another code → FAILED("placement_rejected:<code>")', async () => {
    const { service, repo } = buildService({
      placementThrows: new BadRequestException(
        'maker_insufficient_free_balance',
      ),
    });
    await service.fire(buildIntent());
    const failCall = repo.transitionStatus.mock.calls.find(
      (c: unknown[]) => c[2] === IntentStatus.FAILED,
    );
    expect(failCall![3]).toMatchObject({
      failureReason: 'placement_rejected:maker_insufficient_free_balance',
    });
  });

  it('validator throws → FAILED with first issue code, no placement call', async () => {
    const validatorErr = new BadRequestException({
      message: 'fire_validation_failed',
      issues: [{ code: 'zeroex_order_expiry_too_close' }],
    });
    const { service, repo, placement } = buildService({
      validatorThrows: validatorErr,
    });
    await service.fire(buildIntent());
    expect(placement.place).not.toHaveBeenCalled();
    const failCall = repo.transitionStatus.mock.calls.find(
      (c: unknown[]) => c[2] === IntentStatus.FAILED,
    );
    expect(failCall![3]).toMatchObject({
      failureReason: 'zeroex_order_expiry_too_close',
    });
  });

  it('atomic-latch lost (transitionStatus returns null) → silent abort, no validator/placement calls', async () => {
    const { service, validator, placement } = buildService({ latched: false });
    await service.fire(buildIntent());
    expect(validator.validateAtFire).not.toHaveBeenCalled();
    expect(placement.place).not.toHaveBeenCalled();
  });

  it('READ_ONLY=true → silent skip, no state change', async () => {
    process.env.READ_ONLY = 'true';
    const { service, repo, validator, placement } = buildService();
    await service.fire(buildIntent());
    expect(repo.transitionStatus).not.toHaveBeenCalled();
    expect(validator.validateAtFire).not.toHaveBeenCalled();
    expect(placement.place).not.toHaveBeenCalled();
  });

  it('PROFILE=mainnet → silent skip, no state change', async () => {
    process.env.PROFILE = 'mainnet';
    const { service, repo, validator } = buildService();
    await service.fire(buildIntent());
    expect(repo.transitionStatus).not.toHaveBeenCalled();
    expect(validator.validateAtFire).not.toHaveBeenCalled();
  });
});
