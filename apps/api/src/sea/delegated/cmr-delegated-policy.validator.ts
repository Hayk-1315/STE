// apps/api/src/sea/delegated/cmr-delegated-policy.validator.ts
//
// STE-side authoritative economic guard (skeleton). Before any delegated
// execution, the executor re-validates the FRESH quote against the intent's
// policy — the same guarantees the manual CMR path already enforces. The
// provider/session policy is only a coarse backstop.
//
// Phase 1: deterministic structural checks only; the live executor that calls
// this arrives in a later phase. This intentionally does NOT re-implement or
// alter the existing manual-CMR readiness/fresh-quote logic.
import type {
  CmrDelegationPolicy,
  DelegatedFreshQuote,
} from './delegated.types';

export interface PolicyValidationResult {
  ok: boolean;
  reason?: string;
}

export interface ValidateArgs {
  policy: CmrDelegationPolicy;
  quote: DelegatedFreshQuote;
  /** Unix seconds; injectable for testing. Defaults to now. */
  nowUnix?: number;
}

/**
 * Returns `{ ok: true }` only when the fresh quote satisfies every bound the
 * delegated CMR grant promised: full size, single fill, correct taker token,
 * within the spend cap, and not past expiry. First failing check wins.
 */
export function validateFreshQuoteAgainstPolicy(
  args: ValidateArgs,
): PolicyValidationResult {
  const { policy, quote } = args;
  const nowUnix = args.nowUnix ?? Math.floor(Date.now() / 1000);

  if (nowUnix > policy.validUntil) {
    return { ok: false, reason: 'grant_expired' };
  }
  if (quote.remainingBaseB !== 0n) {
    return { ok: false, reason: 'not_full_size' };
  }
  if (quote.fillsCount !== 1) {
    return { ok: false, reason: 'requires_single_fill' };
  }
  if (quote.takerToken.toLowerCase() !== policy.spendToken.toLowerCase()) {
    return { ok: false, reason: 'wrong_taker_token' };
  }
  if (quote.takerFillAmountQ > policy.maxTakerFillAmountQ) {
    return { ok: false, reason: 'exceeds_fill_bound' };
  }
  if (quote.takerTotalAmountQ > policy.spendCapQ) {
    return { ok: false, reason: 'exceeds_spend_cap' };
  }
  return { ok: true };
}
