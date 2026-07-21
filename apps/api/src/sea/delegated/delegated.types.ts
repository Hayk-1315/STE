// apps/api/src/sea/delegated/delegated.types.ts
//
// Delegated CMR (Phase 1 scaffold) — pure TS types, DB-agnostic.
// These string-literal unions intentionally match the Prisma enum values so
// they are assignment-compatible at the repository boundary, while keeping the
// pure logic (config/guard/policy/validator/provider) free of a `@prisma/client`
// import (so those units test without a generated client or a database).
//
// Scope reminder: delegated execution is CMR-only and fully disabled by default.

export type DelegationProfile = 'ethereum-sepolia' | 'base-mainnet';

/** EIP-7702 keeps funds in the user's EOA (preferred); NEXUS_SA is the fallback. */
export type DelegationAccountModel = 'EIP7702' | 'NEXUS_SA';

export type DelegationProviderKind = 'MOCK' | 'BICONOMY';

export type DelegationGrantStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'USED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'FAILED';

export type DelegatedExecutionDecision =
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'FAILED';

/**
 * The coarse, provider/session-enforced policy for one delegated CMR intent.
 * STE-side fresh-quote validation stays the authoritative economic guard; this
 * is the on-chain backstop (single target + selector + usage=1 + expiry + cap).
 */
export interface CmrDelegationPolicy {
  chainId: number;
  profile: DelegationProfile;
  /** Single-target allowlist: the 0x Exchange Proxy. */
  target: string;
  /** Single-function allowlist: fillLimitOrder. */
  functionSelector: string;
  /** Single-use: 1 (parity with CMR single-fill / all-or-nothing). */
  usageLimit: number;
  /** Unix seconds; bound to the intent expiry. */
  validUntil: number;
  /** Taker token the spend cap applies to (quote for BUY, base for SELL). */
  spendToken: string;
  /**
   * ERC-20 spend cap in base units covering the WHOLE taker outflow
   * (`takerAmount + fee buffer`). Authoritative guard is STE-side (fresh-quote
   * validator + receipt fee check); it is NOT pushed to an on-chain
   * SpendingLimitsPolicy, which cannot parse a 0x fillLimitOrder call. The
   * on-chain fill-size cap is `maxTakerFillAmountQ` (UniversalAction param-rule).
   */
  spendCapQ: bigint;
  /**
   * Upper bound for the `takerTokenFillAmount` calldata param (UniversalAction
   * param-rule). Bounds fill size independently of the fee. `spendCapQ` still
   * covers `takerAmount + fee` so the fee cannot create extra spend.
   */
  maxTakerFillAmountQ: bigint;
  accountModel: DelegationAccountModel;
}

/** Minimal fresh-quote shape the STE-side validator checks before execution. */
export interface DelegatedFreshQuote {
  marketId: string;
  side: 'BUY' | 'SELL';
  fillsCount: number;
  remainingBaseB: bigint;
  takerToken: string;
  /** `takerTokenFillAmount` for the single fill (excludes fee). */
  takerFillAmountQ: bigint;
  /** Whole taker outflow: fill amount + `takerTokenFeeAmount`. */
  takerTotalAmountQ: bigint;
}
