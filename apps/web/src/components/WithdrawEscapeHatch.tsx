// apps/web/src/components/WithdrawEscapeHatch.tsx
// Milestone 3B (+ post-fill UX): the mandatory escape hatch — withdraw assets
// from the smart account back to the owner via an owner-signed userOp, so funds
// are never stuck. Supports the spend token, the RECEIVED (counter) token, and
// native ETH (recover gas). The owner explicitly selects the asset + amount and
// confirms in their wallet; no private key is handled here. Withdraw is disabled
// unless an asset is selected, the amount is a valid positive value within the
// available balance, the SA state has loaded, and a wallet is available.
"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendWithdrawEth,
  sendWithdrawToken,
  type RawProvider,
  type SaSetupState,
} from "@/lib/nexusSa";
import type { TakerToken } from "@/components/NexusSaSetup";
import { cn } from "@/lib/cn";

type AssetOption = {
  key: string;
  symbol: string;
  /** ERC-20 address, or undefined for native ETH. */
  address?: `0x${string}`;
  decimals: number;
  balanceQ: bigint;
};

export default function WithdrawEscapeHatch({
  provider,
  owner,
  taker,
  counter,
  state,
  busy,
  onWithdraw,
}: {
  provider: RawProvider;
  owner: `0x${string}`;
  taker: TakerToken;
  counter: TakerToken | null;
  state: SaSetupState | null;
  busy: boolean;
  onWithdraw: (label: string, fn: () => Promise<`0x${string}`>) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [assetKey, setAssetKey] = useState("taker");
  // Secondary panel — collapsed by default. The header stays visible so this
  // safety access remains discoverable.
  const [open, setOpen] = useState(false);

  // Build the selectable assets from the current SA state. Balances are "0"
  // until state loads (the buttons stay disabled until then anyway).
  const options: AssetOption[] = useMemo(() => {
    const out: AssetOption[] = [
      {
        key: "taker",
        symbol: taker.symbol,
        address: taker.address,
        decimals: taker.decimals,
        balanceQ: state ? BigInt(state.tokenBalanceQ) : BigInt(0),
      },
    ];
    if (counter && counter.address.toLowerCase() !== taker.address.toLowerCase()) {
      out.push({
        key: "counter",
        symbol: counter.symbol,
        address: counter.address,
        decimals: counter.decimals,
        balanceQ: state ? BigInt(state.counterBalanceQ) : BigInt(0),
      });
    }
    out.push({
      key: "eth",
      symbol: "ETH",
      address: undefined,
      decimals: 18,
      balanceQ: state ? BigInt(state.ethWei) : BigInt(0),
    });
    return out;
  }, [taker, counter, state]);

  const sel = options.find((o) => o.key === assetKey) ?? options[0];

  // Strict parse: null unless a valid, strictly-positive amount.
  const parsedQ = useMemo(() => {
    try {
      const q = ethers.parseUnits((amount || "").trim(), sel.decimals);
      return q > BigInt(0) ? q : null;
    } catch {
      return null;
    }
  }, [amount, sel.decimals]);

  const overBalance = parsedQ !== null && parsedQ > sel.balanceQ;
  const availableLabel = state
    ? `${ethers.formatUnits(sel.balanceQ, sel.decimals)} ${sel.symbol}`
    : "—";
  const canWithdraw = !!state && !busy && parsedQ !== null && !overBalance;

  return (
    <Card>
      <CardContent className="space-y-2 text-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-neutral-400 hover:text-neutral-200"
          aria-expanded={open}
        >
          <span>Withdraw / escape hatch</span>
          <span className="text-neutral-500">{open ? "Hide ▲" : "Show ▼"}</span>
        </button>

        {!open && (
          <p className="text-[11px] text-neutral-500">
            Withdraw the spend token, assets received from delegated fills, or ETH gas back to your
            wallet.
          </p>
        )}

        {open && (
          <>
            <p className="text-neutral-400">
              Move any asset from your smart account back to your wallet at any time — the spend
              token, assets received from delegated fills, or ETH gas.
            </p>

            {/* Asset selector */}
            <div className="flex flex-wrap gap-1">
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setAssetKey(o.key)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs",
                    o.key === sel.key
                      ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                      : "border-neutral-700 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-800/60",
                  )}
                >
                  {o.symbol}
                </button>
              ))}
            </div>

            <p className="text-neutral-400">
              Available {sel.symbol}:{" "}
              <span className="font-mono text-neutral-200">{availableLabel}</span>
            </p>

            <div className="flex items-center gap-1">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="h-8 w-24 text-right"
                inputMode="decimal"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canWithdraw}
                title={
                  !state
                    ? "Loading smart-account state…"
                    : parsedQ === null
                      ? "Enter an amount greater than 0"
                      : overBalance
                        ? "Amount exceeds available balance"
                        : ""
                }
                onClick={() =>
                  void onWithdraw("Withdraw", () =>
                    sel.address
                      ? sendWithdrawToken(
                          provider,
                          owner,
                          sel.address,
                          owner,
                          (parsedQ ?? BigInt(0)).toString(),
                        )
                      : sendWithdrawEth(provider, owner, owner, (parsedQ ?? BigInt(0)).toString()),
                  )
                }
              >
                Withdraw to wallet
              </Button>
            </div>
            {overBalance && (
              <p className="text-xs text-amber-300/90">
                Amount exceeds the available {sel.symbol} balance.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
