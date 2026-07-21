// apps/api/test/sea/delegated/delegation.guard.spec.ts
//
// Every delegated write/exec path must pass these gates. Verifies base-mainnet,
// READ_ONLY, PROFILE=mainnet, and default-flags-off all REJECT.
import {
  delegationWriteGate,
  delegationExecGate,
} from '../../../src/sea/delegated/delegation.guard';
import { resolveDelegationConfig } from '../../../src/sea/delegated/delegation.config';

const cfgFor = (env: Record<string, string>) =>
  resolveDelegationConfig(env as NodeJS.ProcessEnv);

describe('delegationWriteGate', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('rejects base-mainnet even with flag on', () => {
    const gate = delegationWriteGate(
      cfgFor({ PROFILE: 'mainnet', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/base-mainnet|read-only/);
  });

  it('rejects when default flags disable (sepolia, flag off)', () => {
    process.env.PROFILE = 'sepolia';
    const gate = delegationWriteGate(cfgFor({ PROFILE: 'sepolia' }));
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toBe('SEA_DELEGATED_ENABLED!=1');
  });

  it('rejects when READ_ONLY=true (belt-and-braces, even if flag on)', () => {
    process.env.READ_ONLY = 'true';
    process.env.PROFILE = 'sepolia';
    const gate = delegationWriteGate(
      cfgFor({
        PROFILE: 'sepolia',
        SEA_DELEGATED_ENABLED: '1',
        READ_ONLY: 'true',
      }),
    );
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toBe('READ_ONLY=true');
  });

  it('rejects when PROFILE=mainnet env is set (belt-and-braces)', () => {
    process.env.PROFILE = 'mainnet';
    // Config resolves sepolia but the env guard still blocks.
    const gate = delegationWriteGate(
      cfgFor({ PROFILE: 'sepolia', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toBe('PROFILE=mainnet');
  });

  it('allows only sepolia + flag on + not READ_ONLY + not mainnet', () => {
    process.env.PROFILE = 'sepolia';
    const gate = delegationWriteGate(
      cfgFor({ PROFILE: 'sepolia', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(gate.allowed).toBe(true);
    expect(gate.reason).toBeUndefined();
  });
});

describe('delegationExecGate', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
    process.env.PROFILE = 'sepolia';
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('rejects when writeGate rejects (base-mainnet)', () => {
    process.env.PROFILE = 'mainnet';
    const gate = delegationExecGate(
      cfgFor({
        PROFILE: 'mainnet',
        SEA_DELEGATED_ENABLED: '1',
        SEA_DELEGATED_EXEC_ENABLED: '1',
      }),
    );
    expect(gate.allowed).toBe(false);
  });

  it('rejects when exec flag off even if write gate open', () => {
    const gate = delegationExecGate(
      cfgFor({ PROFILE: 'sepolia', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toBe('SEA_DELEGATED_EXEC_ENABLED!=1');
  });

  it('allows only when write gate open AND exec flag on', () => {
    const gate = delegationExecGate(
      cfgFor({
        PROFILE: 'sepolia',
        SEA_DELEGATED_ENABLED: '1',
        SEA_DELEGATED_EXEC_ENABLED: '1',
      }),
    );
    expect(gate.allowed).toBe(true);
  });
});
