"use client";

import React from "react";
import { useWallet } from "@/providers/wallet";
import { env } from "@/lib/env";

type EIP1193ProviderWithEvents = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export default function ChainBadge() {
  const { getSigner, address } = useWallet();
  const [cid, setCid] = React.useState<bigint | null>(null);
  const expected = BigInt(env().NEXT_PUBLIC_CHAIN_ID);

  React.useEffect(() => {
    let alive = true;
    let offEip1193: (() => void) | null = null;

    (async () => {
      try {
        const s = await getSigner();
        const p = s.provider!; // ethers BrowserProvider

        // 1) Lee red actual con ethers (seguro)
        const net = await p.getNetwork();
        if (alive) setCid(net.chainId);

        // 2) Suscríbete SOLO al EIP-1193 crudo (window.ethereum)
        const raw = (globalThis as Record<string, unknown>)?.ethereum as
          | EIP1193ProviderWithEvents
          | undefined;
        if (raw?.on) {
          const onChainChanged = (hexId: unknown) => {
            try {
              // MetaMask envía hex string "0x..."
              const id =
                typeof hexId === "string" && hexId.startsWith("0x")
                  ? BigInt(hexId)
                  : BigInt(hexId as number | bigint);
              if (alive) setCid(id);
            } catch {
              // Fallback: reconsulta a ethers si algo raro llega
              p.getNetwork()
                .then((n) => alive && setCid(n.chainId))
                .catch(() => {});
            }
          };

          raw.on("chainChanged", onChainChanged);
          offEip1193 = () => {
            try {
              raw.removeListener?.("chainChanged", onChainChanged);
              raw.off?.("chainChanged", onChainChanged);
            } catch {
              /* noop */
            }
          };
        }
      } catch {
        if (alive) setCid(null);
      }
    })();

    return () => {
      alive = false;
      offEip1193?.();
    };
  }, [getSigner, address]);

  const ok = cid !== null && cid === expected;
  const label = cid?.toString() ?? "—";
  return (
    <span
      className={`text-sm px-2 py-1 rounded ${
        ok ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      Chain: {label} {ok ? "" : "(switch?)"}
    </span>
  );
}
