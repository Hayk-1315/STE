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
import { displayAmount } from "@/lib/format";
import { approveIfNeeded } from "@/lib/erc20";
import { getZeroExDomainFallback } from "@/lib/zeroex";
//import { env } from "@/lib/env"; // ⬅️ añadido
import { revokeAllowance } from "@/lib/erc20";
import { useMemo } from "react";

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
  return displayAmount(ethers.formatUnits(raw, decimals), { compact: true, maxDecimals: 4 });
}

function fmtEth(raw: string): string {
  return displayAmount(raw, { maxDecimals: 4 });
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

  const readOnly = useMemo(
    () =>
      process.env.NEXT_PUBLIC_READ_ONLY === "true" || process.env.NEXT_PUBLIC_PROFILE === "mainnet",
    [],
  );

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
    if (!market || !address) return;
    const signer = await getSigner();
    const me = (await signer.getAddress()) as `0x${string}`;
    const provider = signer.provider!;
    const { verifyingContract } = await getZeroExDomainFallback();

    const spenderForAllow: `0x${string}` = verifyingContract as `0x${string}`;

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
  }, [getSigner, market, address]);

  React.useEffect(() => {
    if (!address) {
      setChainId(null);
      return;
    }
    (async () => {
      try {
        const s = await getSigner();
        const net = await s.provider!.getNetwork();
        setChainId(net.chainId);
      } catch {
        setChainId(null);
      }
    })();
  }, [getSigner, address]);

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
      if (disposed) return; // effect torn down before attach finished
      const provider = s.provider!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onBlock = async (_bn: number) => {
        if (disposed || pendingRef.current) return;
        pendingRef.current = true;
        try {
          await load();
        } catch {
          // swallow — likely a transient post-disconnect race
        } finally {
          setTimeout(() => {
            pendingRef.current = false;
          }, 300);
        }
      };
      provider.on("block", onBlock);
      return () => {
        provider.off("block", onBlock);
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
    <Card className="bg-neutral-950 border-neutral-700/60 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
            Balances & Allowances
          </CardTitle>
          {market && (
            <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
              {market.base.symbol}/{market.quote.symbol}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Wallet balances and 0x allowance status for this market.
        </p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-neutral-100">
        {!address ? (
          <div className="rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-400">
            Connect wallet to view balances.
          </div>
        ) : !market ? (
          <div className="text-xs text-neutral-400">Loading market…</div>
        ) : !data ? (
          <div className="text-xs text-neutral-400">{loading ? "Loading…" : "—"}</div>
        ) : (
          <>
            {/* ETH row */}
            <div className="rounded-lg border border-neutral-800/70 bg-neutral-950/40 px-3 py-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>ETH balance</span>
                <span className="font-mono text-neutral-200">{fmtEth(data.eth)}</span>
              </div>
            </div>

            {/* Base token */}
            <div className="rounded-lg border border-neutral-800/70 bg-neutral-950/40 px-3 py-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{market.base.symbol} balance</span>
                <span className="font-mono text-neutral-200">{fmtEth(data.base.bal)}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-neutral-500">Allowance</div>
                  <div className="font-mono text-xs text-neutral-200">{data.base.alw}</div>
                </div>

                {data.spender && (
                  <div className="mt-1 flex flex-wrap justify-end gap-1 font-sans">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-neutral-200"
                      onClick={() => {
                        if (readOnly) {
                          toast.message("Read-only mode");
                          return;
                        }

                        return doApprove(
                          market.base.address as `0x${string}`,
                          market.base.decimals,
                          market.base.symbol,
                        );
                      }}
                    >
                      Enable Max
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-neutral-200"
                      onClick={() => {
                        if (readOnly) {
                          toast.message("Read-only mode");
                          return;
                        }
                        return doApproveCustom(
                          market.base.address as `0x${string}`,
                          market.base.decimals,
                          market.base.symbol,
                        );
                      }}
                    >
                      Custom
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 text-neutral-200"
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
            </div>

            {/* Quote token */}
            <div className="rounded-lg border border-neutral-800/70 bg-neutral-950/40 px-3 py-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{market.quote.symbol} balance</span>
                <span className="font-mono text-neutral-200">{fmtEth(data.quote.bal)}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-neutral-500">Allowance</div>
                  <div className="font-mono text-xs text-neutral-200">{data.quote.alw}</div>
                </div>

                {data.spender && (
                  <div className="mt-1 flex flex-wrap justify-end gap-1 font-sans">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-neutral-200"
                      onClick={() => {
                        if (readOnly) {
                          toast.message("Read-only mode");
                          return;
                        }
                        doApprove(
                          market.quote.address as `0x${string}`,
                          market.quote.decimals,
                          market.quote.symbol,
                        );
                      }}
                    >
                      Enable Max
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-neutral-200"
                      onClick={() => {
                        if (readOnly) {
                          toast.message("Read-only mode");
                          return;
                        }
                        doApproveCustom(
                          market.quote.address as `0x${string}`,
                          market.quote.decimals,
                          market.quote.symbol,
                        );
                      }}
                    >
                      Custom
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 text-neutral-200"
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
              <div className="text-[11px] text-neutral-500 mt-1">
                Spender (0x Allowance Target):{" "}
                <span className="font-mono text-neutral-300">{data.spender}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
