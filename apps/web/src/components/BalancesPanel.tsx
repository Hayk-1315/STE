// apps/web/src/components/BalancesPanel.tsx
"use client";

import React from "react";
import { ethers } from "ethers";
import { useWallet } from "@/providers/wallet";
import type { Market } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { erc20Balance, erc20Allowance } from "@/lib/erc20";
import { approveIfNeeded } from "@/lib/erc20";
import { getZeroExDomainFallback } from "@/lib/zeroex";
import { env } from "@/lib/env"; // ⬅️ añadido
import { revokeAllowance } from "@/lib/erc20";

type Props = { market: Market | null };

// ABI mínimo para approve(address,uint256)
const ERC20_APPROVE_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

// ---- pretty allowance helpers ----
// Casi todos los routers usan MAX para "approve max"; umbral alto evita falsos positivos.
const isUnlimitedAllowance = (raw: bigint) => raw > BigInt(1) << BigInt(255);

function fmtAllowanceLabel(raw: bigint, decimals: number): string {
  if (isUnlimitedAllowance(raw)) return "Unlimited";
  const human = ethers.formatUnits(raw, decimals); // string
  // Compacta para UI (no necesitamos precisión científica aquí)
  const n = Number(human);
  if (!Number.isFinite(n)) return human; // fallback
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 4,
  }).format(n);
}

export default function BalancesPanel({ market }: Props) {
  const { getSigner, address } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<{
    eth: string;
    base: { bal: string; alw: string };
    quote: { bal: string; alw: string };
    spender?: `0x${string}`;
  } | null>(null);
  const [chainId, setChainId] = React.useState<bigint | null>(null);

  function isZeroDisplay(s: string): boolean {
    return /^0(?:\.0+)?$/.test(s.trim());
  }

  async function doRevoke(token: `0x${string}`, label: string) {
    try {
      const signer = await getSigner();

      // usa el mismo spender que ya resolviste
      let spenderToUse: `0x${string}` | undefined = data?.spender;
      if (!spenderToUse) {
        const { verifyingContract } = await getZeroExDomainFallback();
        spenderToUse = verifyingContract as `0x${string}`;
      }

      const ok = window.confirm(
        `Vas a revocar por completo el allowance de ${label} para el spender:\n${spenderToUse}\n\n¿Continuar?`,
      );
      if (!ok) return;

      const txHash = await revokeAllowance(signer, token, spenderToUse);
      toast.success(`Revoke enviado · ${txHash.slice(0, 10)}…`, { duration: 3500 });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  const load = React.useCallback(async () => {
    if (!market) return;
    const signer = await getSigner();
    const me = (await signer.getAddress()) as `0x${string}`;
    const provider = signer.provider!;
    const { verifyingContract } = await getZeroExDomainFallback();

    // 🔹 nuevo: intentar obtener allowanceSpender desde /dev/zeroex/sanity
    let spenderForAllow: `0x${string}` = verifyingContract as `0x${string}`;
    try {
      const base = env().NEXT_PUBLIC_API_BASE_URL;
      const r = (await fetch(`${base}/dev/zeroex/sanity`).then((x) => x.json())) as {
        allowanceSpender?: string;
      } | null;
      const s = r?.allowanceSpender;
      if (typeof s === "string" && s.startsWith("0x") && s.length === 42) {
        spenderForAllow = s as `0x${string}`;
      }
    } catch {
      // ignore → fallback al EP ya asignado
    }

    // native ETH balance
    const ethBal = await provider.getBalance(me);

    // ERC20 balances + allowances (usando el spender resuelto)
    const baseBal = await erc20Balance(provider, market.base.address as `0x${string}`, me);
    const quoteBal = await erc20Balance(provider, market.quote.address as `0x${string}`, me);
    const baseAlw = await erc20Allowance(
      provider,
      market.base.address as `0x${string}`,
      me,
      spenderForAllow,
    );
    const quoteAlw = await erc20Allowance(
      provider,
      market.quote.address as `0x${string}`,
      me,
      spenderForAllow,
    );

    setData({
      eth: ethers.formatEther(ethBal),
      base: {
        bal: ethers.formatUnits(baseBal, market.base.decimals),
        alw: fmtAllowanceLabel(baseAlw, market.base.decimals),
      },
      quote: {
        bal: ethers.formatUnits(quoteBal, market.quote.decimals),
        alw: fmtAllowanceLabel(quoteAlw, market.quote.decimals),
      },
      spender: spenderForAllow, // 🔹 guarda el spender usado
    });
  }, [getSigner, market]);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await getSigner();
        const net = await s.provider!.getNetwork();
        setChainId(net.chainId);
      } catch {
        setChainId(null);
      }
    })();
  }, [getSigner]);

  React.useEffect(() => {
    setData(null);
    if (!market || !address) return;
    setLoading(true);
    load()
      .catch((e) => toast.error(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [market, address, chainId, load]);

  async function doApprove(token: `0x${string}`, decimals: number, label: string) {
    try {
      const signer = await getSigner();

      // usa el mismo spender que mostramos (fallback al EP si aún no está)
      let spenderToUse: `0x${string}` | undefined = data?.spender;
      if (!spenderToUse) {
        const { verifyingContract } = await getZeroExDomainFallback();
        spenderToUse = verifyingContract as `0x${string}`;
      }

      // ✅ aprobar infinito para que fmtAllowanceLabel muestre "Unlimited"
      await approveIfNeeded(signer, token, spenderToUse, ethers.MaxUint256);

      toast.success(`Approve ${label} done`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  // 🔸 NUEVO: approve con importe personalizado
  async function doApproveCustom(token: `0x${string}`, decimals: number, label: string) {
    try {
      const signer = await getSigner();

      let spenderToUse: `0x${string}` | undefined = data?.spender;
      if (!spenderToUse) {
        const { verifyingContract } = await getZeroExDomainFallback();
        spenderToUse = verifyingContract as `0x${string}`;
      }

      const raw = window.prompt(`Amount of ${label} to approve:`) ?? "";
      const val = raw.trim();
      if (!val) return;

      let amount: bigint;
      try {
        amount = ethers.parseUnits(val, decimals);
      } catch {
        toast.error("Invalid amount");
        return;
      }
      if (amount <= BigInt(0)) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const erc20 = new ethers.Contract(token, ERC20_APPROVE_ABI, signer);
      const tx = await erc20.approve(spenderToUse, amount);
      toast.message(`Approving ${label}`, { description: tx.hash });
      await tx.wait();
      toast.success(`${label} approved`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  // 🔸 auto-refresh cuando se mina un bloque (para ver balances tras la tx)
  React.useEffect(() => {
    let disposed = false;
    const pendingRef = { current: false as boolean };
    const attach = async () => {
      if (!market || !address) return;
      const s = await getSigner();
      const provider = s.provider!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onBlock = async (_bn: number) => {
        if (pendingRef.current) return;
        pendingRef.current = true;
        try {
          await load();
        } finally {
          // pequeño throttle (~300ms) para evitar spam
          setTimeout(() => {
            pendingRef.current = false;
          }, 300);
        }
      };
      provider.on("block", onBlock);
      return () => {
        if (!disposed) {
          provider.off("block", onBlock);
        }
      };
    };
    let cleanup: (() => void) | undefined;
    attach().then((c) => {
      cleanup = c;
    });
    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [getSigner, address, market, load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balances & Allowances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {!address ? (
          <div>Connect wallet to view balances.</div>
        ) : !market ? (
          <div>Loading market…</div>
        ) : !data ? (
          <div>{loading ? "Loading…" : "—"}</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-gray-500">ETH</div>
              <div className="col-span-2 font-mono text-right">{data.eth}</div>

              <div className="text-gray-500">{market.base.symbol} bal</div>
              <div className="col-span-2 font-mono text-right">{data.base.bal}</div>

              <div className="text-gray-500">{market.base.symbol} allowance</div>
              <div className="col-span-2 font-mono text-right">
                <div>{data.base.alw}</div>

                {data.spender && (
                  <div className="mt-1 flex justify-end gap-1 font-sans">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        doApprove(
                          market.base.address as `0x${string}`,
                          market.base.decimals,
                          market.base.symbol,
                        )
                      }
                    >
                      Enable Max
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        doApproveCustom(
                          market.base.address as `0x${string}`,
                          market.base.decimals,
                          market.base.symbol,
                        )
                      }
                    >
                      Custom
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      disabled={isZeroDisplay(data.base.alw)}
                      onClick={() =>
                        doRevoke(market.base.address as `0x${string}`, market.base.symbol)
                      }
                      title={
                        isZeroDisplay(data.base.alw)
                          ? "Allowance ya está en 0"
                          : "Revocar allowance"
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-gray-500">{market.quote.symbol} bal</div>
              <div className="col-span-2 font-mono text-right">{data.quote.bal}</div>

              <div className="text-gray-500">{market.quote.symbol} allowance</div>
              <div className="col-span-2 font-mono text-right">
                <div>{data.quote.alw}</div>

                {data.spender && (
                  <div className="mt-1 flex justify-end gap-1 font-sans">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        doApprove(
                          market.quote.address as `0x${string}`,
                          market.quote.decimals,
                          market.quote.symbol,
                        )
                      }
                    >
                      Enable Max
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        doApproveCustom(
                          market.quote.address as `0x${string}`,
                          market.quote.decimals,
                          market.quote.symbol,
                        )
                      }
                    >
                      Custom
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      disabled={isZeroDisplay(data.quote.alw)}
                      onClick={() =>
                        doRevoke(market.quote.address as `0x${string}`, market.quote.symbol)
                      }
                      title={
                        isZeroDisplay(data.quote.alw)
                          ? "Allowance ya está en 0"
                          : "Revocar allowance"
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {data.spender && (
              <div className="text-xs text-gray-500 mt-1">
                Spender (0x Allowance Target): <span className="font-mono">{data.spender}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
