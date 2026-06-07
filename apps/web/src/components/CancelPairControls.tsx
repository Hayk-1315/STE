// apps/web/src/components/CancelPairControls.tsx
"use client";

import React, { useMemo } from "react";
import type { Market } from "@/lib/api";
import { useWallet } from "@/providers/wallet";
import { toast } from "sonner";
import { postBuildCancelPairTx, getOrders } from "@/lib/api";
import { SALT_OFFSET, MINVALID_AFTER_LEGACY } from "@/lib/salt";
import { cn } from "@/lib/cn";

export function CancelPairControls({
  market,
  className,
}: {
  market: Market | null;
  className?: string;
}) {
  const { getSigner, address } = useWallet(); // ← añadido: address para el pre-chequeo
  const [busy, setBusy] = React.useState(false);
  const [scope, setScope] = React.useState<"all" | "older-now" | "older-5m">("older-now");

  const readOnly = useMemo(
    () =>
      process.env.NEXT_PUBLIC_READ_ONLY === "true" || process.env.NEXT_PUBLIC_PROFILE === "mainnet",
    [],
  );

  if (!market) return null;

  // Wallet-scoped pre-check: only proceed with the cancelPair tx (and the
  // MetaMask popup) if the connected wallet actually has an open order in
  // the current market. Fixes the Phase 5 regression where the previous
  // implementation passed the connected wallet as `maker=` (the backend
  // expects `address=`), so the request silently returned ANY order in the
  // symbol regardless of owner; the orderbook fallback compounded the bug
  // by treating "market has levels" as "wallet has cancellable orders".
  //
  // Behaviour:
  //   - no address / no symbol → false (nothing to cancel).
  //   - PLACED or PARTIALLY_FILLED row exists for this wallet+symbol → true.
  //   - network / parse failure → false (fail closed; the user retries
  //     instead of seeing a misleading MetaMask popup and a no-op cancel).
  async function hasCancelable(): Promise<boolean> {
    try {
      if (!address) return false;
      const symbol = market?.symbol;
      if (!symbol) return false;

      const res = await getOrders({
        address,
        status: "PLACED,PARTIALLY_FILLED",
        symbol,
        limit: 1,
      });
      return Array.isArray(res?.items) && res.items.length > 0;
    } catch {
      return false;
    }
  }

  async function runCancelPair() {
    if (!market) return;
    setBusy(true);
    try {
      // ---- añadido: aborta sin abrir MM si no hay nada que cancelar ----
      const ok = await hasCancelable();
      if (!ok) {
        toast.info("There are no active orders to cancel for this pair.");
        setBusy(false);
        return;
      }
      // -----------------------------------------------------------------

      const makerToken = market.base.address as `0x${string}`;
      const takerToken = market.quote.address as `0x${string}`;

      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      // límites “older than …” en el sub-espacio de 128 bits (ts<<96)
      const olderNowBoundary = nowSec << BigInt(96);
      const older5mBoundary = BigInt(Math.max(0, Number(nowSec) - 5 * 60)) << BigInt(96);

      let minValid: bigint;
      if (scope === "all") {
        // “All” = invalida todo lo firmado hasta ahora (cruza legacy y 256-bit)
        minValid = SALT_OFFSET + olderNowBoundary;
      } else if (scope === "older-5m") {
        minValid = SALT_OFFSET + older5mBoundary;
      } else {
        // "older-now"
        minValid = SALT_OFFSET + olderNowBoundary;
      }

      // Si alguna vez subiste EXACTAMENTE 2^128 en pruebas, evita bajar de ese corte
      if (minValid < BigInt(MINVALID_AFTER_LEGACY)) {
        minValid = BigInt(MINVALID_AFTER_LEGACY);
      }

      const { txData } = await postBuildCancelPairTx({
        makerToken,
        takerToken,
        minValidSalt: minValid.toString(),
      });

      const signer = await getSigner();
      const sent = await signer.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value ?? "0"),
      });
      toast.message("Cancel pair submitted", { description: sent.hash });

      const rec = await sent.wait();
      toast.success("Cancel pair confirmed", { description: rec?.hash ?? sent.hash });

      // refresco de UI global
      window.dispatchEvent(new CustomEvent("ste:refresh"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        className="rounded-md border border-neutral-700 bg-neutral-900/70 px-2 py-1 text-xs"
        value={scope}
        onChange={(e) => setScope(e.target.value as "all" | "older-now" | "older-5m")}
      >
        <option value="older-now">Cancel older than now</option>
        <option value="older-5m">Cancel older than 5 min</option>
        <option value="all">Cancel ALL for pair</option>
      </select>
      <button
        disabled={busy}
        onClick={() => {
          if (readOnly) {
            toast.message("Read-only mode");
            return;
          }
          void runCancelPair();
        }}
        className="rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/20 disabled:opacity-50"
      >
        {busy ? "…" : `Cancel ${market.symbol}`}
      </button>
    </div>
  );
}
// --- fin añadido ---
