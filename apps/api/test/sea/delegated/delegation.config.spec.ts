// apps/api/test/sea/delegated/delegation.config.spec.ts
//
// Profile-keyed config: base-mainnet is ALWAYS non-writable/disabled; Sepolia is
// writable only when the flag is on and READ_ONLY is not set; unknown → base.
import {
  resolveDelegationConfig,
  resolveDelegationProfile,
} from '../../../src/sea/delegated/delegation.config';

describe('resolveDelegationProfile', () => {
  it('maps PROFILE=sepolia → ethereum-sepolia', () => {
    expect(resolveDelegationProfile({ PROFILE: 'sepolia' })).toBe(
      'ethereum-sepolia',
    );
  });
  it('maps PROFILE=mainnet → base-mainnet', () => {
    expect(resolveDelegationProfile({ PROFILE: 'mainnet' })).toBe(
      'base-mainnet',
    );
  });
  it('infers from CHAIN_ID when PROFILE is unset', () => {
    expect(resolveDelegationProfile({ CHAIN_ID: 11155111 })).toBe(
      'ethereum-sepolia',
    );
    expect(resolveDelegationProfile({ CHAIN_ID: 8453 })).toBe('base-mainnet');
  });
  it('defaults unknown → base-mainnet (safe, non-writable)', () => {
    expect(resolveDelegationProfile({})).toBe('base-mainnet');
    expect(resolveDelegationProfile({ PROFILE: 'dev' })).toBe('base-mainnet');
  });
});

describe('resolveDelegationConfig', () => {
  it('base-mainnet: non-writable and disabled even with flag on + READ_ONLY unset', () => {
    const cfg = resolveDelegationConfig({
      PROFILE: 'mainnet',
      SEA_DELEGATED_ENABLED: '1',
      SEA_DELEGATED_EXEC_ENABLED: '1',
    });
    expect(cfg.profile).toBe('base-mainnet');
    expect(cfg.writable).toBe(false);
    expect(cfg.enabled).toBe(false);
    expect(cfg.execEnabled).toBe(false);
    expect(cfg.disabledReason).toMatch(/read-only/);
  });

  it('sepolia: disabled by default (flag off)', () => {
    const cfg = resolveDelegationConfig({ PROFILE: 'sepolia' });
    expect(cfg.profile).toBe('ethereum-sepolia');
    expect(cfg.writable).toBe(true);
    expect(cfg.enabled).toBe(false);
    expect(cfg.disabledReason).toBe('SEA_DELEGATED_ENABLED!=1');
  });

  it('sepolia: enabled only when flag on and not READ_ONLY', () => {
    const on = resolveDelegationConfig({
      PROFILE: 'sepolia',
      SEA_DELEGATED_ENABLED: '1',
    });
    expect(on.enabled).toBe(true);
    expect(on.execEnabled).toBe(false); // exec flag still off

    const ro = resolveDelegationConfig({
      PROFILE: 'sepolia',
      SEA_DELEGATED_ENABLED: '1',
      READ_ONLY: 'true',
    });
    expect(ro.enabled).toBe(false);
    expect(ro.disabledReason).toBe('READ_ONLY=true');
  });

  it('sepolia: execEnabled requires BOTH flags and enabled', () => {
    const cfg = resolveDelegationConfig({
      PROFILE: 'sepolia',
      SEA_DELEGATED_ENABLED: '1',
      SEA_DELEGATED_EXEC_ENABLED: '1',
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.execEnabled).toBe(true);
  });

  it('gas model is account-funded with no paymaster (v1)', () => {
    const cfg = resolveDelegationConfig({ PROFILE: 'sepolia' });
    expect(cfg.gas).toEqual({ model: 'account-funded', paymaster: false });
  });

  it('provider defaults to MOCK; biconomy is recorded but still mock-backed in Phase 1', () => {
    expect(resolveDelegationConfig({ PROFILE: 'sepolia' }).provider).toBe(
      'MOCK',
    );
    expect(
      resolveDelegationConfig({
        PROFILE: 'sepolia',
        SEA_DELEGATED_PROVIDER: 'biconomy',
      }).provider,
    ).toBe('BICONOMY');
  });
});
