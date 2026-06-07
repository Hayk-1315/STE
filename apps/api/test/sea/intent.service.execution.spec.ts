// apps/api/test/sea/intent.service.execution.spec.ts
//
// Phase 4.x-b: IntentService.lockWallet + markExecuting orchestrator tests.
// All collaborators are mocked; the EIP-191 verifier is covered separately
// in intent-validator.spec.ts (we just assert the orchestrator calls it).
// Receipt fetches go through a JsonRpcProvider that we never construct
// (RPC_URL_READONLY/RPC_URL are unset in these tests), so the receipt
// pre-check returns 'pending_or_unknown' and falls through.

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IntentService } from '../../src/sea/intent.service';
import type {
  IntentRepository,
  IntentDto,
} from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import type { IntentValidatorService } from '../../src/sea/intent-validator.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import {
  issueExecutionToken,
  issueLockNonce,
} from '../../src/sea/execution-token.util';

const OWNER = '0xAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAaa';
const INTENT_ID = 'cmr_xyz';
const MARKET_ID = 'm1';
const CHAIN_ID = 84532;

const READY_PREPARED_AT = new Date('2026-05-31T00:00:00.000Z');
const NOW = READY_PREPARED_AT.getTime() + 5_000; // 5s after prepared
const HARD_EXPIRY = new Date(NOW + 60 * 60 * 1000); // +1h

const NONCE_SECRET = 'a-strong-nonce-secret-' + 'x'.repeat(20);
const TOKEN_SECRET = 'b-strong-token-secret-' + 'x'.repeat(20);

function buildReadyIntent(overrides: Partial<IntentDto> = {}): IntentDto {
  return {
    id: INTENT_ID,
    owner: OWNER.toLowerCase(),
    marketId: MARKET_ID,
    type: 'CONDITIONAL_MARKET_READY',
    status: 'READY',
    side: 'BUY',
    sizeBase: '1000000000000000000',
    limitPriceTicks: null,
    tif: 'IOC',
    triggerType: 'PRICE_BELOW',
    triggerReference: 'BEST_ASK',
    triggerPriceTicks: '300000',
    executionAuthority: 'USER_CONFIRMATION_REQUIRED',
    preSignedOrderHash: null,
    linkedOrderHash: null,
    preparedQuote: { ttlSec: 60, fills: [] },
    preparedQuoteAt: READY_PREPARED_AT.toISOString(),
    cooldownUntilAt: null,
    linkedTxHash: null,
    walletLockUntilAt: null,
    expiresAt: HARD_EXPIRY.toISOString(),
    failureReason: null,
    rawText: null,
    createdAt: '2026-05-30T00:00:00.000Z',
    updatedAt: '2026-05-31T00:00:00.000Z',
    ...overrides,
  } as IntentDto;
}

type RepoMock = {
  findById: jest.Mock;
  lockWalletFromReady: jest.Mock;
  markExecutedFromReady: jest.Mock;
  markFailedFromReady: jest.Mock;
  markExecuting: jest.Mock;
  transitionStatus: jest.Mock;
};
type PersistenceMock = {
  findTradeByTxHashForIntent: jest.Mock;
};
type ValidatorMock = {
  verifyWalletLockAuth: jest.Mock;
  verifyCancelAuth: jest.Mock;
};

function buildService(opts?: {
  intent?: IntentDto | null;
  lockOk?: boolean;
  markExecutingOk?: boolean;
  markExecutedFromReadyOk?: boolean;
  markFailedFromReadyOk?: boolean;
  trade?: { id: bigint; makerOrderHash: string; sizeBase: string } | null;
  validatorThrows?: Error;
}): {
  service: IntentService;
  repo: RepoMock;
  events: { append: jest.Mock };
  validator: ValidatorMock;
  persistence: PersistenceMock;
} {
  const intent = opts?.intent === undefined ? buildReadyIntent() : opts.intent;
  const reloadIntent = intent === null ? null : { ...intent }; // findById returns the same shape after transition

  const repo: RepoMock = {
    findById: jest.fn().mockResolvedValue(intent),
    lockWalletFromReady: jest.fn().mockResolvedValue(opts?.lockOk ?? true),
    markExecutedFromReady: jest
      .fn()
      .mockResolvedValue(opts?.markExecutedFromReadyOk ?? true),
    markFailedFromReady: jest
      .fn()
      .mockResolvedValue(opts?.markFailedFromReadyOk ?? true),
    markExecuting: jest.fn().mockResolvedValue(opts?.markExecutingOk ?? true),
    transitionStatus: jest.fn(),
  };
  // After any transition, findById returns the row again.
  if (reloadIntent) {
    repo.findById = jest.fn().mockResolvedValue(reloadIntent);
  }

  const events = { append: jest.fn().mockResolvedValue(undefined) };
  const validator: ValidatorMock = {
    verifyWalletLockAuth: jest.fn().mockImplementation(() => {
      if (opts?.validatorThrows) throw opts.validatorThrows;
    }),
    verifyCancelAuth: jest.fn(),
  };
  const persistence: PersistenceMock = {
    findTradeByTxHashForIntent: jest
      .fn()
      .mockResolvedValue(opts?.trade ?? null),
  };

  const service = new IntentService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
    validator as unknown as IntentValidatorService,
    persistence as unknown as PersistenceRepository,
  );
  return { service, repo, events, validator, persistence };
}

function deriveLockNonce(preparedQuoteAt = READY_PREPARED_AT) {
  return issueLockNonce(NONCE_SECRET, {
    intentId: INTENT_ID,
    owner: OWNER.toLowerCase(),
    preparedQuoteAt,
    chainId: CHAIN_ID,
  });
}

function deriveExecutionToken(
  walletLockUntilAt: Date,
  lockNonce = deriveLockNonce(),
) {
  return issueExecutionToken(TOKEN_SECRET, {
    intentId: INTENT_ID,
    owner: OWNER.toLowerCase(),
    chainId: CHAIN_ID,
    walletLockUntilAt,
    lockNonce,
  });
}

describe('IntentService.lockWallet', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.CHAIN_ID = String(CHAIN_ID);
    process.env.SEA_LOCK_NONCE_SECRET = NONCE_SECRET;
    process.env.SEA_EXECUTION_TOKEN_SECRET = TOKEN_SECRET;
    process.env.SEA_WALLET_LOCK_SEC = '300';
    process.env.PROFILE = 'dev';
    delete process.env.DEV_SKIP_SIGS;
    jest.useFakeTimers().setSystemTime(NOW);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
    jest.useRealTimers();
  });

  function buildOwnerAuth(
    overrides: Partial<{
      signature: string;
      lockNonce: string;
      walletLockUntilAt: string;
    }> = {},
  ) {
    const proposalUntil = new Date(
      Math.min(NOW + 300_000, HARD_EXPIRY.getTime()),
    );
    return {
      ownerAuth: {
        signature: '0x' + 'a'.repeat(130),
        lockNonce: deriveLockNonce(),
        walletLockUntilAt: proposalUntil.toISOString(),
        ...overrides,
      },
    };
  }

  it('happy path: stamps walletLockUntilAt and returns executionToken', async () => {
    const { service, repo, validator } = buildService();
    const out = await service.lockWallet(INTENT_ID, buildOwnerAuth());
    expect(out.executionToken).toEqual(expect.any(String));
    expect(out.walletLockUntilAt).toBeDefined();
    expect(validator.verifyWalletLockAuth).toHaveBeenCalledTimes(1);
    expect(repo.lockWalletFromReady).toHaveBeenCalledTimes(1);
  });

  it('rejects when intent is not READY', async () => {
    const { service } = buildService({
      intent: buildReadyIntent({ status: 'ACTIVE' }),
    });
    await expect(
      service.lockWallet(INTENT_ID, buildOwnerAuth()),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects with intent_expired when now >= intent.expiresAt (Blocker 1)', async () => {
    const { service } = buildService({
      intent: buildReadyIntent({ expiresAt: new Date(NOW).toISOString() }),
    });
    await expect(
      service.lockWallet(INTENT_ID, buildOwnerAuth()),
    ).rejects.toThrow(/intent_expired/);
  });

  it('rejects with ready_ttl_expired when now > preparedQuoteAt + ttlSec*1000', async () => {
    const old = new Date(NOW - 120_000); // 2 min ago; ttl=60s
    const { service } = buildService({
      intent: buildReadyIntent({ preparedQuoteAt: old.toISOString() }),
    });
    const auth = buildOwnerAuth({
      lockNonce: issueLockNonce(NONCE_SECRET, {
        intentId: INTENT_ID,
        owner: OWNER.toLowerCase(),
        preparedQuoteAt: old,
        chainId: CHAIN_ID,
      }),
    });
    await expect(service.lockWallet(INTENT_ID, auth)).rejects.toThrow(
      /ready_ttl_expired/,
    );
  });

  it('rejects lockNonce mismatch (different preparedQuoteAt)', async () => {
    const { service } = buildService();
    const auth = buildOwnerAuth({
      lockNonce: issueLockNonce(NONCE_SECRET, {
        intentId: INTENT_ID,
        owner: OWNER.toLowerCase(),
        preparedQuoteAt: new Date(READY_PREPARED_AT.getTime() + 1),
        chainId: CHAIN_ID,
      }),
    });
    await expect(service.lockWallet(INTENT_ID, auth)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects walletLockUntilAt > 5s skew from server value', async () => {
    const { service } = buildService();
    const skewed = new Date(NOW + 300_000 + 10_000).toISOString();
    await expect(
      service.lockWallet(
        INTENT_ID,
        buildOwnerAuth({ walletLockUntilAt: skewed }),
      ),
    ).rejects.toThrow(/wallet_lock_until_mismatch/);
  });

  it('clamps walletLockUntilAt to intent.expiresAt (Blocker 1)', async () => {
    // Hard expiry only 60s out; SEA_WALLET_LOCK_SEC=300.
    process.env.SEA_WALLET_LOCK_SEC = '300';
    const tightExpiry = new Date(NOW + 60_000);
    const { service } = buildService({
      intent: buildReadyIntent({ expiresAt: tightExpiry.toISOString() }),
    });
    const auth = buildOwnerAuth({
      walletLockUntilAt: tightExpiry.toISOString(),
    });
    const out = await service.lockWallet(INTENT_ID, auth);
    expect(out.walletLockUntilAt).toBe(tightExpiry.toISOString());
  });

  it('idempotent re-POST returns the same executionToken for an active lock (Blocker 1)', async () => {
    const proposalUntil = new Date(NOW + 300_000);
    // First call.
    const { service: svc1 } = buildService();
    const r1 = await svc1.lockWallet(INTENT_ID, buildOwnerAuth());
    // Second call: intent now has walletLockUntilAt populated. Same nonce
    // and same walletLockUntilAt → returns the same token without
    // re-verifying signature.
    const { service: svc2, validator } = buildService({
      intent: buildReadyIntent({
        walletLockUntilAt: proposalUntil.toISOString(),
      }),
    });
    const r2 = await svc2.lockWallet(
      INTENT_ID,
      buildOwnerAuth({ walletLockUntilAt: proposalUntil.toISOString() }),
    );
    expect(r2.executionToken).toBe(r1.executionToken);
    expect(validator.verifyWalletLockAuth).not.toHaveBeenCalled();
  });

  it('rejects when validator throws on signer mismatch', async () => {
    const { service } = buildService({
      validatorThrows: new BadRequestException('wallet_lock_auth_failed'),
    });
    await expect(
      service.lockWallet(INTENT_ID, buildOwnerAuth()),
    ).rejects.toThrow(/wallet_lock_auth_failed/);
  });

  it('rejects status_changed_concurrently when the atomic UPDATE lost the race', async () => {
    const { service } = buildService({ lockOk: false });
    await expect(
      service.lockWallet(INTENT_ID, buildOwnerAuth()),
    ).rejects.toThrow(/status_changed_concurrently/);
  });
});

describe('IntentService.markExecuting', () => {
  const ORIGINAL_ENV = process.env;
  const TX = ('0x' + 'f'.repeat(64)) as `0x${string}`;
  const lockUntil = new Date(NOW + 300_000);

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.CHAIN_ID = String(CHAIN_ID);
    process.env.SEA_LOCK_NONCE_SECRET = NONCE_SECRET;
    process.env.SEA_EXECUTION_TOKEN_SECRET = TOKEN_SECRET;
    process.env.PROFILE = 'dev';
    delete process.env.RPC_URL;
    delete process.env.RPC_URL_READONLY;
    delete process.env.DEV_SKIP_SIGS;
    jest.useFakeTimers().setSystemTime(NOW);
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
    jest.useRealTimers();
  });

  function lockedIntent(o: Partial<IntentDto> = {}): IntentDto {
    return buildReadyIntent({
      walletLockUntilAt: lockUntil.toISOString(),
      ...o,
    });
  }

  it('normal path: READY → EXECUTING with linkedTxHash', async () => {
    const { service, repo, events } = buildService({
      intent: lockedIntent(),
    });
    const token = deriveExecutionToken(lockUntil);
    await service.markExecuting(INTENT_ID, {
      txHash: TX,
      executionToken: token,
    });
    expect(repo.markExecuting).toHaveBeenCalledWith(INTENT_ID, TX);
    expect(events.append).toHaveBeenCalledWith(
      INTENT_ID,
      expect.stringMatching(/EXECUTING/),
      expect.objectContaining({ txHash: TX }),
    );
  });

  it('fast-path A: Trade exists → READY → EXECUTED (single transition)', async () => {
    const trade = { id: 1n, makerOrderHash: '0xmaker', sizeBase: '12345' };
    const { service, repo, events, persistence } = buildService({
      intent: lockedIntent(),
      trade,
    });
    const token = deriveExecutionToken(lockUntil);
    await service.markExecuting(INTENT_ID, {
      txHash: TX,
      executionToken: token,
    });
    expect(persistence.findTradeByTxHashForIntent).toHaveBeenCalledWith({
      txHash: TX.toLowerCase(),
      marketId: MARKET_ID,
      owner: OWNER.toLowerCase(),
    });
    expect(repo.markExecutedFromReady).toHaveBeenCalledTimes(1);
    expect(repo.markExecuting).not.toHaveBeenCalled();
    expect(events.append).toHaveBeenCalledWith(
      INTENT_ID,
      expect.stringMatching(/EXECUTING/),
      expect.objectContaining({ txHash: TX.toLowerCase() }),
    );
    expect(events.append).toHaveBeenCalledWith(
      INTENT_ID,
      expect.stringMatching(/EXECUTED/),
      expect.objectContaining({ viaLateMarker: true }),
    );
  });

  it('rejects on token tamper with 401 (Blocker 3 — wrong owner)', async () => {
    const { service } = buildService({ intent: lockedIntent() });
    const wrong = issueExecutionToken(TOKEN_SECRET, {
      intentId: INTENT_ID,
      owner: '0xBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBbb',
      chainId: CHAIN_ID,
      walletLockUntilAt: lockUntil,
      lockNonce: deriveLockNonce(),
    });
    await expect(
      service.markExecuting(INTENT_ID, { txHash: TX, executionToken: wrong }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects with wallet_lock_expired when lockUntil < now', async () => {
    const { service } = buildService({
      intent: lockedIntent({
        walletLockUntilAt: new Date(NOW - 1000).toISOString(),
      }),
    });
    const token = deriveExecutionToken(new Date(NOW - 1000));
    await expect(
      service.markExecuting(INTENT_ID, { txHash: TX, executionToken: token }),
    ).rejects.toThrow(/wallet_lock_expired/);
  });

  it('idempotency: re-POST on EXECUTING with matching linkedTxHash returns the row', async () => {
    const reused = buildReadyIntent({
      status: 'EXECUTING',
      linkedTxHash: TX.toLowerCase(),
    });
    const { service, repo } = buildService({ intent: reused });
    const token = deriveExecutionToken(lockUntil);
    const out = await service.markExecuting(INTENT_ID, {
      txHash: TX,
      executionToken: token,
    });
    expect(out.status).toBe('EXECUTING');
    expect(repo.markExecuting).not.toHaveBeenCalled();
  });

  it('conflict: re-POST on EXECUTING with different linkedTxHash → 409', async () => {
    const other =
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    const reused = buildReadyIntent({
      status: 'EXECUTING',
      linkedTxHash: other,
    });
    const { service } = buildService({ intent: reused });
    const token = deriveExecutionToken(lockUntil);
    await expect(
      service.markExecuting(INTENT_ID, { txHash: TX, executionToken: token }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects on non-READY/EXECUTING/EXECUTED/FAILED status', async () => {
    const { service } = buildService({
      intent: buildReadyIntent({ status: 'CANCELLED' }),
    });
    const token = deriveExecutionToken(lockUntil);
    await expect(
      service.markExecuting(INTENT_ID, { txHash: TX, executionToken: token }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('Blocker 4 (wrong market): findTradeByTxHashForIntent returns null → falls through to EXECUTING', async () => {
    const { service, repo, persistence } = buildService({
      intent: lockedIntent(),
      trade: null, // simulates the ownership-bound DB filter excluding the foreign-market row.
    });
    const token = deriveExecutionToken(lockUntil);
    await service.markExecuting(INTENT_ID, {
      txHash: TX,
      executionToken: token,
    });
    expect(persistence.findTradeByTxHashForIntent).toHaveBeenCalledTimes(1);
    expect(repo.markExecuting).toHaveBeenCalledTimes(1);
    expect(repo.markExecutedFromReady).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when intent does not exist', async () => {
    const { service } = buildService({ intent: null });
    await expect(
      service.markExecuting(INTENT_ID, {
        txHash: TX,
        executionToken: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
