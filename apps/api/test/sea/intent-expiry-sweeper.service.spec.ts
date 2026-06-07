// apps/api/test/sea/intent-expiry-sweeper.service.spec.ts
// DB-free coverage for IntentExpirySweeperService.
// Repo and event collaborators are mocked; we only exercise sweeper logic
// (gating + tick semantics + per-event resilience).
import { IntentExpirySweeperService } from '../../src/sea/intent-expiry-sweeper.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import { IntentEventType } from '@prisma/client';

type RepoMock = { expireDueIntents: jest.Mock };
type EventsMock = { append: jest.Mock };

function buildSweeper(opts?: {
  expiredIds?: string[];
  appendImpl?: jest.Mock;
}): {
  sweeper: IntentExpirySweeperService;
  repo: RepoMock;
  events: EventsMock;
} {
  const repo: RepoMock = {
    expireDueIntents: jest.fn().mockResolvedValue(opts?.expiredIds ?? []),
  };
  const events: EventsMock = {
    append: opts?.appendImpl ?? jest.fn().mockResolvedValue(undefined),
  };
  const sweeper = new IntentExpirySweeperService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
  );
  return { sweeper, repo, events };
}

describe('IntentExpirySweeperService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    delete process.env.SEA_INTENT_EXPIRY_ENABLED;
    delete process.env.SEA_INTENT_EXPIRY_INTERVAL_MS;
    delete process.env.SEA_INTENT_EXPIRY_LIMIT_PER_TICK;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('boot gating (onModuleInit)', () => {
    it('does not start the timer when SEA_INTENT_EXPIRY_ENABLED=0', () => {
      process.env.SEA_INTENT_EXPIRY_ENABLED = '0';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.expireDueIntents).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('does not start the timer when READ_ONLY=true', () => {
      process.env.READ_ONLY = 'true';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.expireDueIntents).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('does not start the timer when PROFILE=mainnet', () => {
      process.env.PROFILE = 'mainnet';
      const { sweeper, repo } = buildSweeper();
      sweeper.onModuleInit();
      expect(repo.expireDueIntents).not.toHaveBeenCalled();
      sweeper.onModuleDestroy();
    });

    it('default-on: starts the timer with no env overrides', () => {
      const { sweeper } = buildSweeper();
      sweeper.onModuleInit();
      // Tear down immediately so the test does not leak the interval.
      sweeper.onModuleDestroy();
    });
  });

  describe('tick semantics', () => {
    it('emits IntentEvent("EXPIRED", { reason }) for each expired id', async () => {
      const { sweeper, events } = buildSweeper({
        expiredIds: ['i1', 'i2', 'i3'],
      });
      await sweeper.tick();
      expect(events.append).toHaveBeenCalledTimes(3);
      for (const id of ['i1', 'i2', 'i3']) {
        expect(events.append).toHaveBeenCalledWith(
          id,
          IntentEventType.EXPIRED,
          { reason: 'intent_expired_by_ts' },
        );
      }
    });

    it('no-op when there are no due intents', async () => {
      const { sweeper, events } = buildSweeper({ expiredIds: [] });
      await sweeper.tick();
      expect(events.append).not.toHaveBeenCalled();
    });

    it('one event-append throw does not stop the rest of the batch', async () => {
      const append = jest
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValue(undefined);
      const { sweeper } = buildSweeper({
        expiredIds: ['i1', 'i2', 'i3'],
        appendImpl: append,
      });
      await sweeper.tick();
      expect(append).toHaveBeenCalledTimes(3);
      // First call rejected, but the loop continued — second and third
      // calls were still made for ids i2 and i3.
      expect(append.mock.calls[1][0] as string).toBe('i2');
      expect(append.mock.calls[2][0] as string).toBe('i3');
    });
  });
});
