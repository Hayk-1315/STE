// apps/web/src/lib/validation.ts
import { ethers } from "ethers";
import type { Market } from "./api";

export type LimitDerived = {
  baseWei: bigint;
  priceScaled: bigint; // price * 10^quoteDecimals
  quoteWei: bigint; // baseWei * price / 10^baseDecimals
  priceTicks: bigint; // priceScaled / priceTickQ (si válido)
};

export type LimitValidation = {
  ok: boolean;
  errors: string[];
  derived?: LimitDerived;
};

function pow10(n: number): bigint {
  return BigInt(10) ** BigInt(n);
}

export function parseSizeWei(sizeHuman: string, baseDecimals: number): bigint {
  return ethers.parseUnits(sizeHuman || "0", baseDecimals);
}

export function parsePriceScaled(priceHuman: string, quoteDecimals: number): bigint {
  // precio humano → unidades mínimas del quote por 1 unidad de base
  return ethers.parseUnits(priceHuman || "0", quoteDecimals);
}

export function computeQuoteWei(
  baseWei: bigint,
  priceScaled: bigint,
  baseDecimals: number,
): bigint {
  return (baseWei * priceScaled) / pow10(baseDecimals);
}

/** Valida limit para el market (BUY/SELL comparten reglas) */
export function validateLimitInput(
  market: Market,
  sizeHuman: string,
  priceHuman: string,
): LimitValidation {
  const errs: string[] = [];

  const baseDec = market.base.decimals;
  const quoteDec = market.quote.decimals;
  const baseWei = parseSizeWei(sizeHuman, baseDec);
  const priceScaled = parsePriceScaled(priceHuman, quoteDec);
  const quoteWei = computeQuoteWei(baseWei, priceScaled, baseDec);

  // Reglas del market (ya vienen en unidades mínimas)
  const minSizeB = BigInt(market.rules.minSizeB);
  const minNotionalQ = BigInt(market.rules.minNotionalQ);
  const priceTickQ = BigInt(market.rules.priceTickQ);

  // 1) Min size
  const minSizeHuman = ethers.formatUnits(minSizeB, baseDec);
  const minNotionalHuman = ethers.formatUnits(minNotionalQ, quoteDec);
  const tickHuman = ethers.formatUnits(priceTickQ, quoteDec);

  // 1) Min size
  if (baseWei < minSizeB) {
    errs.push(`Min size: ${minSizeHuman} ${market.base.symbol}`);
  }

  // 2) Min notional
  if (quoteWei < minNotionalQ) {
    errs.push(`Min notional: ${minNotionalHuman} ${market.quote.symbol}`);
  }

  // 3) Grid de tick
  const tickOk = priceScaled % priceTickQ === BigInt(0);
  if (!tickOk) {
    errs.push(`Price must be multiple of tick: ${tickHuman} ${market.quote.symbol}`);
  }

  const priceTicks = tickOk ? priceScaled / priceTickQ : BigInt(0);

  return {
    ok: errs.length === 0,
    errors: errs,
    derived: { baseWei, priceScaled, quoteWei, priceTicks },
  };
}

/* =========================
 * Phase 5 Part B.2 — Market quote-denominated notional
 * =========================
 *
 * Computes the pre-fee, quote-denominated notional from a /match/quote
 * response. Matches the exact formula used by OrderBookService.quote(...)
 * server-side:
 *
 *   notionalQ = Σ over fills of (priceTicks * priceTickQ * sizeBase / 10^baseDecimals)
 *
 * The formula is side-independent — the executed value is always priced in
 * quote units regardless of which side is the taker. It is also pre-fee, to
 * match the existing `validateLimitInput` rule (`quoteWei = baseWei *
 * priceScaled / 10^baseDec`), so a Market order is judged against the same
 * `minNotionalQ` rule as a Limit at the same effective price.
 *
 * Uses exact bigint math only; no floats. Returns 0n on missing/malformed
 * fills — the caller's gate ("< minNotionalQ") then fires naturally.
 *
 * `side` is accepted in the signature for API clarity (callers know which
 * side they quoted) but is not consulted — the math is symmetric.
 */
export type QuoteForNotional = {
  fills?: ReadonlyArray<{ priceTicks: string; sizeBase: string }>;
};

export function marketQuoteNotionalQ(
  market: Market,
  _side: "BUY" | "SELL",
  quote: QuoteForNotional,
): bigint {
  const baseDec = market.base.decimals;
  const tickQ = (() => {
    try {
      return BigInt(market.rules.priceTickQ);
    } catch {
      return BigInt(0);
    }
  })();
  if (tickQ <= BigInt(0)) return BigInt(0);
  const denom = pow10(baseDec);
  let total = BigInt(0);
  for (const f of quote.fills ?? []) {
    try {
      const px = BigInt(f.priceTicks);
      const sz = BigInt(f.sizeBase);
      total += (px * tickQ * sz) / denom;
    } catch {
      // Skip malformed fills rather than throw — the gate below will catch
      // an artificially-low total.
    }
  }
  return total;
}

/** Render-friendly "Min notional: X SYMBOL" string for inline errors. */
export function formatMinNotionalError(market: Market, minNotionalQ: bigint): string {
  const human = ethers.formatUnits(minNotionalQ, market.quote.decimals);
  return `Min notional: ${human} ${market.quote.symbol}`;
}
