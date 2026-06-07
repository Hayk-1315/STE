// apps/api/test/sea/intent.service.spec.ts
// DB-free service tests for the Phase 2.1 cancel auth + lifecycle
// behavior. All collaborators are mocked; only IntentService logic is
// exercised. The validator's signature recovery is itself covered in
// intent-validator.spec.ts.
import { ConflictException, NotFoundException } from '@nestjs/common';
import { IntentService } from '../../src/sea/intent.service';
import type { IntentRepository } from '../../src/sea/intent.repository';
import type { IntentEventRepository } from '../../src/sea/intent-event.repository';
import type { IntentValidatorService } from '../../src/sea/intent-validator.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';

function buildService(opts: {
  intent?: Record<string, unknown> | null;
  validatorThrows?: Error;
  transitionResult?: Record<string, unknown> | null;
}): {
  service: IntentService;
  repo: { findById: jest.Mock; transitionStatus: jest.Mock };
  events: { append: jest.Mock };
  validator: { verifyCancelAuth: jest.Mock };
} {
  const repo = {
    findById: jest.fn().mockResolvedValue(opts.intent ?? null),
    transitionStatus: jest
      .fn()
      .mockResolvedValue(opts.transitionResult ?? opts.intent ?? null),
  };
  const events = { append: jest.fn().mockResolvedValue(undefined) };
  const validator = {
    verifyCancelAuth: jest.fn().mockImplementation(() => {
      if (opts.validatorThrows) throw opts.validatorThrows;
    }),
  };
  const persistence = {} as unknown as PersistenceRepository;

  const service = new IntentService(
    repo as unknown as IntentRepository,
    events as unknown as IntentEventRepository,
    validator as unknown as IntentValidatorService,
    persistence,
  );
  return { service, repo, events, validator };
}

const OWNER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const SIG_HEX = '0x' + 'a'.repeat(130);
const INTENT_ID = 'cl_intent_xyz';

describe('IntentService.cancel', () => {
  it('throws NotFoundException when the intent does not exist', async () => {
    const { service } = buildService({ intent: null });
    await expect(service.cancel(INTENT_ID, SIG_HEX)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('explicitly rejects cancel on a terminal-state intent (CANCELLED) with cannot_cancel_status', async () => {
    const intent = {
      id: INTENT_ID,
      owner: OWNER,
      status: 'CANCELLED',
    };
    const { service, validator, repo, events } = buildService({ intent });

    let caught: unknown;
    try {
      await service.cancel(INTENT_ID, SIG_HEX);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ConflictException);
    expect((caught as Error).message).toBe('cannot_cancel_status:CANCELLED');

    // Auth ran (validator was invoked), but the lifecycle gate then blocked
    // the transition — no DB write, no event appended.
    expect(validator.verifyCancelAuth).toHaveBeenCalledTimes(1);
    expect(repo.transitionStatus).not.toHaveBeenCalled();
    expect(events.append).not.toHaveBeenCalled();
  });

  it('explicitly rejects cancel on PLACED (terminal lifecycle handed off to the linked Order)', async () => {
    const intent = {
      id: INTENT_ID,
      owner: OWNER,
      status: 'PLACED',
    };
    const { service } = buildService({ intent });
    let caught: unknown;
    try {
      await service.cancel(INTENT_ID, SIG_HEX);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ConflictException);
    expect((caught as Error).message).toBe('cannot_cancel_status:PLACED');
  });
});
