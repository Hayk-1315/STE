// apps/api/src/sea/notional.util.ts
//
// Pure helper: compute the quote-denominated notional from a /match/quote-style
// fills array using the canonical formula the matcher uses internally:
//
//   notionalQ = Σ over fills of (priceTicks * priceTickQ * sizeBase / 10^baseDecimals)
//
// Side-independent (the executed value is always priced in quote units) and
// pre-fee. Used by both CmrPrepareService (READY gate) and SeaController
// (fresh-quote gate) so CMR is consistent with the rule enforced on
// POST /match/quote in Phase 5 Part B.2.
//
// Exact bigint math; no floats. Malformed fills are skipped (the caller's
// `< minNotionalQ` gate fires naturally on the under-counted total).

export type NotionalFill = {
  priceTicks: string | bigint;
  sizeBase: string | bigint;
};

export function computeQuoteNotionalQ(
  fills: ReadonlyArray<NotionalFill>,
  priceTickQ: bigint,
  baseDecimals: number,
): bigint {
  if (priceTickQ <= 0n) return 0n;
  const denom = 10n ** BigInt(baseDecimals);
  let total = 0n;
  for (const f of fills) {
    try {
      const px =
        typeof f.priceTicks === 'bigint' ? f.priceTicks : BigInt(f.priceTicks);
      const sz =
        typeof f.sizeBase === 'bigint' ? f.sizeBase : BigInt(f.sizeBase);
      total += (px * priceTickQ * sz) / denom;
    } catch {
      // Skip malformed fills rather than throw — the caller's gate handles it.
    }
  }
  return total;
}
