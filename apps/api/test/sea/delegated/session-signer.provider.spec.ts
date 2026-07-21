// apps/api/test/sea/delegated/session-signer.provider.spec.ts
//
// The session signer is a backend-held, policy-scoped key. It must load ONLY
// when the feature is enabled, never when disabled/base-mainnet, and never
// expose the raw key. This is NOT a user key.
import { SessionSignerProvider } from '../../../src/sea/delegated/session-signer.provider';
import { resolveDelegationConfig } from '../../../src/sea/delegated/delegation.config';

// Throwaway well-known test key (NOT a real/user key).
const TEST_PK =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

const cfgFor = (env: Record<string, string>) =>
  resolveDelegationConfig(env as NodeJS.ProcessEnv);

describe('SessionSignerProvider', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DELEGATION_SESSION_SIGNER_PK;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('does NOT load the key when the feature is disabled (even if the env is set)', async () => {
    process.env.DELEGATION_SESSION_SIGNER_PK = TEST_PK;
    const s = new SessionSignerProvider(cfgFor({ PROFILE: 'sepolia' })); // flag off
    expect(s.isAvailable()).toBe(false);
    expect(await s.getAddress()).toBeNull();
  });

  it('does NOT load the key on base-mainnet even with the flag on', () => {
    process.env.DELEGATION_SESSION_SIGNER_PK = TEST_PK;
    const s = new SessionSignerProvider(
      cfgFor({ PROFILE: 'mainnet', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(s.isAvailable()).toBe(false);
  });

  it('is unavailable when enabled but no key is set', () => {
    const s = new SessionSignerProvider(
      cfgFor({ PROFILE: 'sepolia', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(s.isAvailable()).toBe(false);
  });

  it('loads only when enabled + key set (address/signing validated in the gated harness)', () => {
    process.env.DELEGATION_SESSION_SIGNER_PK = TEST_PK;
    const s = new SessionSignerProvider(
      cfgFor({ PROFILE: 'sepolia', SEA_DELEGATED_ENABLED: '1' }),
    );
    expect(s.isAvailable()).toBe(true);
    // No public accessor returns the raw key; only isAvailable/getAddress/
    // signUserOpHash/toLocalAccount exist (the last three need viem = ESM and
    // run only under RUN_DELEGATED_LIVE / at runtime).
    expect(
      typeof (s as unknown as { getPrivateKey?: unknown }).getPrivateKey,
    ).toBe('undefined');
  });
});
