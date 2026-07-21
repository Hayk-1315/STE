// apps/web/src/components/DelegationPreview.tsx
// Milestone 3C: per-intent preview of the delegated session bounds, sourced
// from the intent itself + the backend's sa-status (which derives the same
// policy prepareGrant will use). Display-only — no action here.
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { zeroExEP } from "@/lib/env";
import type { IntentDto } from "@/lib/sea";

export default function DelegationPreview({
  intent,
  takerSymbol,
  requiredTokenQ,
  takerDecimals,
}: {
  intent: IntentDto | null;
  takerSymbol: string;
  requiredTokenQ: string | null;
  takerDecimals: number;
}) {
  const ep = zeroExEP();
  const maxSpend =
    requiredTokenQ !== null
      ? `${formatUnitsSafe(requiredTokenQ, takerDecimals)} ${takerSymbol}`
      : "computed at grant";
  const expiry = intent ? new Date(intent.expiresAt).toLocaleString() : "—";

  const rows: Array<[string, string]> = [
    ["Target", `0x Exchange Proxy (${short(ep)})`],
    ["Action", "Fill one 0x limit order (fillLimitOrder)"],
    ["Uses", "Single-use (1) — replay blocked on-chain"],
    ["Max spend", `${maxSpend} (bounded, includes fee buffer)`],
    ["Expiry", expiry],
    ["Taker (0x)", "Your smart account"],
    ["Gas", "Paid by your smart account (no sponsorship)"],
  ];
  // Secondary detail — collapsed by default to keep the primary flow clear.
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-1.5 text-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-neutral-400 hover:text-neutral-200"
          aria-expanded={open}
        >
          <span>Delegated session limits</span>
          <span className="text-neutral-500">{open ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {open &&
          rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-neutral-400">{k}</span>
              <span className="break-all text-right text-neutral-200">{v}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function short(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function formatUnitsSafe(q: string, decimals: number): string {
  try {
    // Local, dependency-free formatting (avoids importing ethers just for this).
    const v = BigInt(q);
    const base = BigInt(10) ** BigInt(decimals);
    const whole = v / base;
    const frac = v % base;
    if (frac === BigInt(0)) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return q;
  }
}
