"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getMarkets, type Market } from "@/lib/api";

export default function MarketSwitcher({ currentSymbol }: { currentSymbol?: string }) {
  const [mkts, setMkts] = React.useState<Market[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    getMarkets()
      .then((m) => {
        if (!alive) return;
        const list = Array.isArray(m) ? m : [];
        // ⬇️ Mantén solo tus 3 mercados
        const RAW_ALLOWED = ["WETH-USDC", "WETH-USDbC", "USDC-USDbC"];
        const ALLOWED = new Set(RAW_ALLOWED.map((s) => s.toUpperCase()));
        const filtered = list.filter((x) => ALLOWED.has(x.symbol.toUpperCase()));
        setMkts(filtered);
      })
      .catch(() => {
        if (alive) setMkts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = (currentSymbol ?? "").toUpperCase();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sym = e.target.value;
    if (!sym) return;
    const parts = sym.split("-");
    const base = parts[0];
    const quote = parts[1];
    if (!base || !quote) return;
    // tu ruta actual es /market/[base]/[quote]
    router.push(`/market/${base}/${quote}`);
  };

  const hasCurrent = mkts.some((m) => m.symbol.toUpperCase() === value);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-400">Market</span>
      <select
        className="border border-neutral-700/60 bg-neutral-950/80 rounded-lg px-2 py-1 text-sm font-mono text-neutral-200 shrink-0"
        aria-label="Select market"
        title="Select market"
        value={hasCurrent ? value : ""}
        onChange={onChange}
        disabled={loading || mkts.length === 0}
      >
        <option value="">{loading ? "Loading markets…" : "Select market"}</option>
        {mkts.map((m) => (
          <option key={m.id ?? m.symbol} value={m.symbol.toUpperCase()}>
            {m.symbol.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
