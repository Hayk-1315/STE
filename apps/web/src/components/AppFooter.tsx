"use client";
import React from "react";
import { env } from "@/lib/env";

export default function AppFooter() {
  const cid = env().NEXT_PUBLIC_CHAIN_ID;

  return (
    <footer className="mt-8">
      <div className="rounded-lg border border-neutral-800 bg-black/90 px-3 sm:px-4 lg:px-5 py-3 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="font-mono text-neutral-500">
          Powered by <span className="text-neutral-100">0x v4</span> · Base (chainId {cid})
        </span>
        <span className="hidden sm:inline text-neutral-500">
          STE · experimental matching engine · not for real trading
        </span>
      </div>
    </footer>
  );
}
