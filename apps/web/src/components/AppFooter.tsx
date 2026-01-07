// apps/web/src/components/AppFooter.tsx
"use client";
import React from "react";
import { env } from "@/lib/env";

export default function AppFooter() {
  const cid = env().NEXT_PUBLIC_CHAIN_ID;
  return (
    <div className="text-[11px] text-gray-500 border-t mt-6 pt-3">
      Powered by 0x v4 · Base (chainId {cid})
    </div>
  );
}
