// apps/api/test/sea/delegated/delegated-executor.worker.spec.ts
//
// Gating: the executor must NEVER boot a live loop unless the exec gate is open
// AND a session signer is configured. processOne: verifies the safety-critical
// flow — validate before claim, race-safe claim, receipt-verified confirm,
// never fake success, and restore manual fallback on a pre-submit failure.
import { DelegatedExecutorWorker } from '../../../src/sea/delegated/delegated-executor.worker';
import { resolveDelegationConfig } from '../../../src/sea/delegated/delegation.config';
import type { DelegationProvider } from '../../../src/sea/delegated/delegation-provider.interface';
import type { DelegatedIntentTransitionRepository } from '../../../src/sea/delegated/delegated-intent-transition.repository';
import type { DelegatedFillBuilder } from '../../../src/sea/delegated/delegated-fill.builder';
import type { DelegatedExecutionAuditRepository } from '../../../src/sea/delegated/delegated-execution-audit.repository';
import type { DelegatedFillReconcilerService } from '../../../src/sea/delegated/delegated-fill-reconciler.service';
import type { SessionSignerProvider } from '../../../src/sea/delegated/session-signer.provider';

const timerOf = (w: DelegatedExecutorWorker): unknown =>
  (w as unknown as { timer?: unknown }).timer;

const EP = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
const TAKER = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238';
const goodFreshQuote = {
  marketId: 'm1',
  side: 'BUY' as const,
  fillsCount: 1,
  remainingBaseB: 0n,
  takerToken: TAKER,
  takerFillAmountQ: 2_000_000n,
  takerTotalAmountQ: 2_020_000n,
};

function makeGrant() {
  return {
    id: 'grant-1',
    chainId: 11155111,
    profile: 'ethereum-sepolia',
    target: EP,
    functionSelector: '0xf6274f66',
    spendToken: TAKER,
    spendCapQ: { toString: () => '2020000' },
    usageLimit: 1,
    validUntil: new Date(Date.now() + 3_600_000),
    accountModel: 'EIP7702',
    permissionId: 'perm-1',
    meta: {
      accountAddress: '0x' + 'a'.repeat(40),
      enableData: 'enable-1',
      maxTakerFillAmountQ: '2000000',
    },
  } as any;
}
const INTENT = {
  id: 'intent-1',
  marketId: 'm1',
  side: 'BUY',
  sizeBase: { toString: () => '1000000000000000000' },
  triggerPriceTicks: { toString: () => '3000' },
} as any;

function buildWorker(opts: {
  env: NodeJS.ProcessEnv;
  signerAvailable?: boolean;
  execute?: jest.Mock;
  fill?: jest.Mock;
  reconcile?: jest.Mock;
}) {
  const transitions = {
    findExecutable: jest.fn().mockResolvedValue([]),
    claimExecuting: jest.fn().mockResolvedValue(true),
    releaseToReady: jest.fn().mockResolvedValue(true),
    markExecuted: jest.fn().mockResolvedValue(true),
    markFailed: jest.fn().mockResolvedValue(true),
    setGrantStatus: jest.fn().mockResolvedValue(undefined),
  };
  const fillBuilder = {
    buildFreshFill:
      opts.fill ??
      jest.fn().mockResolvedValue({
        ok: true,
        target: EP,
        calldata: '0xfill',
        freshQuote: goodFreshQuote,
        expected: {
          orderHash: '0x' + '1'.repeat(64),
          taker: '0x' + 'a'.repeat(40),
          takerToken: TAKER,
          takerFillAmount: 2_000_000n,
          execBase: 1_000_000_000_000_000_000n,
          priceTicks: 3000n,
        },
      }),
  };
  const audit = { append: jest.fn().mockResolvedValue(undefined) };
  const reconciler = {
    reconcileConfirmedFill:
      opts.reconcile ??
      jest.fn().mockResolvedValue({ reconciled: true, status: 'filled' }),
  };
  const signer = { isAvailable: () => opts.signerAvailable ?? true };
  const provider = {
    kind: 'MOCK',
    execute: opts.execute ?? jest.fn(),
  } as unknown as DelegationProvider;

  const worker = new DelegatedExecutorWorker(
    resolveDelegationConfig(opts.env),
    provider,
    transitions as unknown as DelegatedIntentTransitionRepository,
    fillBuilder as unknown as DelegatedFillBuilder,
    audit as unknown as DelegatedExecutionAuditRepository,
    reconciler as unknown as DelegatedFillReconcilerService,
    signer as unknown as SessionSignerProvider,
  );
  return { worker, transitions, fillBuilder, audit, provider, reconciler };
}

const SEPOLIA_EXEC = {
  PROFILE: 'sepolia',
  SEA_DELEGATED_ENABLED: '1',
  SEA_DELEGATED_EXEC_ENABLED: '1',
} as unknown as NodeJS.ProcessEnv;

describe('DelegatedExecutorWorker — gating', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('inert by default (flags off)', () => {
    process.env.PROFILE = 'sepolia';
    const { worker } = buildWorker({
      env: { PROFILE: 'sepolia' } as NodeJS.ProcessEnv,
    });
    worker.onModuleInit();
    expect(timerOf(worker)).toBeUndefined();
    worker.onModuleDestroy();
  });

  it('inert on base-mainnet even with both flags', () => {
    process.env.PROFILE = 'mainnet';
    const { worker } = buildWorker({
      env: {
        PROFILE: 'mainnet',
        SEA_DELEGATED_ENABLED: '1',
        SEA_DELEGATED_EXEC_ENABLED: '1',
      } as unknown as NodeJS.ProcessEnv,
    });
    worker.onModuleInit();
    expect(timerOf(worker)).toBeUndefined();
    worker.onModuleDestroy();
  });

  it('inert under READ_ONLY', () => {
    process.env.PROFILE = 'sepolia';
    process.env.READ_ONLY = 'true';
    const { worker } = buildWorker({
      env: {
        ...SEPOLIA_EXEC,
        READ_ONLY: 'true',
      } as unknown as NodeJS.ProcessEnv,
    });
    worker.onModuleInit();
    expect(timerOf(worker)).toBeUndefined();
    worker.onModuleDestroy();
  });

  it('inert when exec gate open but the session signer is unavailable', () => {
    process.env.PROFILE = 'sepolia';
    const { worker } = buildWorker({
      env: SEPOLIA_EXEC,
      signerAvailable: false,
    });
    worker.onModuleInit();
    expect(timerOf(worker)).toBeUndefined();
    worker.onModuleDestroy();
  });

  it('starts the live loop only when exec gate open AND signer available', () => {
    process.env.PROFILE = 'sepolia';
    const { worker } = buildWorker({ env: SEPOLIA_EXEC });
    worker.onModuleInit();
    expect(timerOf(worker)).toBeDefined();
    worker.onModuleDestroy();
  });
});

describe('DelegatedExecutorWorker — processOne', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.PROFILE = 'sepolia';
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  const run = (w: DelegatedExecutorWorker, grant = makeGrant()) =>
    (
      w as unknown as { processOne: (i: unknown, g: unknown) => Promise<void> }
    ).processOne(INTENT, grant);

  it('confirmed fill → markExecuted + grant USED + audit CONFIRMED', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ok: true, confirmed: true, txHash: '0xabc' });
    const { worker, transitions, audit } = buildWorker({
      env: SEPOLIA_EXEC,
      execute,
    });
    await run(worker);
    expect(transitions.claimExecuting).toHaveBeenCalledWith('intent-1');
    expect(transitions.markExecuted).toHaveBeenCalledWith('intent-1', '0xabc');
    expect(transitions.setGrantStatus).toHaveBeenCalledWith('grant-1', 'USED');
    expect(audit.append).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'CONFIRMED', txHash: '0xabc' }),
    );
    expect(transitions.releaseToReady).not.toHaveBeenCalled();
  });

  it('confirmed fill → reconciles maker-side state (Recent Trades / orderbook / My Orders)', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ok: true, confirmed: true, txHash: '0xabc' });
    const { worker, reconciler } = buildWorker({ env: SEPOLIA_EXEC, execute });
    await run(worker);
    // The reconciler is invoked with the matched order, filled base, taker (SA),
    // price, and the confirmed userOp tx hash — the same facts a manual fill uses.
    expect(reconciler.reconcileConfirmedFill).toHaveBeenCalledTimes(1);
    expect(reconciler.reconcileConfirmedFill).toHaveBeenCalledWith({
      marketId: 'm1',
      orderHash: '0x' + '1'.repeat(64),
      execBase: 1_000_000_000_000_000_000n,
      taker: '0x' + 'a'.repeat(40),
      priceTicks: 3000n,
      txHash: '0xabc',
    });
  });

  it('idempotency: reconciliation runs ONLY when markExecuted actually transitioned', async () => {
    // markExecuted returns false → another caller already moved EXECUTING->EXECUTED
    // (or a retry). Reconciliation must NOT run, so the fill cannot be double-counted.
    const execute = jest
      .fn()
      .mockResolvedValue({ ok: true, confirmed: true, txHash: '0xabc' });
    const { worker, reconciler, transitions } = buildWorker({
      env: SEPOLIA_EXEC,
      execute,
    });
    (transitions.markExecuted as jest.Mock).mockResolvedValueOnce(false);
    await run(worker);
    expect(reconciler.reconcileConfirmedFill).not.toHaveBeenCalled();
  });

  it('reconciler failure never breaks the tick (fill already on-chain + EXECUTED)', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ok: true, confirmed: true, txHash: '0xabc' });
    // The reconciler swallows its own errors and returns a result; even if it
    // rejected, processOne must not throw.
    const reconcile = jest
      .fn()
      .mockRejectedValue(new Error('db blip during reconcile'));
    const { worker, transitions } = buildWorker({
      env: SEPOLIA_EXEC,
      execute,
      reconcile,
    });
    await expect(run(worker)).resolves.toBeUndefined();
    expect(transitions.markExecuted).toHaveBeenCalledWith('intent-1', '0xabc');
  });

  it('unverified fill → no reconciliation (never touch product state on uncertain fill)', async () => {
    const execute = jest.fn().mockResolvedValue({
      ok: true,
      confirmed: false,
      txHash: '0xdef',
      reason: 'fill_unverified',
    });
    const { worker, reconciler } = buildWorker({ env: SEPOLIA_EXEC, execute });
    await run(worker);
    expect(reconciler.reconcileConfirmedFill).not.toHaveBeenCalled();
  });

  it('submitted but unverified → markFailed (never faked success)', async () => {
    const execute = jest.fn().mockResolvedValue({
      ok: true,
      confirmed: false,
      txHash: '0xdef',
      reason: 'fill_unverified',
    });
    const { worker, transitions } = buildWorker({ env: SEPOLIA_EXEC, execute });
    await run(worker);
    expect(transitions.markExecuted).not.toHaveBeenCalled();
    expect(transitions.markFailed).toHaveBeenCalledWith(
      'intent-1',
      'fill_unverified',
      '0xdef',
    );
    expect(transitions.releaseToReady).not.toHaveBeenCalled();
  });

  it('pre-submit rejection (no tx) → releaseToReady (manual fallback preserved)', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ok: false, reason: 'submit_rejected' });
    const { worker, transitions } = buildWorker({ env: SEPOLIA_EXEC, execute });
    await run(worker);
    expect(transitions.releaseToReady).toHaveBeenCalledWith('intent-1');
    expect(transitions.markExecuted).not.toHaveBeenCalled();
    expect(transitions.markFailed).not.toHaveBeenCalled();
  });

  it('validation failure → no claim, no execute, audit REJECTED', async () => {
    const execute = jest.fn();
    const badFill = jest.fn().mockResolvedValue({
      ok: true,
      target: EP,
      calldata: '0xfill',
      // remaining > 0 → fails full-size validation
      freshQuote: { ...goodFreshQuote, remainingBaseB: 1n },
      expected: {
        orderHash: '0x' + '1'.repeat(64),
        taker: '0x' + 'a'.repeat(40),
        takerToken: TAKER,
        takerFillAmount: 2_000_000n,
      },
    });
    const { worker, transitions, audit } = buildWorker({
      env: SEPOLIA_EXEC,
      execute,
      fill: badFill,
    });
    await run(worker);
    expect(transitions.claimExecuting).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
    expect(audit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'REJECTED',
        reason: 'not_full_size',
      }),
    );
  });

  it('lost claim race → does not execute', async () => {
    const execute = jest.fn();
    const { worker, transitions } = buildWorker({ env: SEPOLIA_EXEC, execute });
    transitions.claimExecuting.mockResolvedValueOnce(false);
    await run(worker);
    expect(execute).not.toHaveBeenCalled();
  });
});
