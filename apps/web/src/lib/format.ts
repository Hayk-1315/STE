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
