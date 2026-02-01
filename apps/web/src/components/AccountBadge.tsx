// apps/web/src/components/AccountBadge.tsx
"use client";
import React from "react";
import { useWallet } from "@/providers/wallet";
import { toast } from "sonner"; // 👈 añadimos esto

function short(a: `0x${string}`) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function AccountBadge() {
  const { address, source } = useWallet();
  if (!address) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    toast.success("Wallet address copied ✅");
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-xs">
      <span className="font-mono text-[11px]">{short(address)}</span>
      <span className="text-neutral-500 text-[11px]">({source ?? "wallet"})</span>
      <button
        className="text-[10px] uppercase tracking-wide text-neutral-400 hover:text-neutral-200"
        onClick={handleCopy}
        title="Copy address"
      >
        Copy
      </button>
    </div>
  );
}
