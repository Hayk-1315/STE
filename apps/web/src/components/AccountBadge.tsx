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
    <div className="flex items-center gap-2 text-sm rounded border px-2 py-1">
      <span className="font-mono">{short(address)}</span>
      <span className="text-gray-500">({source ?? "wallet"})</span>
      <button
        className="text-xs underline"
        onClick={() => navigator.clipboard.writeText(address)}
        title="Copy address"
      >
        copy
      </button>
    </div>
  );
}
