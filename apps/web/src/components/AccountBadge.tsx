// apps/web/src/components/AccountBadge.tsx
"use client";
import React from "react";
import { useWallet } from "@/providers/wallet";

function short(a: `0x${string}`) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function AccountBadge() {
  const { address, source } = useWallet();
  if (!address) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-xs">
      <span className="font-mono text-[11px]">{short(address)}</span>
      <span className="text-neutral-500 text-[11px]">({source ?? "wallet"})</span>
      <button
        className="text-[10px] uppercase tracking-wide text-neutral-400 hover:text-neutral-200"
        onClick={() => navigator.clipboard.writeText(address)}
        title="Copy address"
      >
        Copy
      </button>
    </div>
  );
}
