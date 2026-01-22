// apps/web/src/components/OrderbookTable.tsx
"use client";

import React from "react";
import type { Market, OrderbookLevel } from "@/lib/api";
import { fmtPriceFromTicks, fmtSizeBase } from "@/lib/format";

export default function OrderbookTable({
  side,
  levels,
  market,
  onTake,
  getLevelTs, // ← NUEVO
}: {
  side: "bids" | "asks";
  levels: OrderbookLevel[];
  market: Market | null;
  onTake?: (level: OrderbookLevel) => void;
  getLevelTs?: (side: "bids" | "asks", priceTicks: string) => string | undefined; // ← NUEVO
}) {
  const quoteDec = market?.quote.decimals ?? 6;
  const baseDec = market?.base.decimals ?? 18;
  const tickQ = market?.rules.priceTickQ ?? "1";
  const quoteSym = market?.quote.symbol ?? "-";
  const baseSym = market?.base.symbol ?? "-";

  return (
    <div>
      <div className="grid grid-cols-3 text-[10px] sm:text-xs text-neutral-500 mb-1 uppercase tracking-wide">
        <div className="text-right col-span-1">Price ({quoteSym})</div>
        <div className="text-right col-span-1">Size ({baseSym})</div>
        <div className="text-right col-span-1">Placed</div>
      </div>

      <ul className="space-y-1">
        {levels.length === 0 ? (
          <li className="text-xs text-neutral-500">—</li>
        ) : (
          levels.map((l, i) => {
            // lee ts cacheado (si no existe, NO pintamos nada)
            const tsIso = getLevelTs ? getLevelTs(side, l.priceTicks) : undefined;

            return (
              <li
                key={i}
                className={`grid grid-cols-3 items-center font-mono rounded px-1 py-0.5 cursor-pointer transition-colors ${
                  side === "bids" ? "hover:bg-emerald-950/40" : "hover:bg-rose-950/40"
                }`}
                onClick={onTake ? () => onTake(l) : undefined}
              >
                <div
                  className={`text-right ${side === "bids" ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {fmtPriceFromTicks(l.priceTicks, tickQ, quoteDec)}
                </div>

                <div className="text-right text-neutral-100">
                  {fmtSizeBase(l.sizeBase, baseDec)}
                </div>

                <div className="text-right text-[10px] sm:text-xs text-neutral-500">
                  {tsIso ? new Date(tsIso).toLocaleString() : "—"}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
