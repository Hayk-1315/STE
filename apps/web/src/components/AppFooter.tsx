// apps/web/src/components/AppFooter.tsx
"use client";
import React from "react";
import { env } from "@/lib/env";

export default function AppFooter() {
  const cid = env().NEXT_PUBLIC_CHAIN_ID;
  const chain = cid === 8453 ? "Base Mainnet" : cid === 84532 ? "Base Sepolia" : "Sepolia Ethereum";

  return (
    <footer className="mt-8 w-full border-t border-neutral-800 bg-black/90 px-4 sm:px-5 lg:px-6 py-7">
      <div className="flex items-center justify-between text-[13px] text-neutral-400">
        <span className="font-mono">
          Powered by 0x v4 · <span className="text-neutral-300">{chain}</span> (chainId {cid})
        </span>
        <span className="hidden sm:inline text-neutral-500">
          Hybrid Exchange · self-custodial orderbook
        </span>
      </div>
    </footer>
  );
}
