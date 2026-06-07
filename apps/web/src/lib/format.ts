// apps/web/src/lib/format.ts
import { ethers } from "ethers";

/** sizeBase (wei del token base) → string humano con decimales del base */
export function fmtSizeBase(sizeBase: string | bigint, baseDecimals: number): string {
  const v = typeof sizeBase === "bigint" ? sizeBase : BigInt(sizeBase || "0");
  return ethers.formatUnits(v, baseDecimals);
}

/** priceTicks → precio humano, usando priceTickQ (unidad mínima de precio) y decimales del quote */
export function fmtPriceFromTicks(
  priceTicks: string | bigint,
  priceTickQ: string | bigint,
  quoteDecimals: number,
): string {
  const ticks = typeof priceTicks === "bigint" ? priceTicks : BigInt(priceTicks || "0");
  const tickQ = typeof priceTickQ === "bigint" ? priceTickQ : BigInt(priceTickQ || "0");
  // priceScaled = ticks * priceTickQ (ambos enteros)
  const priceScaled = ticks * tickQ;
  return ethers.formatUnits(priceScaled, quoteDecimals);
}

/**
 * Format a human-readable token amount string for display.
 * Accepts the string output of ethers.formatUnits() and returns a clean,
 * locale-formatted string (thousands separators, no float artifacts).
 *
 * Display-only: the returned string is NEVER fed back into math or approvals.
 * Using parseFloat is intentional here — ethers.formatUnits() already scales
 * to token-decimal precision so significant digits are at the integer/early-
 * decimal position; artifacts live in trailing noise that maxDecimals removes.
 */
export function displayAmount(
  human: string,
  opts?: { maxDecimals?: number; compact?: boolean },
): string {
  const maxDecimals = opts?.maxDecimals ?? 6;
  const n = parseFloat(human);
  if (!Number.isFinite(n)) return human; // unexpected input → pass through

  // Guard: a positive value below the display precision would round to "0",
  // which is misleading in a financial UI. Show a "<floor" label instead so
  // non-zero amounts are never silently presented as zero.
  // Applies regardless of compact mode — displayAmount is display-only and the
  // formatted string is never fed back into math, approvals, or tx payloads.
  if (n > 0 && n < Math.pow(10, -maxDecimals)) {
    const floor = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: maxDecimals,
    }).format(Math.pow(10, -maxDecimals));
    return `<${floor}`;
  }

  return new Intl.NumberFormat(undefined, {
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(n);
}

/** Notional en quote: baseWei * priceScaled / 10^baseDecimals → formato humano con decimales del quote */
export function fmtNotionalQuote(params: {
  sizeBase: string | bigint;
  priceTicks: string | bigint;
  priceTickQ: string | bigint;
  baseDecimals: number;
  quoteDecimals: number;
}): string {
  const baseWei =
    typeof params.sizeBase === "bigint" ? params.sizeBase : BigInt(params.sizeBase || "0");
  const ticks =
    typeof params.priceTicks === "bigint" ? params.priceTicks : BigInt(params.priceTicks || "0");
  const tickQ =
    typeof params.priceTickQ === "bigint" ? params.priceTickQ : BigInt(params.priceTickQ || "0");
  const priceScaled = ticks * tickQ;
  const denomBase = ethers.parseUnits("1", params.baseDecimals); // 10^baseDecimals
  const quoteWei = (baseWei * priceScaled) / denomBase;
  return ethers.formatUnits(quoteWei, params.quoteDecimals);
}
