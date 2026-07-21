// apps/web/src/components/NexusSaSetup.tsx
// Milestone 3B: real, one-time Nexus Smart Account setup (deploy / fund ETH /
// fund taker token / bounded approve / install SmartSessions). The OWNER signs
// every tx and userOp in their wallet — no private key is handled here and the
// backend never receives a key. All amounts are shown before action; the 0x EP
// approval is bounded to the deposited balance (never unlimited). This component
// still does NOT create an intent, prepare/finalize a grant, or execute a CMR —
// it only reports setup completeness via onSetupState (Milestone 3C:
// DelegatedCmrToggle uses that to gate whether a delegated intent may be created).
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/providers/wallet";
import { useDelegationCapability } from "@/hooks/useDelegationCapability";
import { zeroExEP } from "@/lib/env";
import type { Market } from "@/lib/api";
import type { IntentSide } from "@/lib/sea";
import {
  readSaSetupState,
  sendApprove,
  sendDeploy,
  sendFundEth,
  sendFundToken,
  sendInstallModule,
  type RawProvider,
  type SaSetupState,
} from "@/lib/nexusSa";
import NexusSaBalances from "@/components/NexusSaBalances";
import WithdrawEscapeHatch from "@/components/WithdrawEscapeHatch";

export type TakerToken = { address: `0x${string}`; symbol: string; decimals: number };

export default function NexusSaSetup({
  market,
  side,
  onSaAddress,
  onSetupState,
  requiredSpendQ,
}: {
  market: Market | null;
  side: IntentSide;
  onSaAddress?: (addr: string | null) => void;
  /** Milestone 3C: lets the parent gate delegated-intent submission on full setup. */
  onSetupState?: (state: SaSetupState | null) => void;
  /**
   * Worst-case taker-token spend (base units) the delegated CMR will need, if it
   * can be computed from the current form. When provided, the fund/approve steps
   * are only "done" once balance/allowance cover it — not merely > 0 — so an
   * under-funded delegated CMR cannot pass setup. Null = not computable yet
   * (falls back to the legacy "> 0" hint, but submission stays gated upstream).
   */
  requiredSpendQ?: bigint | null;
}) {
  const { address, getRawProvider } = useWallet();
  const cap = useDelegationCapability();

  // Stable across renders so the read effect doesn't re-run every render.
  const taker: TakerToken | null = useMemo(() => {
    const info = market ? (side === "BUY" ? market.quote : market.base) : null;
    return info
      ? {
          address: info.address as `0x${string}`,
          symbol: info.symbol,
          decimals: info.decimals,
        }
      : null;
  }, [market, side]);

  // The OTHER market token — the asset RECEIVED by a delegated fill (base for a
  // BUY, quote for a SELL). Shown in balances + withdrawable via the escape hatch.
  const counter: TakerToken | null = useMemo(() => {
    const info = market ? (side === "BUY" ? market.base : market.quote) : null;
    return info
      ? {
          address: info.address as `0x${string}`,
          symbol: info.symbol,
          decimals: info.decimals,
        }
      : null;
  }, [market, side]);

  const [state, setState] = useState<SaSetupState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ethInput, setEthInput] = useState("0.03");
  const [tokenInput, setTokenInput] = useState("");

  const owner = (address ?? null) as `0x${string}` | null;
  const provider = getRawProvider() as unknown as RawProvider | null;
  const ep = zeroExEP();

  const refresh = useCallback(async () => {
    if (!owner || !provider || !taker) {
      setState(null);
      onSaAddress?.(null);
      onSetupState?.(null);
      return;
    }
    try {
      const s = await readSaSetupState(provider, owner, taker.address, ep, counter?.address);
      setState(s);
      onSaAddress?.(s.saAddress);
      onSetupState?.(s);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }, [owner, provider, taker, counter, ep, onSaAddress, onSetupState]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await refresh();
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const run = useCallback(
    async (label: string, fn: () => Promise<`0x${string}`>) => {
      setErr(null);
      setBusy(label);
      try {
        const hash = await fn();
        toast.success(`${label} sent`, { description: hash });
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        toast.error(`${label} failed`, { description: msg });
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  if (!cap.available) {
    return (
      <Card>
        <CardContent className="text-sm text-neutral-300">{cap.reason}</CardContent>
      </Card>
    );
  }
  if (!taker || !owner || !provider) {
    return (
      <Card>
        <CardContent className="text-sm text-neutral-400">
          Select a market and connect an injected wallet to set up delegated execution.
        </CardContent>
      </Card>
    );
  }

  // dataReady = the on-chain SA state has been read successfully. Until then,
  // ALL setup actions stay disabled and balances render as "loading", never 0.
  const dataReady = state !== null;
  const deployed = state?.deployed ?? false;
  const funded = state ? BigInt(state.ethWei) > BigInt(0) : false;
  const tokenBalQ = state ? BigInt(state.tokenBalanceQ) : BigInt(0);
  const allowanceQ = state ? BigInt(state.allowanceQ) : BigInt(0);
  const moduleInstalled = state?.moduleInstalled ?? false;
  const canAct = !busy && dataReady;

  // Worst-case spend gating: when the parent supplies a required spend, the
  // token-funded / approved steps must cover it (not just be > 0). Falls back
  // to the legacy "> 0" check when no requirement is known yet.
  const required = requiredSpendQ && requiredSpendQ > BigInt(0) ? requiredSpendQ : null;
  const tokenFundedEnough = required ? tokenBalQ >= required : tokenBalQ > BigInt(0);
  const approvedEnough = required
    ? allowanceQ >= required && tokenBalQ >= required
    : allowanceQ >= tokenBalQ && tokenBalQ > BigInt(0);
  // Approve EXACTLY the delegated requirement (spend incl. fee/buffer) — never
  // the full deposited balance, never unlimited. This keeps the 0x EP allowance
  // scoped to this one CMR. Only when no requirement is known yet (submission is
  // blocked in that case anyway) do we fall back to the balance.
  const approveTargetQ = required ?? tokenBalQ;

  // Strict input validation so fund/withdraw buttons never enable on empty,
  // non-numeric, or non-positive input (issue 4). Null = not a valid positive.
  const ethAmountWei = parsePositiveEther(ethInput);
  const tokenAmountQ = parsePositiveUnits(tokenInput, taker.decimals);

  return (
    <Card>
      <CardContent className="space-y-3 text-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Smart account setup
        </div>
        <p className="text-neutral-400">One-time setup — you confirm each step in your wallet.</p>

        <div className="flex justify-between gap-3">
          <span className="text-neutral-400">Your smart account</span>
          <span className="break-all text-right font-mono text-xs text-neutral-200">
            {state?.saAddress ?? (err ? "unavailable" : "computing…")}
          </span>
        </div>

        {/* Loading / error gate: until the on-chain state loads, actions below
            stay disabled and this shows a loading or retry state (never 0-value
            balances). */}
        {!dataReady && (
          <div className="text-xs">
            {err ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-red-400">Couldn&apos;t read smart-account state.</span>
                <Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>
                  Retry
                </Button>
              </div>
            ) : (
              <span className="text-neutral-500">Loading smart-account state…</span>
            )}
          </div>
        )}

        {/* The per-CMR required-spend summary lives in the Create delegated intent
            card (it depends on the current CMR form). Setup stays focused on
            one-time readiness; the fund/approve steps below still gate on the
            requirement so approval is bounded to exactly what this CMR needs. */}

        {/* Step 1: deploy */}
        <StepRow
          done={deployed}
          title="1. Deploy smart account"
          hint="one-time, paid by your wallet"
        >
          <Button
            type="button"
            size="sm"
            disabled={!canAct || deployed}
            onClick={() => void run("Deploy", () => sendDeploy(provider, owner))}
          >
            {deployed ? "Done" : busy === "Deploy" ? "…" : "Deploy"}
          </Button>
        </StepRow>

        {/* Step 2: fund ETH */}
        <StepRow
          done={funded}
          title="2. Fund with ETH (gas)"
          hint={state ? `${ethers.formatEther(BigInt(state.ethWei))} ETH now` : ""}
        >
          <div className="flex items-center gap-1">
            <Input
              value={ethInput}
              onChange={(e) => setEthInput(e.target.value)}
              className="h-8 w-20 text-right"
              inputMode="decimal"
            />
            <Button
              type="button"
              size="sm"
              disabled={!canAct || ethAmountWei === null}
              title={ethAmountWei === null ? "Enter an amount greater than 0" : ""}
              onClick={() =>
                void run("Fund ETH", () =>
                  sendFundEth(
                    provider,
                    owner,
                    state!.saAddress,
                    (ethAmountWei ?? BigInt(0)).toString(),
                  ),
                )
              }
            >
              {busy === "Fund ETH" ? "…" : "Send"}
            </Button>
          </div>
        </StepRow>

        {/* Step 3: fund taker token */}
        <StepRow
          done={tokenFundedEnough}
          title={`3. Fund with ${taker.symbol}`}
          hint={state ? `${ethers.formatUnits(tokenBalQ, taker.decimals)} ${taker.symbol} now` : ""}
        >
          <div className="flex items-center gap-1">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="0.0"
              className="h-8 w-20 text-right"
              inputMode="decimal"
            />
            <Button
              type="button"
              size="sm"
              disabled={!canAct || tokenAmountQ === null}
              title={tokenAmountQ === null ? "Enter an amount greater than 0" : ""}
              onClick={() =>
                void run("Fund token", () =>
                  sendFundToken(
                    provider,
                    owner,
                    taker.address,
                    state!.saAddress,
                    (tokenAmountQ ?? BigInt(0)).toString(),
                  ),
                )
              }
            >
              {busy === "Fund token" ? "…" : "Send"}
            </Button>
          </div>
        </StepRow>

        {/* Step 4: bounded approve (exactly what's needed — never unlimited) */}
        <StepRow
          done={approvedEnough}
          title="4. Approve 0x Exchange Proxy"
          hint={
            state
              ? `bounded to ${ethers.formatUnits(approveTargetQ, taker.decimals)} ${taker.symbol} — never unlimited`
              : ""
          }
        >
          <Button
            type="button"
            size="sm"
            disabled={
              !canAct || !deployed || !funded || approveTargetQ === BigInt(0) || approvedEnough
            }
            title={
              approvedEnough
                ? "Approval already covers the required amount"
                : !deployed
                  ? "Deploy first"
                  : !funded
                    ? "Fund ETH first"
                    : approveTargetQ === BigInt(0)
                      ? "Fund the token first"
                      : ""
            }
            onClick={() =>
              void run("Approve", () =>
                sendApprove(provider, owner, taker.address, ep, approveTargetQ.toString()),
              )
            }
          >
            {approvedEnough ? "Sufficient" : busy === "Approve" ? "…" : "Approve"}
          </Button>
        </StepRow>

        {/* Step 5: install SmartSessions */}
        <StepRow
          done={moduleInstalled}
          title="5. Install session module"
          hint="lets delegated execution run later"
        >
          <Button
            type="button"
            size="sm"
            disabled={!canAct || !deployed || !funded || moduleInstalled}
            title={!deployed ? "Deploy first" : !funded ? "Fund ETH first" : ""}
            onClick={() => void run("Install module", () => sendInstallModule(provider, owner))}
          >
            {moduleInstalled ? "Done" : busy === "Install module" ? "…" : "Install"}
          </Button>
        </StepRow>

        {err && <p className="text-xs text-red-400">{err}</p>}

        <NexusSaBalances state={state} taker={taker} counter={counter} spender={ep} />
        <WithdrawEscapeHatch
          provider={provider}
          owner={owner}
          taker={taker}
          counter={counter}
          state={state}
          busy={busy !== null}
          onWithdraw={run}
        />
      </CardContent>
    </Card>
  );
}

/** Parse a human token amount to base units; null unless it is a valid > 0. */
function parsePositiveUnits(input: string, decimals: number): bigint | null {
  try {
    const q = ethers.parseUnits((input ?? "").trim(), decimals);
    return q > BigInt(0) ? q : null;
  } catch {
    return null;
  }
}

/** Parse a human ETH amount to wei; null unless it is a valid > 0. */
function parsePositiveEther(input: string): bigint | null {
  try {
    const w = ethers.parseEther((input ?? "").trim());
    return w > BigInt(0) ? w : null;
  } catch {
    return null;
  }
}

function StepRow({
  done,
  title,
  hint,
  children,
}: {
  done: boolean;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-800/60 pt-2">
      <span className="text-neutral-300">
        <span className={done ? "text-emerald-400" : "text-neutral-500"}>{done ? "✓ " : "• "}</span>
        {title}
        {hint ? <span className="ml-1 text-xs text-neutral-500">({hint})</span> : null}
      </span>
      {children}
    </div>
  );
}
