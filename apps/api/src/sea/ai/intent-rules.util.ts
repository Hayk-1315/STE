// apps/api/src/sea/ai/intent-rules.util.ts
// Pure, deterministic helpers shared by the AI draft validator. All money math
// is exact bigint — mirrors the formulas already used by
// IntentValidatorService and the FE validation lib (no floats). Used only by
// the AI parse path in Phase 1A; the authoritative create-time validator is
// unchanged.
import { formatUnits, parseUnits } from 'ethers';
import type {
  IntentSide,
  ReferencePriceKind,
  TriggerType,
} from './ai-draft.schema';

export function pow10(n: number): bigint {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
}

/**
 * Parse a human decimal string into atomic units. Returns null on any malformed
 * input (non-numeric, too many decimals for the token, etc.) so the caller can
 * treat it as "missing/invalid" rather than throwing.
 */
export function parseHumanAtomic(
  human: string | undefined,
  decimals: number,
): bigint | null {
  if (human === undefined) return null;
  const trimmed = human.trim();
  if (trimmed === '') return null;
  try {
    return parseUnits(trimmed, decimals);
  } catch {
    return null;
  }
}

/** Canonicalize a human decimal string (e.g. "0.20" -> "0.2", "20.0" -> "20"). */
export function normalizeHuman(human: string, decimals: number): string {
  // ethers formatUnits renders whole numbers as "20.0"; trim trailing zeros and
  // a dangling decimal point so the prefilled form value reads cleanly.
  let s = formatUnits(parseUnits(human.trim(), decimals), decimals);
  if (s.includes('.')) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}

/** Render an atomic value as a human string for user-facing copy. */
export function formatAtomic(value: bigint, decimals: number): string {
  return formatUnits(value, decimals);
}

/** A positive, tick-aligned scaled price yields its tick count; else null. */
export function priceScaledToTicks(
  priceScaled: bigint,
  priceTickQ: bigint,
): bigint | null {
  if (priceScaled <= 0n || priceTickQ <= 0n) return null;
  if (priceScaled % priceTickQ !== 0n) return null;
  return priceScaled / priceTickQ;
}

/**
 * Compare a notional (priceTicks * priceTickQ * sizeBase / 10^baseDecimals)
 * against minNotionalQ, using exact cross-multiplied bigints (no division).
 * Returns -1 (below), 0 (equal), or 1 (above).
 */
export function compareNotionalToMin(opts: {
  priceTicks: bigint;
  priceTickQ: bigint;
  sizeBase: bigint;
  baseDecimals: number;
  minNotionalQ: bigint;
}): -1 | 0 | 1 {
  const lhs = opts.priceTicks * opts.priceTickQ * opts.sizeBase;
  const rhs = opts.minNotionalQ * pow10(opts.baseDecimals);
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

/**
 * Minimum base size (atomic) needed to reach minNotionalQ at the given price.
 * Used only to suggest a corrective size in CMR-BUY "impossible notional" copy.
 *   sizeBase >= ceil(minNotionalQ * 10^baseDecimals / (priceTicks * priceTickQ))
 */
export function minSizeForNotional(opts: {
  priceTicks: bigint;
  priceTickQ: bigint;
  baseDecimals: number;
  minNotionalQ: bigint;
}): bigint {
  const denom = opts.priceTicks * opts.priceTickQ;
  if (denom <= 0n) return 0n;
  const num = opts.minNotionalQ * pow10(opts.baseDecimals);
  return (num + denom - 1n) / denom; // ceil division
}

/**
 * The single deterministic side -> (reference, triggerType) mapping. Mirrors
 * the FE `naturalRefAndType` and the backend CMR natural-combo restriction.
 * MID is never produced.
 */
export function deriveRefAndType(side: IntentSide): {
  reference: ReferencePriceKind;
  triggerType: TriggerType;
} {
  return side === 'BUY'
    ? { reference: 'BEST_ASK', triggerType: 'PRICE_BELOW' }
    : { reference: 'BEST_BID', triggerType: 'PRICE_ABOVE' };
}

/** Split a pair symbol ("WETH-USDC") into base/quote token symbols. */
export function splitPairSymbol(symbol: string): {
  base: string;
  quote: string;
} {
  const idx = symbol.indexOf('-');
  if (idx <= 0 || idx >= symbol.length - 1) {
    return { base: 'base', quote: 'quote' };
  }
  return { base: symbol.slice(0, idx), quote: symbol.slice(idx + 1) };
}
