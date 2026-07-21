// apps/api/test/sea/delegated/mock-delegation.provider.spec.ts
//
// The Phase 1/2 default provider must be deterministic and NEVER submit or
// confirm anything (execute() can never fake a live fill).
import { MockDelegationProvider } from '../../../src/sea/delegated/mock-delegation.provider';
import { buildCmrDelegationPolicy } from '../../../src/sea/delegated/cmr-delegation-policy.builder';

const policy = buildCmrDelegationPolicy({
  chainId: 11155111,
  profile: 'ethereum-sepolia',
  exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  spendToken: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  takerFillAmountQ: 2_000_000n,
  takerFeeAmountQ: 20_000n,
  validUntilUnix: 1_900_000_000,
  accountModel: 'EIP7702',
});

describe('MockDelegationProvider', () => {
  const p = new MockDelegationProvider();

  it('reports MOCK kind and supported capabilities', async () => {
    expect(p.kind).toBe('MOCK');
    const caps = await p.capabilities({
      chainId: 11155111,
      profile: 'ethereum-sepolia',
    });
    expect(caps.supported).toBe(true);
    expect(caps.accountModels).toEqual(['EIP7702', 'NEXUS_SA']);
  });

  it('prepareGrant returns a digest deterministically (no signing/network)', async () => {
    const r = await p.prepareGrant({
      intentId: 'intent-1',
      owner: '0x' + '9'.repeat(40),
      accountModel: 'EIP7702',
      policy,
      sessionKeyAddress: '0x' + '7'.repeat(40),
    });
    expect(r.ok).toBe(true);
    expect(r.enableDigest).toBe('0xmockdigest-intent-1');
    expect(r.needsDelegation).toBe(true);
  });

  it('finalizeGrant returns a deterministic permission id + enable data', async () => {
    const r = await p.finalizeGrant({
      intentId: 'intent-1',
      owner: '0x' + '9'.repeat(40),
      sessionBlob: 'mock-session-intent-1',
      ownerSignature: '0xsig',
    });
    expect(r.ok).toBe(true);
    expect(r.permissionId).toBe('mock-permission-intent-1');
    expect(r.enableData).toBe('mock-enable-intent-1');
  });

  it('execute is a NOOP that never submits or confirms', async () => {
    const r = await p.execute();
    expect(r.ok).toBe(false);
    expect(r.confirmed).toBe(false);
    expect(r.txHash).toBeUndefined();
    expect(r.reason).toBe('mock-provider-noop');
  });

  it('prepareGrant NEXUS_SA reports needsDelegation=false (no 7702)', async () => {
    const r = await p.prepareGrant({
      intentId: 'intent-2',
      owner: '0x' + '9'.repeat(40),
      accountModel: 'NEXUS_SA',
      policy,
      sessionKeyAddress: '0x' + '7'.repeat(40),
    });
    expect(r.ok).toBe(true);
    expect(r.needsDelegation).toBe(false);
  });

  it('saStatus returns deterministic setup facts (no network)', async () => {
    const r = await p.saStatus({
      owner: '0x' + '9'.repeat(40),
      accountModel: 'NEXUS_SA',
      spendToken: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      requiredTokenQ: 2_020_000n,
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    });
    expect(r.ok).toBe(true);
    expect(r.smartAccountAddress).toContain('0xmockSA-');
    expect(r.needsDeployment).toBe(false);
    expect(r.needsApproval).toBe(false);
    expect(r.requiredTokenQ).toBe('2020000');
  });
});
