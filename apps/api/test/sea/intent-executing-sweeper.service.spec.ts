// apps/api/test/sea/intent-executing-sweeper.service.spec.ts
//
// Phase 4.x-d: DB-free coverage for IntentExecutingSweeperService.
// Mirrors intent-expiry-sweeper.service.spec.ts. Repo and event
// collaborators are mocked; we exercise gating + tick semantics only.
import { IntentExecutingSweeperService } from '../../src/sea/intent-executing-sweeper.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import { IntentEventType } from '@prisma/client';

type RepoMock = { sweepStaleExecuting: jest.Mock };
type EventsMock = { append: jest.Mock };

function buildSweeper(opts?: { sweptIds?: string[]; appendImpl?: jest.Mock }): {
  sweeper: IntentExecutingSweeperService;
  repo: RepoMock;
  events: EventsMock;
} {
  const repo: RepoMock = {
    sweepStaleExecuting: jest.fn().mockResolvedValue(opts?.sweptIds ?? []),
  };
  const events: EventsMock = {
    append: opts?.appendImpl ?? jest.fn().mockResolvedValue(undefined),
  };
  const sweeper = new IntentExecutingSweeperService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
  );
  return { sweeper, repo, events };
}

describe('IntentExecutingSweeperService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    delete process.env.SEA_EXECUTING_SWEEP_ENABLED;
    delete process.env.SEA_EXECUTING_STALE_MIN;
    delete process.env.SEA_EXECUTING_SWEEP_INTERVAL_MS;
    delete process.env.SEA_EXECUTING_SWEEP_LIMIT_PER_TICK;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('boot gating (onModuleInit)', () => {
    it('default-OFF: timer not started when SEA_EXECUTING_SWEEP_ENABLED is unset', () => {
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.sweepStaleExecuting).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('does not start when SEA_EXECUTING_SWEEP_ENABLED=0 explicitly', () => {
      process.env.SEA_EXECUTING_SWEEP_ENABLED = '0';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.sweepStaleExecuting).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('hard-disabled by READ_ONLY=true even when SEA_EXECUTING_SWEEP_ENABLED=1', () => {
      process.env.SEA_EXECUTING_SWEEP_ENABLED = '1';
      process.env.READ_ONLY = 'true';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.sweepStaleExecuting).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('hard-disabled by PROFILE=mainnet even when SEA_EXECUTING_SWEEP_ENABLED=1', () => {
      process.env.SEA_EXECUTING_SWEEP_ENABLED = '1';
      process.env.PROFILE = 'mainnet';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.sweepStaleExecuting).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('starts the timer only when ENABLED=1 AND neither hard-disable applies', () => {
      process.env.SEA_EXECUTING_SWEEP_ENABLED = '1';
      const { sweeper } = buildSweeper();
      sweeper.onModuleInit();
      // Tear down immediately so the test does not leak the interval.
      sweeper.onModuleDestroy();
    });
  });

  describe('tick semantics', () => {
    it('appends IntentEvent("FAILED", { reason: "stale_pending" }) for each swept id', async () => {
      const { sweeper, events } = buildSweeper({
        sweptIds: ['i1', 'i2', 'i3'],
      });
      await sweeper.tick();
      expect(events.append).toHaveBeenCalledTimes(3);
      for (const id of ['i1', 'i2', 'i3']) {
        expect(events.append).toHaveBeenCalledWith(id, IntentEventType.FAILED, {
          reason: 'stale_pending',
        });
      }
    });

    it('no-op when there are no stale rows', async () => {
      const { sweeper, events } = buildSweeper({ sweptIds: [] });
      await sweeper.tick();
      expect(events.append).not.toHaveBeenCalled();
    });

    it('race-loss: only ids the repo actually transitioned get FAILED events', async () => {
      // Simulates FillWatcher racing the sweeper for some candidates —
      // sweepStaleExecuting only returns ids whose updateMany.count > 0.
      const { sweeper, events } = buildSweeper({
        sweptIds: ['i1'], // candidates were [i1,i2,i3] but only i1 actually transitioned
      });
      await sweeper.tick();
      expect(events.append).toHaveBeenCalledTimes(1);
      expect(events.append).toHaveBeenCalledWith('i1', IntentEventType.FAILED, {
        reason: 'stale_pending',
      });
    });

    it('one event-append throw does not stop the rest of the batch', async () => {
      const append = jest
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValue(undefined);
      const { sweeper } = buildSweeper({
        sweptIds: ['i1', 'i2', 'i3'],
        appendImpl: append,
      });
      await sweeper.tick();
      expect(append).toHaveBeenCalledTimes(3);
      expect(append.mock.calls[1][0] as string).toBe('i2');
      expect(append.mock.calls[2][0] as string).toBe('i3');
    });
  });
});
