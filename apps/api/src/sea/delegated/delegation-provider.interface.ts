// apps/api/src/sea/delegated/delegation-provider.interface.ts
//
// Thin provider seam so Biconomy (Smart Sessions + Nexus) is the FIRST real
// implementation without being hardwired into core CMR. Phase 2 evolves `grant`
// into a NON-CUSTODIAL prepare/finalize split (the backend builds the digest,
// the USER signs it in their wallet, the backend stores the result) and adds
// `revokePrepare` (a user-signed on-chain call). Execution is the only step the
// backend session key performs.
//
// NON-CUSTODIAL contract: a provider receives NON-SECRET references only
// (chain/profile, policy bounds, a session-key ADDRESS, an owner ADDRESS,
// user signatures). It never receives or returns the user's private key.
import type {
  CmrDelegationPolicy,
  DelegationAccountModel,
  DelegationProviderKind,
} from './delegated.types';

/** DI token for the active DelegationProvider. */
export const DELEGATION_PROVIDER = Symbol('DELEGATION_PROVIDER');
/** DI token for the resolved DelegationConfig value provider. */
export const DELEGATION_CONFIG = Symbol('DELEGATION_CONFIG');
/** DI token for the backend session signer (address + userOp signing). */
export const DELEGATION_SESSION_SIGNER = Symbol('DELEGATION_SESSION_SIGNER');

export interface DelegationContext {
  chainId: number;
  profile: string;
}

export interface DelegationCapabilities {
  supported: boolean;
  accountModels: DelegationAccountModel[];
  reason?: string;
}

// ----- grant: step 1 (prepare, no signing) -----
export interface PrepareGrantRequest {
  intentId: string;
  owner: string; // user EOA (address only)
  accountModel: DelegationAccountModel;
  policy: CmrDelegationPolicy;
  /** NON-SECRET backend session signer ADDRESS = the session redeemer. */
  sessionKeyAddress: string;
}
export interface PrepareGrantResult {
  ok: boolean;
  reason?: string;
  /** The 0x taker account (7702-delegated EOA or counterfactual Nexus SA). */
  accountAddress?: string;
  /** EIP-7702: the EOA must delegate to this Nexus implementation first. */
  needsDelegation?: boolean;
  delegationImplementation?: string;
  /** Hex digest the user signs (in their wallet) to enable the session. */
  enableDigest?: string;
  /** Opaque serialized session, echoed back verbatim to finalizeGrant. */
  sessionBlob?: string;
}

// ----- grant: step 2 (finalize with the user's signature) -----
export interface FinalizeGrantRequest {
  intentId: string;
  owner: string;
  sessionBlob: string;
  /** User's signature over `enableDigest` (from their wallet). */
  ownerSignature: string;
}
export interface FinalizeGrantResult {
  ok: boolean;
  reason?: string;
  permissionId?: string;
  /** Non-secret enable data persisted on the grant and replayed at execute. */
  enableData?: string;
}

// ----- execute: backend session key signs the userOp -----
export interface ExecuteExpectation {
  orderHash?: string;
  taker: string;
  takerToken: string;
  takerFillAmount: bigint;
  /**
   * Upper bound on the ACTUAL 0x taker fee paid (LimitOrderFilled
   * `takerTokenFeeFilledAmount`). Computed STE-side from the matched order at
   * fresh-quote time; the provider withholds `confirmed:true` if the receipt's
   * fee exceeds it. Optional (fee is otherwise bounded STE-side only).
   */
  takerFeeAmount?: bigint;
}
export interface ExecuteRequest {
  intentId: string;
  accountModel: DelegationAccountModel;
  accountAddress: string;
  permissionId: string;
  enableData: string;
  policy: CmrDelegationPolicy;
  /** Target the executor submits to (must equal `policy.target` = 0x EP). */
  target: string;
  /** fillLimitOrder calldata built by STE (existing ZeroExTxBuildersService). */
  calldata: string;
  /** Values the provider MUST verify in the receipt logs before ok+confirmed. */
  expected: ExecuteExpectation;
}
export interface ExecuteResult {
  ok: boolean;
  txHash?: string;
  /** true ONLY when the 0x fill was verified in the receipt logs. */
  confirmed?: boolean;
  reason?: string;
}

// ----- revoke: user-signed on-chain remove-session -----
export interface RevokePrepareRequest {
  intentId: string;
  owner: string;
  accountAddress: string;
  permissionId: string;
}
export interface RevokePrepareResult {
  ok: boolean;
  /** Call the user's wallet signs+sends to remove the session (user-funded). */
  to?: string;
  data?: string;
  reason?: string;
}

// ----- sa-status: read-only Nexus SA setup facts (NEXUS_SA model only) -----
export interface SaStatusRequest {
  owner: string;
  accountModel: DelegationAccountModel;
  /** Taker token the SA must hold + approve (quote for BUY, base for SELL). */
  spendToken: string;
  /** Whole taker outflow to cover on-chain (takerAmount + fee buffer). */
  requiredTokenQ: bigint;
  /** Approval spender to check (0x Exchange Proxy). */
  exchangeProxy: string;
}
export interface SaStatusResult {
  ok: boolean;
  reason?: string;
  /** Counterfactual/deployed Nexus SA (0x taker) derived from the owner ADDRESS. */
  smartAccountAddress?: string;
  /** Backend session signer (redeemer) address — non-secret. */
  sessionKeyAddress?: string;
  /** Nexus factory the FE uses to build the deploy tx. */
  factory?: string;
  needsDeployment?: boolean;
  needsModuleInstall?: boolean;
  needsFunding?: boolean;
  needsApproval?: boolean;
  ethBalanceWei?: string;
  requiredEthWei?: string;
  tokenBalanceQ?: string;
  requiredTokenQ?: string;
  allowanceQ?: string;
}

export interface DelegationProvider {
  readonly kind: DelegationProviderKind;
  capabilities(ctx: DelegationContext): Promise<DelegationCapabilities>;
  prepareGrant(req: PrepareGrantRequest): Promise<PrepareGrantResult>;
  finalizeGrant(req: FinalizeGrantRequest): Promise<FinalizeGrantResult>;
  execute(req: ExecuteRequest): Promise<ExecuteResult>;
  revokePrepare(req: RevokePrepareRequest): Promise<RevokePrepareResult>;
  /** Read-only Nexus SA setup facts (NEXUS_SA); no tx, no signing. */
  saStatus(req: SaStatusRequest): Promise<SaStatusResult>;
}
