// apps/api/test/sea/intent.repository.execution.spec.ts
//
// Phase 4.x-b + 4.x-c: lock the Prisma WHERE-clause shape for the new
// SEA execution-lifecycle methods. The Blocker 4 ownership guarantee
// (foreign txHash / cross-market / wrong-taker cannot drive a state
// transition) lives in `findExecutingByTxHashForOwner`'s WHERE clause —
// this spec is its load-bearing test.
import { IntentRepository } from '../../src/sea/intent.repository';
import { IntentStatus } from '@prisma/client';

type PrismaStub = {
  intent: {
    findFirst: jest.Mock;
    updateMany: jest.Mock;
  };
};

function buildRepo(opts?: {
  findFirstResult?: unknown;
  updateManyCount?: number;
}) {
  const prisma: PrismaStub = {
    intent: {
      findFirst: jest.fn().mockResolvedValue(opts?.findFirstResult ?? null),
      updateMany: jest
        .fn()
        .mockResolvedValue({ count: opts?.updateManyCount ?? 1 }),
    },
  };
  const repo = new IntentRepository();
  (repo as unknown as { prisma: PrismaStub }).prisma = prisma;
  return { repo, prisma };
}

const TX = '0x' + 'a'.repeat(64);
const TX_UPPER = TX.toUpperCase();

describe('IntentRepository.findExecutingByTxHashForOwner (Blocker 4)', () => {
  it('binds all three constraints in ONE WHERE clause (lowercased)', async () => {
    const { repo, prisma } = buildRepo({
      findFirstResult: { id: 'i_1' },
    });
    const out = await repo.findExecutingByTxHashForOwner({
      txHash: TX_UPPER,
      marketId: 'm1',
      owner: '0xAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
    expect(out).toEqual({ id: 'i_1' });
    expect(prisma.intent.findFirst).toHaveBeenCalledTimes(1);
    const call = prisma.intent.findFirst.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(call.where).toEqual({
      status: IntentStatus.EXECUTING,
      linkedTxHash: TX, // lowercased
      marketId: 'm1',
      owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
  });

  it('returns null when no row matches all four constraints (Blocker 4 lock)', async () => {
    const { repo } = buildRepo({ findFirstResult: null });
    const out = await repo.findExecutingByTxHashForOwner({
      txHash: TX,
      marketId: 'm_other',
      owner: '0xb'.repeat(40 / 2 + 1).slice(0, 42),
    });
    expect(out).toBeNull();
  });
});

describe('IntentRepository.markExecuted (Phase 4.x-c)', () => {
  it('UPDATE is compound-where on (id, status=EXECUTING, linkedTxHash) and lowercases the hash', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    const ok = await repo.markExecuted('i_2', TX_UPPER);
    expect(ok).toBe(true);
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.where).toEqual({
      id: 'i_2',
      status: IntentStatus.EXECUTING,
      linkedTxHash: TX,
    });
    expect(call.data.status).toBe(IntentStatus.EXECUTED);
  });

  it('returns false on lost race (updateMany.count === 0)', async () => {
    const { repo } = buildRepo({ updateManyCount: 0 });
    const ok = await repo.markExecuted('i_3', TX);
    expect(ok).toBe(false);
  });
});

describe('IntentRepository.markFailedFromExecuting (Phase 4.x-c revert)', () => {
  it('UPDATE stamps failureReason and lowercases the hash', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    await repo.markFailedFromExecuting('i_4', TX_UPPER, 'tx_reverted');
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.where).toEqual({
      id: 'i_4',
      status: IntentStatus.EXECUTING,
      linkedTxHash: TX,
    });
    // linkedTxHash stays in the WHERE clause (already on the row); only
    // status + failureReason change in data.
    expect(call.data).toEqual(
      expect.objectContaining({
        status: IntentStatus.FAILED,
        failureReason: 'tx_reverted',
      }),
    );
    expect(call.data.linkedTxHash).toBeUndefined();
  });
});

describe('IntentRepository.lockWalletFromReady (Phase 4.x-b)', () => {
  it('UPDATE is compound-where on (id, status=READY, preparedQuoteAt) — defends against monitor re-arm', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    const preparedAt = new Date('2026-05-31T00:00:00.000Z');
    const lockUntil = new Date('2026-05-31T00:05:00.000Z');
    const ok = await repo.lockWalletFromReady('i_lock', preparedAt, lockUntil);
    expect(ok).toBe(true);
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.where).toEqual({
      id: 'i_lock',
      status: IntentStatus.READY,
      preparedQuoteAt: preparedAt,
    });
    expect(call.data).toEqual({ walletLockUntilAt: lockUntil });
  });
});

describe('IntentRepository.sweepStaleExecuting (Phase 4.x-d)', () => {
  function buildRepoForSweep(opts: {
    candidates: Array<{ id: string }>;
    updateCounts: number[];
  }) {
    const prisma = {
      intent: {
        findMany: jest.fn().mockResolvedValue(opts.candidates),
        updateMany: jest.fn().mockImplementation(() => {
          const next = opts.updateCounts.shift() ?? 0;
          return Promise.resolve({ count: next });
        }),
      },
    };
    const repo = new IntentRepository();
    (repo as unknown as { prisma: typeof prisma }).prisma = prisma;
    return { repo, prisma };
  }

  it('findMany WHERE binds status=EXECUTING and updatedAt < cutoff', async () => {
    const { repo, prisma } = buildRepoForSweep({
      candidates: [],
      updateCounts: [],
    });
    const now = Date.now();
    await repo.sweepStaleExecuting(50, 10 * 60_000);
    const call = prisma.intent.findMany.mock.calls[0][0] as {
      where: { status: string; updatedAt: { lt: Date } };
      select: Record<string, true>;
      take: number;
      orderBy: Record<string, string>;
    };
    expect(call.where.status).toBe(IntentStatus.EXECUTING);
    expect(call.where.updatedAt.lt).toBeInstanceOf(Date);
    expect(call.where.updatedAt.lt.getTime()).toBeLessThanOrEqual(
      now - 10 * 60_000 + 1000,
    );
    expect(call.select).toEqual({ id: true });
    expect(call.take).toBe(50);
    expect(call.orderBy).toEqual({ updatedAt: 'asc' });
  });

  it('updateMany WHERE retains status=EXECUTING + updatedAt cutoff + id (race-safe)', async () => {
    const { repo, prisma } = buildRepoForSweep({
      candidates: [{ id: 'i_stale' }],
      updateCounts: [1],
    });
    await repo.sweepStaleExecuting(10, 10 * 60_000);
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: { id: string; status: string; updatedAt: { lt: Date } };
      data: Record<string, unknown>;
    };
    expect(call.where.id).toBe('i_stale');
    expect(call.where.status).toBe(IntentStatus.EXECUTING);
    expect(call.where.updatedAt.lt).toBeInstanceOf(Date);
    expect(call.data).toEqual(
      expect.objectContaining({
        status: IntentStatus.FAILED,
        failureReason: 'stale_pending',
      }),
    );
  });

  it('returns only ids whose updateMany.count > 0 (lost-race rows excluded)', async () => {
    const { repo } = buildRepoForSweep({
      candidates: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      updateCounts: [1, 0, 1],
    });
    const out = await repo.sweepStaleExecuting(10, 10 * 60_000);
    expect(out).toEqual(['a', 'c']);
  });

  it('caps take to 500 even when caller asks for more', async () => {
    const { repo, prisma } = buildRepoForSweep({
      candidates: [],
      updateCounts: [],
    });
    await repo.sweepStaleExecuting(10_000, 10 * 60_000);
    const call = prisma.intent.findMany.mock.calls[0][0] as { take: number };
    expect(call.take).toBe(500);
  });
});

describe('IntentRepository.markExecuting / markExecutedFromReady / markFailedFromReady', () => {
  it('markExecuting: READY → EXECUTING + linkedTxHash', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    await repo.markExecuting('i_a', TX_UPPER);
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.where).toEqual({ id: 'i_a', status: IntentStatus.READY });
    expect(call.data).toEqual(
      expect.objectContaining({
        status: IntentStatus.EXECUTING,
        linkedTxHash: TX,
      }),
    );
  });

  it('markExecutedFromReady: READY → EXECUTED + linkedTxHash (fast-path A)', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    await repo.markExecutedFromReady('i_b', TX);
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.where).toEqual({ id: 'i_b', status: IntentStatus.READY });
    expect(call.data.status).toBe(IntentStatus.EXECUTED);
  });

  it('markFailedFromReady: READY → FAILED + failureReason (fast-path B)', async () => {
    const { repo, prisma } = buildRepo({ updateManyCount: 1 });
    await repo.markFailedFromReady('i_c', TX, 'tx_reverted_at_marker');
    const call = prisma.intent.updateMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(call.data).toEqual(
      expect.objectContaining({
        status: IntentStatus.FAILED,
        failureReason: 'tx_reverted_at_marker',
      }),
    );
  });
});
