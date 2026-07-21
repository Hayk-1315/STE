// apps/api/src/sea/delegated/mock-delegation.provider.ts
//
// Phase 1/2 default provider: deterministic, in-memory, NO network calls and NO
// on-chain effects. Safe default while the feature is disabled and for unit
// tests. `execute()` NEVER returns a confirmed fill — a misconfiguration can
// never cause (or fake) a live delegated fill through the mock.
import type {
  DelegationProvider,
  DelegationContext,
  DelegationCapabilities,
  PrepareGrantRequest,
  PrepareGrantResult,
  FinalizeGrantRequest,
  FinalizeGrantResult,
  ExecuteResult,
  RevokePrepareResult,
  SaStatusRequest,
  SaStatusResult,
} from './delegation-provider.interface';
import type { DelegationProviderKind } from './delegated.types';

export class MockDelegationProvider implements DelegationProvider {
  readonly kind: DelegationProviderKind = 'MOCK';

  capabilities(ctx: DelegationContext): Promise<DelegationCapabilities> {
    return Promise.resolve({
      supported: true,
      accountModels: ['EIP7702', 'NEXUS_SA'],
      reason: `mock provider (chain ${ctx.chainId}, profile ${ctx.profile})`,
    });
  }

  prepareGrant(req: PrepareGrantRequest): Promise<PrepareGrantResult> {
    // Deterministic, no signing, no network.
    return Promise.resolve({
      ok: true,
      accountAddress: req.owner,
      needsDelegation: req.accountModel === 'EIP7702',
      enableDigest: `0xmockdigest-${req.intentId}`,
      sessionBlob: `mock-session-${req.intentId}`,
    });
  }

  finalizeGrant(req: FinalizeGrantRequest): Promise<FinalizeGrantResult> {
    return Promise.resolve({
      ok: true,
      permissionId: `mock-permission-${req.intentId}`,
      enableData: `mock-enable-${req.intentId}`,
    });
  }

  execute(): Promise<ExecuteResult> {
    // Never submits, never confirms. Live execution requires the real provider.
    return Promise.resolve({
      ok: false,
      confirmed: false,
      reason: 'mock-provider-noop',
    });
  }

  revokePrepare(): Promise<RevokePrepareResult> {
    return Promise.resolve({ ok: true, to: '0x', data: '0x' });
  }

  saStatus(req: SaStatusRequest): Promise<SaStatusResult> {
    // Deterministic, no network. Reports a "ready" mock SA so unit tests exercise
    // the orchestration without an RPC. The real facts come from the Biconomy
    // provider; the mock never implies a real on-chain account.
    return Promise.resolve({
      ok: true,
      smartAccountAddress: `0xmockSA-${req.owner}`,
      sessionKeyAddress: '0xmockSessionKey',
      factory: '0xmockFactory',
      needsDeployment: false,
      needsModuleInstall: false,
      needsFunding: false,
      needsApproval: false,
      ethBalanceWei: '0',
      requiredEthWei: '0',
      tokenBalanceQ: req.requiredTokenQ.toString(),
      requiredTokenQ: req.requiredTokenQ.toString(),
      allowanceQ: req.requiredTokenQ.toString(),
    });
  }
}
