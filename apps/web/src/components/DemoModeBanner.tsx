// apps/web/src/components/DemoModeBanner.tsx
"use client";

import React from "react";
import { JsonRpcProvider } from "ethers";
import { env, rpcUrl } from "@/lib/env";

type Sanity = { exchangeProxy?: string; chainId?: number };

export default function DemoModeBanner() {
  const [isMock, setIsMock] = React.useState(false);
  const [addr, setAddr] = React.useState<`0x${string}` | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const base = env().NEXT_PUBLIC_API_BASE_URL;
        const r = await fetch(`${base}/dev/zeroex/sanity`, { cache: "no-store" });
        const s: Sanity | null = r.ok ? await r.json() : null;
        const ep = (s?.exchangeProxy ?? "") as string;

        if (!ep || !ep.startsWith("0x") || ep.length !== 42) {
          if (alive) {
            setIsMock(true);
            setAddr(null);
          }
          return;
        }
        const provider = new JsonRpcProvider(rpcUrl());
        const code = await provider.getCode(ep as `0x${string}`);
        if (alive) {
          setAddr(ep as `0x${string}`);
          setIsMock(code === "0x");
        }
      } catch {
        if (alive) setIsMock(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!isMock) return null;

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
      Demo mode: el Exchange Proxy {addr ?? "(no configurado)"} no tiene bytecode en esta red. Las
      “Tx sent” no moverán tokens. En F5 usaremos EP y tokens reales de Base Sepolia.
    </div>
  );
}
