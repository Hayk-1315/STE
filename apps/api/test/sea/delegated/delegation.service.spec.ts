// apps/api/test/sea/delegated/delegation.service.spec.ts
//
// The orchestrator must refuse every write while disabled (default) and only
// exercise the (mock) provider on a writable, enabled profile with a configured
// session signer. No user keys are involved.
import { DelegationService } from '../../../src/sea/delegated/delegation.service';
import { MockDelegationProvider } from '../../../src/sea/delegated/mock-delegation.provider';
import { resolveDelegationConfig } from '../../../src/sea/delegated/delegation.config';
import type { DelegationGrantRepository } from '../../../src/sea/delegated/delegation-grant.repository';
import type { DelegatedExecutionAuditRepository } from '../../../src/sea/delegated/delegated-execution-audit.repository';
import type { SessionSignerProvider } from '../../../src/sea/delegated/session-signer.provider';
import type { PersistenceRepository } from '../../../src/matching/persistence.repository';

const SEPOLIA_ENABLED = {
  PROFILE: 'sepolia',
  CHAIN_ID: '11155111',
  SEA_DELEGATED_ENABLED: '1',
  ZEROEX_EXCHANGE_PROXY: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
} as unknown as NodeJS.ProcessEnv;

const OWNER = '0x' + '9'.repeat(40);
const INTENT = {
  id: 'intent-1',
  owner: OWNER,
  marketId: 'm1',
  type: 'CONDITIONAL_MARKET_READY',
  side: 'BUY',
  sizeBase: '1000000000000000000',
  triggerPriceTicks: '3000',
  expiresAt: new Date(Date.now() + 3_600_000),
  status: 'READY',
};
const CTX = {
  baseAddress: '0x' + 'b'.repeat(40),
  quoteAddress: '0x' + 'c'.repeat(40),
  baseDecimals: 18,
  priceTickQ: 1n,
  minSizeB: 0n,
  minNotionalQ: 0n,
};

function build(env: NodeJS.ProcessEnv, opts?: { signerAvailable?: boolean }) {
  const grants = {
    readIntent: jest.fn().mockResolvedValue(INTENT),
    create: jest.fn().mockResolvedValue({ id: 'grant-1' }),
    findByIntentId: jest.fn(),
    markStatus: jest.fn().mockResolvedValue(undefined),
    listByOwner: jest.fn().mockResolvedValue([]),
  };
  const audit = {
    append: jest.fn().mockResolvedValue(undefined),
    listByIntent: jest.fn().mockResolvedValue([]),
  };
  const signer = {
    isAvailable: () => opts?.signerAvailable ?? true,
    getAddress: jest
      .fn()
      .mockResolvedValue(
        opts?.signerAvailable === false ? null : '0x' + '7'.repeat(40),
      ),
  };
  const persistence = { getTradingContext: jest.fn().mockResolvedValue(CTX) };
  const svc = new DelegationService(
    resolveDelegationConfig(env),
    new MockDelegationProvider(),
    grants as unknown as DelegationGrantRepository,
    audit as unknown as DelegatedExecutionAuditRepository,
    signer as unknown as SessionSignerProvider,
    persistence as unknown as PersistenceRepository,
  );
  return { svc, grants, audit, signer, persistence };
}

describe('DelegationService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.READ_ONLY;
    delete process.env.PROFILE;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('status() reflects disabled on base-mainnet', () => {
    const { svc } = build({ PROFILE: 'mainnet' } as NodeJS.ProcessEnv);
    const s = svc.status();
    expect(s.enabled).toBe(false);
    expect(s.writable).toBe(false);
    expect(s.profile).toBe('base-mainnet');
  });

  it('prepareGrant refused on base-mainnet (no provider call)', async () => {
    process.env.PROFILE = 'mainnet';
    const { svc, grants } = build({
      PROFILE: 'mainnet',
      SEA_DELEGATED_ENABLED: '1',
    } as unknown as NodeJS.ProcessEnv);
    const r = await svc.prepareGrant({ intentId: 'intent-1', owner: OWNER });
    expect(r.ok).toBe(false);
    expect(grants.readIntent).not.toHaveBeenCalled();
  });

  it('prepareGrant refused when flags disabled by default (sepolia)', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc } = build({ PROFILE: 'sepolia' } as NodeJS.ProcessEnv);
    const r = await svc.prepareGrant({ intentId: 'intent-1', owner: OWNER });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('SEA_DELEGATED_ENABLED!=1');
  });

  it('prepareGrant refused under READ_ONLY even with flag on', async () => {
    process.env.PROFILE = 'sepolia';
    process.env.READ_ONLY = 'true';
    const { svc } = build({
      ...SEPOLIA_ENABLED,
      READ_ONLY: 'true',
    } as NodeJS.ProcessEnv);
    const r = await svc.prepareGrant({ intentId: 'intent-1', owner: OWNER });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('READ_ONLY=true');
  });

  it('prepareGrant refused when the session signer is unavailable', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc } = build(SEPOLIA_ENABLED, { signerAvailable: false });
    const r = await svc.prepareGrant({ intentId: 'intent-1', owner: OWNER });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('session_signer_unavailable');
  });

  it('prepareGrant returns the enable digest on sepolia + flag on + signer', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc } = build(SEPOLIA_ENABLED);
    const r = await svc.prepareGrant({ intentId: 'intent-1', owner: OWNER });
    expect(r.ok).toBe(true);
    expect(r.enableDigest).toBe('0xmockdigest-intent-1');
  });

  it('finalizeGrant persists an ACTIVE single-use grant to the configured EP', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc, grants } = build(SEPOLIA_ENABLED);
    const r = await svc.finalizeGrant({
      intentId: 'intent-1',
      owner: OWNER,
      accountAddress: OWNER,
      sessionBlob: 'mock-session-intent-1',
      ownerSignature: '0xsig',
    });
    expect(r.ok).toBe(true);
    expect(grants.create).toHaveBeenCalledTimes(1);
    const arg = grants.create.mock.calls[0][0];
    expect(arg.status).toBe('ACTIVE');
    expect(arg.policy.usageLimit).toBe(1);
    expect(arg.policy.target).toBe(SEPOLIA_ENABLED.ZEROEX_EXCHANGE_PROXY);
    expect(arg.meta.accountAddress).toBe(OWNER);
  });

  it('saStatus refused when disabled by default (sepolia)', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc } = build({ PROFILE: 'sepolia' } as NodeJS.ProcessEnv);
    const r = await svc.saStatus({
      intentId: 'intent-1',
      owner: OWNER,
      accountModel: 'NEXUS_SA',
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('SEA_DELEGATED_ENABLED!=1');
  });

  it('saStatus returns SA setup facts on sepolia + flag on (via provider)', async () => {
    process.env.PROFILE = 'sepolia';
    const { svc } = build(SEPOLIA_ENABLED);
    const r = await svc.saStatus({
      intentId: 'intent-1',
      owner: OWNER,
      accountModel: 'NEXUS_SA',
    });
    expect(r.ok).toBe(true);
    expect(r.smartAccountAddress).toContain('0xmockSA-');
    expect(r.needsDeployment).toBe(false);
    expect(r.requiredTokenQ).toBeDefined();
  });

  it('listGrants maps grant rows to summaries (accountAddress from meta)', async () => {
    const { svc, grants } = build(SEPOLIA_ENABLED);
    grants.listByOwner.mockResolvedValueOnce([
      {
        intentId: 'intent-1',
        owner: OWNER,
        status: 'ACTIVE',
        accountModel: 'NEXUS_SA',
        permissionId: '0xperm',
        validUntil: new Date(1_900_000_000_000),
        meta: { accountAddress: '0x' + 'a'.repeat(40) },
      },
    ]);
    const rows = await svc.listGrants(OWNER);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('ACTIVE');
    expect(rows[0].accountAddress).toBe('0x' + 'a'.repeat(40));
    expect(rows[0].intentId).toBe('intent-1');
  });

  it('listAttempts is owner-scoped: empty when the grant owner differs', async () => {
    const { svc, grants, audit } = build(SEPOLIA_ENABLED);
    grants.findByIntentId.mockResolvedValueOnce({
      owner: '0x' + '1'.repeat(40),
    });
    const rows = await svc.listAttempts(OWNER, 'intent-1');
    expect(rows).toEqual([]);
    expect(audit.listByIntent).not.toHaveBeenCalled();
  });

  it('listAttempts returns attempts for the grant owner', async () => {
    const { svc, grants, audit } = build(SEPOLIA_ENABLED);
    grants.findByIntentId.mockResolvedValueOnce({ owner: OWNER });
    audit.listByIntent.mockResolvedValueOnce([
      {
        decision: 'CONFIRMED',
        reason: null,
        txHash: '0x' + 'f'.repeat(64),
        providerRef: null,
        createdAt: new Date(1_800_000_000_000),
      },
    ]);
    const rows = await svc.listAttempts(OWNER, 'intent-1');
    expect(rows).toHaveLength(1);
    expect(rows[0].decision).toBe('CONFIRMED');
    expect(rows[0].txHash).toBe('0x' + 'f'.repeat(64));
  });
});
