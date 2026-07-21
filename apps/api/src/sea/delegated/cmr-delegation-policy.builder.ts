// apps/api/src/sea/delegated/cmr-delegation-policy.builder.ts
//
// Deterministic builder mapping a CMR intent + fresh-quote economics onto the
// coarse on-chain session policy proven in the Phase 0 spike:
//   single target (0x Exchange Proxy) + single selector (fillLimitOrder)
//   + usageLimit=1 + validUntil (bound to intent expiry)
//   + UniversalAction param-rule bounding `takerTokenFillAmount`.
// `spendCapQ` (amount + fee buffer) is carried for STE-side validation only; it
// is NOT pushed to an on-chain SpendingLimitsPolicy (that policy can't parse a 0x
// fillLimitOrder call). Pure function, no I/O. STE fresh-quote validation stays
// authoritative; the actual fee is re-checked against the fill receipt.
import type {
  CmrDelegationPolicy,
  DelegationAccountModel,
  DelegationProfile,
} from './delegated.types';

/**
 * 0x v4 `fillLimitOrder((...order),(...sig),uint128)` 4-byte selector.
 * Verified on-chain in the Phase 0D real fill (Sepolia). Kept as a constant so
 * this module needs no keccak/ABI dependency.
 */
export const FILL_LIMIT_ORDER_SELECTOR = '0xf6274f66';

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export interface CmrPolicyInput {
  chainId: number;
  profile: DelegationProfile;
  /** 0x Exchange Proxy (single-target allowlist). */
  exchangeProxy: string;
  /** Taker token the spend cap applies to (quote for BUY, base for SELL). */
  spendToken: string;
  /** `takerAmount` — the fill-size bound (UniversalAction param-rule). */
  takerFillAmountQ: bigint;
  /** `takerTokenFeeAmount` — added to the spend cap so the fee can't overspend. */
  takerFeeAmountQ: bigint;
  /** Unix seconds; must be in the future (bound to intent expiry upstream). */
  validUntilUnix: number;
  accountModel: DelegationAccountModel;
  /** Override only for testing; production stays fixed to fillLimitOrder. */
  functionSelector?: string;
}

export function buildCmrDelegationPolicy(
  input: CmrPolicyInput,
): CmrDelegationPolicy {
  if (!ADDRESS_RE.test(input.exchangeProxy)) {
    throw new Error('buildCmrDelegationPolicy: invalid exchangeProxy address');
  }
  if (!ADDRESS_RE.test(input.spendToken)) {
    throw new Error('buildCmrDelegationPolicy: invalid spendToken address');
  }
  if (input.takerFillAmountQ <= 0n) {
    throw new Error('buildCmrDelegationPolicy: takerFillAmountQ must be > 0');
  }
  if (input.takerFeeAmountQ < 0n) {
    throw new Error('buildCmrDelegationPolicy: takerFeeAmountQ must be >= 0');
  }
  if (!Number.isFinite(input.validUntilUnix) || input.validUntilUnix <= 0) {
    throw new Error('buildCmrDelegationPolicy: invalid validUntilUnix');
  }

  return {
    chainId: input.chainId,
    profile: input.profile,
    target: input.exchangeProxy,
    functionSelector: input.functionSelector ?? FILL_LIMIT_ORDER_SELECTOR,
    // Fixed single-use — parity with CMR single-fill / all-or-nothing.
    usageLimit: 1,
    validUntil: input.validUntilUnix,
    spendToken: input.spendToken,
    // Spend cap covers the WHOLE taker outflow: takerAmount + fee.
    spendCapQ: input.takerFillAmountQ + input.takerFeeAmountQ,
    // Param-rule bound on the fill-size arg (independent of the fee).
    maxTakerFillAmountQ: input.takerFillAmountQ,
    accountModel: input.accountModel,
  };
}
