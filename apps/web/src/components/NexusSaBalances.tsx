// apps/web/src/components/NexusSaBalances.tsx
// Milestone 3B (+ post-fill UX): live, read-only smart-account balances, fed by
// NexusSaSetup's on-chain reads. Shows ETH (gas), the spend token, the RECEIVED
// (counter) token — so assets a delegated fill deposits into the SA are visible,
// not only the spend token — and the 0x EP allowance for the spend token.
// Display-only.
"use client";

import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import type { SaSetupState } from "@/lib/nexusSa";
import type { TakerToken } from "@/components/NexusSaSetup";

export default function NexusSaBalances({
  state,
  taker,
  counter,
  spender,
}: {
  state: SaSetupState | null;
  taker: TakerToken;
  /** The other market token — the asset received by a delegated fill. */
  counter: TakerToken | null;
  spender: string;
}) {
  const eth = state ? `${ethers.formatEther(BigInt(state.ethWei))} ETH` : "—";
  const takerBal = state
    ? `${ethers.formatUnits(BigInt(state.tokenBalanceQ), taker.decimals)} ${taker.symbol}`
    : "—";
  const allow = state
    ? `${ethers.formatUnits(BigInt(state.allowanceQ), taker.decimals)} ${taker.symbol}`
    : "—";

  const rows: Array<[string, string]> = [["ETH (for gas)", eth]];
  // Show base + quote in a stable order regardless of side, labelling by symbol.
  rows.push([`${taker.symbol} balance`, takerBal]);
  if (counter && counter.address.toLowerCase() !== taker.address.toLowerCase()) {
    const counterBal = state
      ? `${ethers.formatUnits(BigInt(state.counterBalanceQ), counter.decimals)} ${counter.symbol}`
      : "—";
    rows.push([`${counter.symbol} balance`, counterBal]);
  }
  rows.push([`0x EP allowance (${taker.symbol})`, allow]);

  return (
    <Card>
      <CardContent className="space-y-1.5 text-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Smart account balances
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-neutral-400">{k}</span>
            <span className="break-all text-right font-mono text-xs text-neutral-200">{v}</span>
          </div>
        ))}
        <p className="text-[10px] text-neutral-500">
          Received assets from delegated fills remain in your Nexus Smart Account until withdrawn.
        </p>
        <div className="text-[10px] text-neutral-500">spender: {spender}</div>
      </CardContent>
    </Card>
  );
}
