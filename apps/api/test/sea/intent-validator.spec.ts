// apps/api/test/sea/intent-validator.spec.ts
// Phase 2 deterministic validator coverage. DB-free: mocks
// ZeroExSigningService and IntentRepository. The validator is instantiated
// directly (no Nest container) for fast, isolated tests.
//
// CMR ownerAuth is exercised with a real ethers Wallet so the EIP-191
// recovery path runs end-to-end (no mock of `verifyMessage`).
import { BadRequestException } from '@nestjs/common';
import { Wallet } from 'ethers';
import {
  buildCancelOwnerAuthMessage,
  buildCmrOwnerAuthMessage,
  IntentValidatorService,
  type ValidatorMarketContext,
} from '../../src/sea/intent-validator.service';
import type { ZeroExSigningService } from '../../src/zeroex/signing.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import {
  createIntentBodySchema,
  type CreateIntentBody,
} from '../../src/sea/dto/intent.dto';

// ---------- Fixtures ----------

// Deterministic test wallet whose address acts as the SEA owner. Real
// signatures are produced for the CMR ownerAuth tests; mocked verify is
// used for the CL signing path (see SigningMock below).
const TEST_PRIVATE_KEY = '0x' + '01'.repeat(32);
const TEST_WALLET = new Wallet(TEST_PRIVATE_KEY);
const OWNER = TEST_WALLET.address.toLowerCase();

// A second wallet used to demonstrate signer-mismatch scenarios.
const WRONG_WALLET = new Wallet('0x' + '02'.repeat(32));

const BASE_ADDR = '0x1111111111111111111111111111111111111111'; // WETH
const QUOTE_ADDR = '0x2222222222222222222222222222222222222222'; // USDC
const COMPUTED_ORDER_HASH =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const SIGNATURE_HEX = '0x' + 'a'.repeat(130);

const baseDecimals = 18;
const quoteDecimals = 6;
const priceTickQ = 10_000n; // 0.01 USDC per tick (in atomic)
const minSizeB = 100_000_000_000_000n; // 0.0001 WETH
const minNotionalQ = 1_000_000n; // 1 USDC

const limitPriceTicks = 295_000n; // → $2,950.00
const sizeBase = 1_000_000_000_000_000_000n; // 1 WETH

// For BUY at 2950 USDC for 1 WETH:
//   takerToken = base, makerToken = quote
//   takerAmount = sizeBase = 10^18
//   makerAmount = limitPriceTicks * priceTickQ * sizeBase / 10^baseDecimals
//               = 295000 * 10000 * 10^18 / 10^18 = 2_950_000_000  (2950 USDC)
const expectedMakerAmount =
  (limitPriceTicks * priceTickQ * sizeBase) /
  (() => {
    let r = 1n;
    for (let i = 0; i < baseDecimals; i++) r *= 10n;
    return r;
  })();

const ctx: ValidatorMarketContext = {
  id: 'm1',
  symbol: 'WETH-USDC',
  baseDecimals,
  quoteDecimals,
  baseAddress: BASE_ADDR,
  quoteAddress: QUOTE_ADDR,
  minNotionalQ,
  minSizeB,
  priceTickQ,
};

const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // +24h
// Deterministic absolute expiry for CMR canonical-message signing.
const CMR_AT_UNIX = 2_000_000_000;
// chainId pinned for the CMR canonical message; matches the value the
// validator falls back to when CHAIN_ID is unset (see getChainIdFromEnv).
const TEST_CHAIN_ID = 84532;

function buildBuyZeroExOrder(overrides: Partial<Record<string, unknown>> = {}) {
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
    // 2 hours past intent expiresAt → comfortably above the 60s grace.
    expiry: Math.floor(expiresAt.getTime() / 1000) + 60 * 60 * 2,
    salt: '12345',
    ...overrides,
  };
}

function buildClBody(
  overrides: {
    structuredIntent?: Record<string, unknown>;
    zeroExOrder?: Record<string, unknown>;
    signature?: string;
    preSignedOrderHash?: string;
  } = {},
): CreateIntentBody {
  const raw = {
    owner: OWNER,
    structuredIntent: {
      version: 1,
      type: 'CONDITIONAL_LIMIT',
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: sizeBase.toString(),
      limitPriceTicks: limitPriceTicks.toString(),
      trigger: {
        type: 'PRICE_BELOW',
        reference: 'BEST_ASK',
        priceTicks: '300000',
      },
      expiry: { secsFromActivation: 86400 },
      executionAuthority: 'PRE_SIGNED_LIMIT_ORDER',
      enforcement: 'PASSIVE_ONLY',
      ...(overrides.structuredIntent ?? {}),
    },
    zeroExOrder: overrides.zeroExOrder ?? buildBuyZeroExOrder(),
    signature: overrides.signature ?? SIGNATURE_HEX,
    preSignedOrderHash: overrides.preSignedOrderHash ?? COMPUTED_ORDER_HASH,
  };
  return createIntentBodySchema.parse(raw);
}

type CmrOpts = {
  structuredIntent?: Record<string, unknown>;
  ownerAuth?: 'omit' | 'wrong-signer' | { signature: string };
};

async function buildCmrBody(opts: CmrOpts = {}): Promise<CreateIntentBody> {
  const structuredIntent = {
    version: 1,
    type: 'CONDITIONAL_MARKET_READY',
    marketId: 'WETH-USDC',
    side: 'BUY',
    sizeBase: sizeBase.toString(),
    tif: 'IOC',
    // Phase 4 CMR-v1 natural BUY combo: PRICE_BELOW + BEST_ASK.
    // ("buy when ask drops to or below 350000")
    trigger: {
      type: 'PRICE_BELOW',
      reference: 'BEST_ASK',
      priceTicks: '350000',
    },
    expiry: { atUnix: CMR_AT_UNIX },
    executionAuthority: 'USER_CONFIRMATION_REQUIRED',
    ...(opts.structuredIntent ?? {}),
  };

  const raw: Record<string, unknown> = {
    owner: OWNER,
    structuredIntent,
  };

  if (opts.ownerAuth === 'omit') {
    // leave ownerAuth absent
  } else if (opts.ownerAuth && typeof opts.ownerAuth === 'object') {
    raw.ownerAuth = opts.ownerAuth;
  } else {
    // Sign canonical message with TEST_WALLET (default) or WRONG_WALLET.
    const message = buildCmrOwnerAuthMessage(
      raw as unknown as CreateIntentBody,
      TEST_CHAIN_ID,
    );
    const wallet =
      opts.ownerAuth === 'wrong-signer' ? WRONG_WALLET : TEST_WALLET;
    const signature = await wallet.signMessage(message);
    raw.ownerAuth = { signature };
  }

  return createIntentBodySchema.parse(raw);
}

// ---------- Helpers ----------

type SigningMock = {
  verifySignature: jest.Mock;
  getOrderHash: jest.Mock;
};

type RepoMock = {
  orderHashExists: jest.Mock;
  findActiveByPreSignedHash: jest.Mock;
};

type FloorRepoMock = {
  getFloor: jest.Mock;
  upsertFloor: jest.Mock;
};

function buildValidator(opts?: {
  signing?: Partial<SigningMock>;
  repo?: Partial<RepoMock>;
  floorRepo?: Partial<FloorRepoMock>;
}): {
  validator: IntentValidatorService;
  signing: SigningMock;
  repo: RepoMock;
  floorRepo: FloorRepoMock;
} {
  const signing: SigningMock = {
    verifySignature: jest
      .fn()
      .mockReturnValue({ valid: true, recovered: OWNER }),
    getOrderHash: jest.fn().mockReturnValue(COMPUTED_ORDER_HASH),
    ...(opts?.signing ?? {}),
  } as SigningMock;

  const repo: RepoMock = {
    orderHashExists: jest.fn().mockResolvedValue(false),
    findActiveByPreSignedHash: jest.fn().mockResolvedValue(null),
    ...(opts?.repo ?? {}),
  } as RepoMock;

  const floorRepo: FloorRepoMock = {
    getFloor: jest.fn().mockResolvedValue(null),
    upsertFloor: jest.fn().mockResolvedValue(undefined),
    ...(opts?.floorRepo ?? {}),
  } as FloorRepoMock;

  const validator = new IntentValidatorService(
    signing as unknown as ZeroExSigningService,
    repo as unknown as IntentRepository,
    floorRepo as unknown as import('../../src/onchain/cancel-pair-floor.repository').CancelPairFloorRepository,
  );
  return { validator, signing, repo, floorRepo };
}

async function expectIssues(
  promise: Promise<unknown>,
): Promise<Array<{ code: string }>> {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(BadRequestException);
    const resp = (e as BadRequestException).getResponse() as {
      issues?: Array<{ code: string }>;
    };
    expect(Array.isArray(resp.issues)).toBe(true);
    return resp.issues ?? [];
  }
  throw new Error('expected validator to throw, but it did not');
}

// ---------- Tests ----------

describe('IntentValidatorService.validateAtCreate', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DEV_SKIP_SIGS;
    delete process.env.SEA_FIRE_EXPIRY_GRACE_SECS;
    // Pin chainId so validator's getChainIdFromEnv matches the value used
    // by buildCmrBody when signing the canonical message.
    process.env.CHAIN_ID = String(TEST_CHAIN_ID);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('passes for a well-formed CONDITIONAL_LIMIT body', async () => {
    const { validator } = buildValidator();
    await expect(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
  });

  it('passes for a well-formed CONDITIONAL_MARKET_READY body (valid ownerAuth accepted)', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody();
    await expect(
      validator.validateAtCreate(body, ctx, expiresAt),
    ).resolves.toBeUndefined();
  });

  it('rejects CL with sizeBase below market.minSizeB', async () => {
    const { validator } = buildValidator();
    const tinyCtx: ValidatorMarketContext = {
      ...ctx,
      minSizeB: sizeBase + 1n,
    };
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), tinyCtx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'min_size_violation')).toBe(true);
  });

  it('rejects CL with notional below market.minNotionalQ', async () => {
    const { validator } = buildValidator();
    const richCtx: ValidatorMarketContext = {
      ...ctx,
      minNotionalQ: 10n ** 12n, // 1,000,000 USDC — far above 2,950
    };
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), richCtx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'min_notional_violation')).toBe(true);
  });

  it('does NOT enforce notional for CMR (no execution price at create time)', async () => {
    const { validator } = buildValidator();
    const richCtx: ValidatorMarketContext = {
      ...ctx,
      minNotionalQ: 10n ** 12n,
    };
    const body = await buildCmrBody();
    await expect(
      validator.validateAtCreate(body, richCtx, expiresAt),
    ).resolves.toBeUndefined();
  });

  it('rejects CL when the signature is invalid', async () => {
    const { validator } = buildValidator({
      signing: {
        verifySignature: jest.fn().mockReturnValue({ valid: false }),
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'invalid_signature')).toBe(true);
  });

  it('rejects CL when the recovered signer is not the owner', async () => {
    const { validator } = buildValidator({
      signing: {
        verifySignature: jest.fn().mockReturnValue({
          valid: true,
          recovered: '0xcccccccccccccccccccccccccccccccccccccccc',
        }),
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'signer_mismatch')).toBe(true);
  });

  it('rejects CL when order.maker does not match owner', async () => {
    const { validator } = buildValidator();
    const body = buildClBody({
      zeroExOrder: buildBuyZeroExOrder({
        maker: '0xcccccccccccccccccccccccccccccccccccccccc',
      }),
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'order_maker_mismatch')).toBe(true);
  });

  it('rejects CL when computed orderHash does not match preSignedOrderHash', async () => {
    const { validator } = buildValidator({
      signing: {
        getOrderHash: jest.fn().mockReturnValue('0x' + 'd'.repeat(64)),
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'order_hash_mismatch')).toBe(true);
  });

  it('rejects CL with token-pair mismatch (BUY needs makerToken=quote, takerToken=base)', async () => {
    const { validator } = buildValidator();
    const body = buildClBody({
      zeroExOrder: buildBuyZeroExOrder({
        makerToken: BASE_ADDR, // wrong: BUY should have makerToken=quote
        takerToken: QUOTE_ADDR,
      }),
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'token_pair_mismatch')).toBe(true);
  });

  it('rejects CL when raw makerAmount/takerAmount yield a different sizeBase', async () => {
    const { validator } = buildValidator();
    const body = buildClBody({
      zeroExOrder: buildBuyZeroExOrder({
        // Tamper with takerAmount → derived sizeBase will be off.
        takerAmount: (sizeBase * 2n).toString(),
        makerAmount: (expectedMakerAmount * 2n).toString(),
      }),
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'size_mismatch')).toBe(true);
  });

  it('rejects CL when raw makerAmount/takerAmount yield a different priceTicks', async () => {
    const { validator } = buildValidator();
    // Increase makerAmount only → derived priceTicks differs from declared.
    const body = buildClBody({
      zeroExOrder: buildBuyZeroExOrder({
        makerAmount: (expectedMakerAmount + 10_000n).toString(),
      }),
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'price_mismatch')).toBe(true);
  });

  it('rejects CL when 0x order expiry is closer than the grace window', async () => {
    const { validator } = buildValidator();
    const body = buildClBody({
      zeroExOrder: buildBuyZeroExOrder({
        // 10 seconds before the intent expiry — well within the 60s grace.
        expiry: Math.floor(expiresAt.getTime() / 1000) - 10,
      }),
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'zeroex_order_expiry_too_close')).toBe(
      true,
    );
  });

  it('rejects CL when the orderHash is already present in the Order table', async () => {
    const { validator } = buildValidator({
      repo: { orderHashExists: jest.fn().mockResolvedValue(true) },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'order_already_exists')).toBe(true);
  });

  it('DEV_SKIP_SIGS=1 short-circuits signature/hash checks but still runs other checks', async () => {
    process.env.DEV_SKIP_SIGS = '1';
    const { validator, signing, repo } = buildValidator({
      signing: {
        // These should never be called when DEV_SKIP_SIGS is on.
        verifySignature: jest.fn(),
        getOrderHash: jest.fn(),
      },
    });
    await expect(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
    expect(signing.verifySignature).not.toHaveBeenCalled();
    expect(signing.getOrderHash).not.toHaveBeenCalled();
    // Order existence still checked even in dev-skip mode.
    expect(repo.orderHashExists).toHaveBeenCalled();
  });

  it('aggregates multiple issues into a single thrown response', async () => {
    const { validator } = buildValidator({
      signing: {
        verifySignature: jest.fn().mockReturnValue({ valid: false }),
        getOrderHash: jest.fn().mockReturnValue('0x' + 'd'.repeat(64)),
      },
    });
    const tinyCtx: ValidatorMarketContext = {
      ...ctx,
      minSizeB: sizeBase + 1n,
    };
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), tinyCtx, expiresAt),
    );
    const codes = issues.map((i) => i.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'min_size_violation',
        'invalid_signature',
        'order_hash_mismatch',
      ]),
    );
  });

  // ---------- Phase 2 security/idempotency follow-ups ----------

  it('rejects CMR missing ownerAuth.signature', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({ ownerAuth: 'omit' });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    // Both invariants and the validator's CMR auth block flag this.
    expect(
      issues.some(
        (i) =>
          i.code === 'invalid_owner_auth' || i.code === 'invariant_violation',
      ),
    ).toBe(true);
  });

  it('rejects CMR when ownerAuth signer does not match owner', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({ ownerAuth: 'wrong-signer' });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'owner_auth_signer_mismatch')).toBe(
      true,
    );
  });

  // --- Phase 4 CMR-v1 natural-trigger restriction ---

  it('accepts CMR SELL with the natural PRICE_ABOVE + BEST_BID combination', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({
      structuredIntent: {
        side: 'SELL',
        trigger: {
          type: 'PRICE_ABOVE',
          reference: 'BEST_BID',
          priceTicks: '350000',
        },
      },
    });
    await expect(
      validator.validateAtCreate(body, ctx, expiresAt),
    ).resolves.toBeUndefined();
  });

  it('rejects CMR BUY + PRICE_ABOVE (would need a maxExecutionPrice model, out of scope for v1)', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({
      structuredIntent: {
        side: 'BUY',
        trigger: {
          type: 'PRICE_ABOVE',
          reference: 'BEST_ASK',
          priceTicks: '350000',
        },
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'cmr_trigger_unsupported')).toBe(true);
  });

  it('rejects CMR SELL + PRICE_BELOW (would need a minExecutionPrice model, out of scope for v1)', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({
      structuredIntent: {
        side: 'SELL',
        trigger: {
          type: 'PRICE_BELOW',
          reference: 'BEST_BID',
          priceTicks: '350000',
        },
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'cmr_trigger_unsupported')).toBe(true);
  });

  it('rejects CMR BUY with BEST_BID reference (must reference BEST_ASK)', async () => {
    const { validator } = buildValidator();
    const body = await buildCmrBody({
      structuredIntent: {
        side: 'BUY',
        trigger: {
          type: 'PRICE_BELOW',
          reference: 'BEST_BID',
          priceTicks: '350000',
        },
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(body, ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'cmr_trigger_unsupported')).toBe(true);
  });

  it('rejects CL when a non-terminal Intent already references the same preSignedOrderHash', async () => {
    const { validator } = buildValidator({
      repo: {
        findActiveByPreSignedHash: jest
          .fn()
          .mockResolvedValue({ id: 'existing-intent-id' }),
      },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'duplicate_active_intent')).toBe(true);
  });

  it('allows CL reuse of the same preSignedOrderHash after the prior Intent reached a terminal state (no Order row, no active duplicate)', async () => {
    // Default mocks already simulate this: orderHashExists=false +
    // findActiveByPreSignedHash=null. Be explicit for the test reader.
    const { validator } = buildValidator({
      repo: {
        orderHashExists: jest.fn().mockResolvedValue(false),
        findActiveByPreSignedHash: jest.fn().mockResolvedValue(null),
      },
    });
    await expect(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
  });
});

// ---------- Phase 3 fire-time validator tests ----------

describe('IntentValidatorService.validateAtFire', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DEV_SKIP_SIGS;
    delete process.env.SEA_FIRE_EXPIRY_GRACE_SECS;
    process.env.CHAIN_ID = String(TEST_CHAIN_ID);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // Build a fire input that mirrors what IntentRepository.findActiveCLIntents
  // hands the fire service for our well-formed CL fixture.
  function buildFireInput(overrides: Record<string, unknown> = {}): {
    intentId: string;
    owner: string;
    side: 'BUY' | 'SELL';
    sizeBase: bigint;
    limitPriceTicks: bigint;
    preSignedOrder: unknown;
    preSignedSignatureHex: string;
    preSignedOrderHash: string;
    intentExpiresAt: Date;
    ctx: ValidatorMarketContext;
  } {
    return {
      intentId: 'cl_fire_intent',
      owner: OWNER,
      side: 'BUY',
      sizeBase,
      limitPriceTicks,
      preSignedOrder: buildBuyZeroExOrder(),
      preSignedSignatureHex: SIGNATURE_HEX,
      preSignedOrderHash: COMPUTED_ORDER_HASH,
      intentExpiresAt: expiresAt,
      ctx,
      ...overrides,
    } as ReturnType<typeof buildFireInput>;
  }

  it('passes for a well-formed CL fire input', async () => {
    const { validator } = buildValidator();
    await expect(
      validator.validateAtFire(buildFireInput()),
    ).resolves.toBeUndefined();
  });

  it('rejects when 0x order expiry is closer than the grace window', async () => {
    const { validator } = buildValidator();
    const tampered = buildBuyZeroExOrder({
      // 10s before intent expiry → inside the 60s grace.
      expiry: Math.floor(expiresAt.getTime() / 1000) - 10,
    });
    const issues = await expectIssues(
      validator.validateAtFire(buildFireInput({ preSignedOrder: tampered })),
    );
    expect(issues.some((i) => i.code === 'zeroex_order_expiry_too_close')).toBe(
      true,
    );
  });

  it('rejects when an Order with the same hash is already on the book', async () => {
    const { validator } = buildValidator({
      repo: { orderHashExists: jest.fn().mockResolvedValue(true) },
    });
    const issues = await expectIssues(
      validator.validateAtFire(buildFireInput()),
    );
    expect(issues.some((i) => i.code === 'order_already_exists')).toBe(true);
  });

  it('rejects when current market rules tightened (minSizeB raised)', async () => {
    const { validator } = buildValidator();
    const tightCtx: ValidatorMarketContext = {
      ...ctx,
      minSizeB: sizeBase + 1n,
    };
    const issues = await expectIssues(
      validator.validateAtFire(buildFireInput({ ctx: tightCtx })),
    );
    expect(issues.some((i) => i.code === 'min_size_violation')).toBe(true);
  });

  it('rejects when the EIP-712 signer no longer recovers to the owner', async () => {
    const { validator } = buildValidator({
      signing: {
        verifySignature: jest.fn().mockReturnValue({
          valid: true,
          recovered: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        }),
      },
    });
    const issues = await expectIssues(
      validator.validateAtFire(buildFireInput()),
    );
    expect(issues.some((i) => i.code === 'signer_mismatch')).toBe(true);
  });

  it('rejects when computed orderHash no longer matches the stored declared hash', async () => {
    const { validator } = buildValidator({
      signing: {
        getOrderHash: jest.fn().mockReturnValue('0x' + 'd'.repeat(64)),
      },
    });
    const issues = await expectIssues(
      validator.validateAtFire(buildFireInput()),
    );
    expect(issues.some((i) => i.code === 'order_hash_mismatch')).toBe(true);
  });
});

// ---------- Phase 2.1 cancel-auth tests ----------

describe('IntentValidatorService.verifyCancelAuth', () => {
  const ORIGINAL_ENV = process.env;
  const INTENT_ID = 'cl_intent_xyz';

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DEV_SKIP_SIGS;
    process.env.CHAIN_ID = String(TEST_CHAIN_ID);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  async function signCancel(
    wallet: Wallet,
    intentOwner: string,
    intentId: string,
  ): Promise<string> {
    const message = buildCancelOwnerAuthMessage({
      chainId: TEST_CHAIN_ID,
      owner: intentOwner,
      intentId,
    });
    return wallet.signMessage(message);
  }

  it('accepts a cancel signed by the intent owner', async () => {
    const { validator } = buildValidator();
    const signature = await signCancel(TEST_WALLET, OWNER, INTENT_ID);
    expect(() =>
      validator.verifyCancelAuth({
        intentId: INTENT_ID,
        intentOwner: OWNER,
        signature,
      }),
    ).not.toThrow();
  });

  it('rejects a cancel signed by a non-owner wallet', async () => {
    const { validator } = buildValidator();
    const signature = await signCancel(WRONG_WALLET, OWNER, INTENT_ID);
    let caught: BadRequestException | undefined;
    try {
      validator.verifyCancelAuth({
        intentId: INTENT_ID,
        intentOwner: OWNER,
        signature,
      });
    } catch (e) {
      caught = e as BadRequestException;
    }
    expect(caught).toBeInstanceOf(BadRequestException);
    const resp = caught!.getResponse() as {
      message: string;
      issues: Array<{ code: string }>;
    };
    expect(resp.message).toBe('cancel_auth_failed');
    expect(
      resp.issues.some((i) => i.code === 'owner_auth_signer_mismatch'),
    ).toBe(true);
  });

  it('rejects a cancel with a malformed signature (recovery failure)', async () => {
    const { validator } = buildValidator();
    let caught: BadRequestException | undefined;
    try {
      validator.verifyCancelAuth({
        intentId: INTENT_ID,
        intentOwner: OWNER,
        // Hex-shaped but not a real ECDSA signature; verifyMessage throws.
        signature: '0x' + 'a'.repeat(130),
      });
    } catch (e) {
      caught = e as BadRequestException;
    }
    expect(caught).toBeInstanceOf(BadRequestException);
    const resp = caught!.getResponse() as {
      message: string;
      issues: Array<{ code: string }>;
    };
    expect(resp.message).toBe('cancel_auth_failed');
    expect(
      resp.issues.some(
        (i) =>
          i.code === 'invalid_owner_auth' ||
          i.code === 'owner_auth_signer_mismatch',
      ),
    ).toBe(true);
  });

  it('DEV_SKIP_SIGS=1 bypasses signature recovery (signature still required by schema)', () => {
    process.env.DEV_SKIP_SIGS = '1';
    const { validator } = buildValidator();
    expect(() =>
      validator.verifyCancelAuth({
        intentId: INTENT_ID,
        intentOwner: OWNER,
        // Any well-formed hex string passes — verification is skipped.
        signature: '0x' + 'a'.repeat(130),
      }),
    ).not.toThrow();
  });
});

// ---------- Phase 3.x-b cancelPair floor tests ----------

describe('CancelPairFloor enforcement (validateAtCreate + validateAtFire)', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DEV_SKIP_SIGS;
    process.env.CHAIN_ID = String(TEST_CHAIN_ID);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // The CL fixture's underlying 0x order has `salt: '12345'` (see
  // buildBuyZeroExOrder above). Pick a floor strictly above that to
  // simulate a maker who already invalidated the salt on-chain.
  const FLOOR_ABOVE = 100_000n;
  // And a floor strictly below to confirm valid intents still pass.
  const FLOOR_BELOW = 1n;

  it('validateAtCreate: passes for CL when no floor exists for the triple', async () => {
    const { validator, floorRepo } = buildValidator();
    await expect(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
    expect(floorRepo.getFloor).toHaveBeenCalledTimes(1);
  });

  it('validateAtCreate: rejects CL when stored floor is above order.salt', async () => {
    const { validator } = buildValidator({
      floorRepo: { getFloor: jest.fn().mockResolvedValue(FLOOR_ABOVE) },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'cancel_pair_floor_above_salt')).toBe(
      true,
    );
  });

  it('validateAtCreate: passes when floor is below order.salt', async () => {
    const { validator } = buildValidator({
      floorRepo: { getFloor: jest.fn().mockResolvedValue(FLOOR_BELOW) },
    });
    await expect(
      validator.validateAtCreate(buildClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
  });

  it('validateAtFire: rejects when stored floor is above order.salt', async () => {
    const { validator } = buildValidator({
      floorRepo: { getFloor: jest.fn().mockResolvedValue(FLOOR_ABOVE) },
    });
    const fireInput = {
      intentId: 'cl_fire_floor',
      owner: OWNER,
      side: 'BUY' as const,
      sizeBase,
      limitPriceTicks,
      preSignedOrder: buildBuyZeroExOrder(),
      preSignedSignatureHex: SIGNATURE_HEX,
      preSignedOrderHash: COMPUTED_ORDER_HASH,
      intentExpiresAt: expiresAt,
      ctx,
    };
    const issues = await expectIssues(validator.validateAtFire(fireInput));
    expect(issues.some((i) => i.code === 'cancel_pair_floor_above_salt')).toBe(
      true,
    );
  });

  it('validateAtFire: passes when no floor exists', async () => {
    const { validator } = buildValidator();
    const fireInput = {
      intentId: 'cl_fire_no_floor',
      owner: OWNER,
      side: 'BUY' as const,
      sizeBase,
      limitPriceTicks,
      preSignedOrder: buildBuyZeroExOrder(),
      preSignedSignatureHex: SIGNATURE_HEX,
      preSignedOrderHash: COMPUTED_ORDER_HASH,
      intentExpiresAt: expiresAt,
      ctx,
    };
    await expect(validator.validateAtFire(fireInput)).resolves.toBeUndefined();
  });

  // CL SELL parity tests. The original P0 crash happened on SELL because
  // the floor row exists for the SELL direction (makerToken=base,
  // takerToken=quote). Once the repository conversion is fixed, getFloor
  // returns a bigint and these tests confirm the validator's CL SELL
  // floor-check path behaves symmetrically with the existing CL BUY tests.
  // For a SELL at the same prices: makerToken=base, takerToken=quote,
  // makerAmount=sizeBase (1 WETH sold), takerAmount=expectedMakerAmount
  // (2950 USDC received). Trigger is PRICE_ABOVE+BEST_BID (the only valid
  // SELL combination in runPhase1Invariants).
  function buildSellClBody(
    overrides: {
      structuredIntent?: Record<string, unknown>;
      zeroExOrder?: Record<string, unknown>;
    } = {},
  ): CreateIntentBody {
    const sellZeroExOrder = {
      ...buildBuyZeroExOrder(),
      makerToken: BASE_ADDR,
      takerToken: QUOTE_ADDR,
      makerAmount: sizeBase.toString(),
      takerAmount: expectedMakerAmount.toString(),
      ...(overrides.zeroExOrder ?? {}),
    };
    return buildClBody({
      structuredIntent: {
        side: 'SELL',
        trigger: {
          type: 'PRICE_ABOVE',
          reference: 'BEST_BID',
          priceTicks: '300000',
        },
        ...(overrides.structuredIntent ?? {}),
      },
      zeroExOrder: sellZeroExOrder,
    });
  }

  it('validateAtCreate: CL SELL passes when no floor exists (no crash on the SELL path)', async () => {
    const { validator, floorRepo } = buildValidator();
    await expect(
      validator.validateAtCreate(buildSellClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
    // Confirms the floor lookup actually ran for the SELL direction.
    expect(floorRepo.getFloor).toHaveBeenCalledTimes(1);
    const lookupArgs = floorRepo.getFloor.mock.calls[0];
    // CL SELL queries (owner, makerToken=base, takerToken=quote).
    expect(lookupArgs[1].toLowerCase()).toBe(BASE_ADDR.toLowerCase());
    expect(lookupArgs[2].toLowerCase()).toBe(QUOTE_ADDR.toLowerCase());
  });

  it('validateAtCreate: CL SELL rejects with cancel_pair_floor_above_salt when floor > order.salt', async () => {
    const { validator } = buildValidator({
      floorRepo: { getFloor: jest.fn().mockResolvedValue(FLOOR_ABOVE) },
    });
    const issues = await expectIssues(
      validator.validateAtCreate(buildSellClBody(), ctx, expiresAt),
    );
    expect(issues.some((i) => i.code === 'cancel_pair_floor_above_salt')).toBe(
      true,
    );
  });

  it('validateAtCreate: CL SELL passes when floor <= order.salt', async () => {
    const { validator } = buildValidator({
      floorRepo: { getFloor: jest.fn().mockResolvedValue(FLOOR_BELOW) },
    });
    await expect(
      validator.validateAtCreate(buildSellClBody(), ctx, expiresAt),
    ).resolves.toBeUndefined();
  });
});
