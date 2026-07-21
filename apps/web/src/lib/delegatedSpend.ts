// apps/web/src/lib/delegatedSpend.ts
// Phase 3b (delegated CMR manual-QA fixes): a PURE, conservative frontend
// estimate of the worst-case taker-token spend a delegated CMR needs before it
// can be created. This is a UX preflight ONLY — the backend remains the source
// of economic truth (policy + spend cap in the grant). Its job is to stop the
// user creating an under-funded delegated CMR that would later revert on-chain
// (userop_failed / inner revert) because the Nexus SA held too little taker
// token or allowance for the worst-case fill + fee.
//
// Worst-case spend, in taker-token base units (bigint-exact):
//   BUY  (taker spends QUOTE): size(base) * triggerPrice(quote/base)  [+ buffer]
//        A PRICE_BELOW BUY fills at or below the trigger, so the trigger price
//        is the worst (highest) price the taker could pay per base unit.
//   SELL (taker spends BASE):  size(base)                             [+ buffer]
//        The taker provides the base size; price does not change the base spend.
//
// The buffer is a conservative margin that must comfortably cover the backend's
// DELEGATION_FEE_BUFFER_BPS (default 200) plus the 0x taker fee. The FE cannot
// read the backend env, so we take (NEXT_PUBLIC_TAKER_FEE_BPS ?? 0) + a fixed
// safety margin, floored so it is never below the backend default. Being a
// little too strict here only asks the user to fund slightly more — it never
// lets an under-funded CMR through.

import { ethers } from "ethers";

/** Fixed safety margin (bps) added on top of the known 0x taker fee. Chosen so
 *  the total buffer is >= the backend DELEGATION_FEE_BUFFER_BPS default (200). */
export const DELEGATED_SPEND_SAFETY_BPS = 200;
/** Never let the total buffer fall below this (matches backend default). */
export const DELEGATED_SPEND_MIN_BUFFER_BPS = 200;

export type RequiredSpendArgs = {
  side: "BUY" | "SELL";
  sizeBaseHuman: string;
  triggerPriceHuman: string;
  baseDecimals: number;
  quoteDecimals: number;
  /** Total buffer in bps applied to the worst-case fill (fee + safety margin). */
  bufferBps: number;
};

/**
 * Worst-case required taker-token spend in base units, or null when the inputs
 * are not yet valid enough to compute (empty/zero size, or a BUY with no price).
 * Pure: no env, no I/O — safe to unit-test and to call on every render.
 */
export function estimateRequiredSpendQ(args: RequiredSpendArgs): bigint | null {
  try {
    const sizeBaseQ = ethers.parseUnits(args.sizeBaseHuman || "0", args.baseDecimals);
    if (sizeBaseQ <= BigInt(0)) return null;

    let fillQ: bigint;
    if (args.side === "BUY") {
      const priceQ = ethers.parseUnits(args.triggerPriceHuman || "0", args.quoteDecimals);
      if (priceQ <= BigInt(0)) return null;
      // quote spend = size(base) * price(quote per 1 base) / 10^baseDecimals
      const baseDenom = BigInt(10) ** BigInt(args.baseDecimals);
      fillQ = (sizeBaseQ * priceQ) / baseDenom;
    } else {
      // SELL: the taker provides the base size directly.
      fillQ = sizeBaseQ;
    }
    if (fillQ <= BigInt(0)) return null;

    const bufferBps = BigInt(Math.max(0, Math.trunc(args.bufferBps)));
    // Ceil the buffer so we never round the requirement down.
    const bufferQ = (fillQ * bufferBps + BigInt(9999)) / BigInt(10000);
    return fillQ + bufferQ;
  } catch {
    return null;
  }
}

/**
 * Resolve the conservative total buffer (bps) from the configured 0x taker fee.
 * Kept separate from the pure estimator so the estimator stays env-free/testable.
 */
export function resolveSpendBufferBps(takerFeeBps: number | null | undefined): number {
  const fee = Number.isFinite(takerFeeBps as number)
    ? Math.max(0, Math.trunc(takerFeeBps as number))
    : 0;
  return Math.max(DELEGATED_SPEND_MIN_BUFFER_BPS, fee + DELEGATED_SPEND_SAFETY_BPS);
}
