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
      <div className="grid grid-cols-3 text-xs text-gray-500 mb-1">
        <div className="text-right col-span-1">Price ({quoteSym})</div>
        <div className="text-right col-span-1">Size ({baseSym})</div>
        <div className="text-right col-span-1">Placed</div>
      </div>

      <ul className="space-y-1">
        {levels.length === 0 ? (
          <li>—</li>
        ) : (
          levels.map((l, i) => {
            // lee ts cacheado (si no existe, NO pintamos nada)
            const tsIso = getLevelTs ? getLevelTs(side, l.priceTicks) : undefined;

            return (
              <li
                key={i}
                className="grid grid-cols-3 items-center font-mono hover:bg-neutral-50 rounded px-1 cursor-default"
                onClick={onTake ? () => onTake(l) : undefined}
              >
                <div
                  className={`text-right ${side === "bids" ? "text-green-700" : "text-red-700"}`}
                >
                  {fmtPriceFromTicks(l.priceTicks, tickQ, quoteDec)}
                </div>
                <div className="text-right">{fmtSizeBase(l.sizeBase, baseDec)}</div>
                <div className="text-right text-xs text-gray-500">
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
