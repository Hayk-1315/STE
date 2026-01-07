// apps/web/src/lib/marketMath.ts
import type { OrderbookResponse } from "./api";
import { ethers } from "ethers";

function toBig(x: string | bigint | undefined | null): bigint {
  if (typeof x === "bigint") return x;
  if (typeof x === "string" && x.length) return BigInt(x);
  return BigInt(0);
}

export function getBestTicks(book: OrderbookResponse | null): {
  bid?: bigint;
  ask?: bigint;
} {
  if (!book) return {};
  const bids = (book.bids ?? []).map((l) => toBig(l.priceTicks));
  const asks = (book.asks ?? []).map((l) => toBig(l.priceTicks));
  const bid = bids.length ? bids.reduce((a, b) => (a > b ? a : b)) : undefined;
  const ask = asks.length ? asks.reduce((a, b) => (a < b ? a : b)) : undefined;
  return { bid, ask };
}

export function fmtPriceFromTicks(
  ticks: bigint,
  priceTickQ: string | bigint,
  quoteDecimals: number,
): string {
  const tickQ = typeof priceTickQ === "bigint" ? priceTickQ : BigInt(priceTickQ || "0");
  const priceScaled = ticks * (tickQ || BigInt(1));
  return ethers.formatUnits(priceScaled, quoteDecimals);
}

/** Devuelve texto listo para UI: best bid/ask, mid y spread bps. */
export function marketSummary(params: {
  book: OrderbookResponse | null;
  priceTickQ: string | bigint;
  quoteDecimals: number;
}): {
  bestBid?: string;
  bestAsk?: string;
  mid?: string;
  spreadBps?: string;
} {
  const { book, priceTickQ, quoteDecimals } = params;
  const { bid, ask } = getBestTicks(book);

  const res: { bestBid?: string; bestAsk?: string; mid?: string; spreadBps?: string } = {};
  if (bid !== undefined) res.bestBid = fmtPriceFromTicks(bid, priceTickQ, quoteDecimals);
  if (ask !== undefined) res.bestAsk = fmtPriceFromTicks(ask, priceTickQ, quoteDecimals);

  if (bid !== undefined && ask !== undefined) {
    const tickQ = typeof priceTickQ === "bigint" ? priceTickQ : BigInt(priceTickQ || "0");
    const bidScaled = Number(bid * (tickQ || BigInt(1)));
    const askScaled = Number(ask * (tickQ || BigInt(1)));
    const midScaled = (bidScaled + askScaled) / 2;
    const spreadBps = midScaled > 0 ? ((askScaled - bidScaled) / midScaled) * 10000 : 0;
    res.mid = ethers.formatUnits(BigInt(Math.round(midScaled)), quoteDecimals);
    res.spreadBps = spreadBps.toFixed(2);
  }
  return res;
}
