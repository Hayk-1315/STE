// apps/web/src/components/ReadyIntentRowActions.tsx
"use client";

// Phase 5: per-row execution actions for a CMR intent in READY.
//
// Critical safety contract:
//   1. The first click on "Execute" triggers GET /sea/intents/:id/fresh-quote.
//      If the server returns ok:false with any reason, NO wallet popup occurs
//      and the user sees a clear message; the row reverts to "Execute" so it
//      can retry on the next poll cycle.
//   2. On ok:true, the orchestrator calls useMarketOrder.onQuote() which now
//      returns the fresh /match/quote response synchronously. The orchestrator
//      runs a strict sufficient-liquidity guard on that returned value (NOT on
//      stale React state) BEFORE proceeding. If remainingBase !== "0" or no
//      txData/txList is buildable, the wallet does NOT open.
//   3. Once "sufficient" is set, normal useMarketOrder approve/execute buttons
//      drive the wallet — same code path as Market mode, same /match/apply
//      reconcile, same watcher behavior. Phase 5 adds NO new /match/apply
//      semantics.
//   4. EXECUTED state tracking is deferred to Phase 4.x. After the user
//      submits the tx the intent stays in READY (or eventually re-armed
//      ACTIVE/EXPIRED). A small "Tx submitted — watcher will reconcile" hint
//      is shown locally; it does not persist across refresh.

import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { useMarketOrder } from "@/hooks/useMarketOrder";
import { marketQuoteNotionalQ } from "@/lib/validation";
import {
  buildWalletLockMessage,
  getFreshQuote,
  postIntentExecuting,
  postIntentWalletLock,
  type IntentDto,
} from "@/lib/sea";
import { useWallet } from "@/providers/wallet";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";

type ExecStage = "idle" | "validating" | "insufficient" | "sufficient" | "submitted" | "error";

type Props = {
  intent: IntentDto;
  market: Market;
  readOnly: boolean;
  onAfterAction?: () => void;
};

export default function ReadyIntentRowActions({ intent, market, readOnly, onAfterAction }: Props) {
  // Convert atomic sizeBase → human via formatUnits (no JS float division).
  const sizeHuman = (() => {
    try {
      return ethers.formatUnits(intent.sizeBase, market.base.decimals);
    } catch {
      return intent.sizeBase;
    }
  })();
  const tif = (intent.tif === "FOK" ? "FOK" : "IOC") as "IOC" | "FOK";

  // Rules of Hooks: useMarketOrder is called unconditionally at the top of
  // this component's render. It's mounted only when the row is in READY CMR,
  // and unmounted when the row leaves READY (cancel / re-arm / expire) — the
  // hook's internal state is discarded with the component.
  const market$order = useMarketOrder({
    market,
    side: intent.side,
    sizeHuman,
    tif,
    limitPriceTicks: intent.triggerPriceTicks,
  });
  const { onQuote, onApprove, onExecute, needsApproval, busy, hasAnyTx, getLastQuoteFailureCode } =
    market$order;
  const { getSigner } = useWallet();

  const [stage, setStage] = useState<ExecStage>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const [orchestrating, setOrchestrating] = useState(false);
  // Phase 4.x-b: bearer token held in component state between wallet-lock
  // and /executing. Cleared on stage reset.
  const [executionToken, setExecutionToken] = useState<string | null>(null);

  const ttlExpired = (() => {
    if (!intent.preparedQuoteAt) return false;
    const preparedAtMs = new Date(intent.preparedQuoteAt).getTime();
    const ttlSec = (intent.preparedQuote as { ttlSec?: number } | null)?.ttlSec ?? 60;
    return Date.now() > preparedAtMs + ttlSec * 1000;
  })();

  const orchestrate = async () => {
    if (readOnly) {
      toast.error("Read-only mode: SEA actions disabled.");
      return;
    }
    setOrchestrating(true);
    setReason(null);
    setStage("validating");
    setExecutionToken(null);
    try {
      // Step 1: fresh-quote (server-side state + trigger + guard preview).
      const fr = await getFreshQuote(intent.id);
      if (!fr.ok) {
        setStage("error");
        setReason(fr.reason);
        toast.error(`Cannot execute: ${fr.reason.replace(/_/g, " ")}`, {
          duration: 5000,
        });
        onAfterAction?.();
        return;
      }
      // Phase 4.x-b: fresh-quote MUST return lockNonce + walletLockProposal
      // for a READY CMR intent we can actually execute. If they're missing
      // (e.g. backend secret unset), we cannot mint a wallet-lock — abort
      // cleanly so the user retries after ops fixes the env.
      if (!fr.lockNonce || !fr.walletLockProposal) {
        setStage("error");
        setReason("server_lock_unavailable");
        toast.error("Server cannot mint a wallet lock right now. Try again shortly.", {
          duration: 5000,
        });
        return;
      }
      // Phase 4.x-b safety tightening (post-merge ordering fix): wallet-lock
      // is acquired BEFORE the executable /match/quote so the LOB state the
      // tx is built against is the SAME state the monitor cannot re-arm.
      // Accepted v1 trade-off: a later multi-tx or quote rejection happens
      // after the lock has been stamped — no approve popup, no tx popup,
      // no /executing; the lock expires within SEA_WALLET_LOCK_SEC and the
      // monitor re-arms automatically. One wasted EIP-191 popup is the
      // explicit cost.
      try {
        const chainId = Number(env().NEXT_PUBLIC_CHAIN_ID);
        const message = buildWalletLockMessage({
          intentId: intent.id,
          owner: intent.owner,
          chainId,
          lockNonce: fr.lockNonce,
          walletLockUntilAt: fr.walletLockProposal.walletLockUntilAt,
        });
        const signer = await getSigner();
        const signature = await signer.signMessage(message);
        const lockRes = await postIntentWalletLock(intent.id, {
          signature,
          lockNonce: fr.lockNonce,
          walletLockUntilAt: fr.walletLockProposal.walletLockUntilAt,
        });
        setExecutionToken(lockRes.executionToken);
      } catch (e) {
        setStage("error");
        setReason(e instanceof Error ? e.message : "wallet_lock_failed");
        toast.error("Could not authorise execution. Please retry.", { duration: 5000 });
        onAfterAction?.();
        return;
      }
      // Step 2: real quote with the same price guard. Returned value is used
      // directly (NOT React state, which would be stale here). Runs AFTER
      // wallet-lock so the executable tx is built against a frozen READY row.
      const qq = await onQuote();
      if (!qq) {
        // Phase 5 Part B.2: surface the specific failure code when the
        // backend rejected the quote, so the user sees an accurate reason
        // instead of generic quote_failed. getLastQuoteFailureCode is a
        // ref-backed synchronous read; no stale-state risk.
        const code = getLastQuoteFailureCode?.() ?? null;
        setStage("error");
        if (code === "notional_below_min_notional") {
          setReason("notional_below_min_notional_at_execute");
          toast.error(
            "Cannot execute: notional below min notional at execute. Increase size and re-arm.",
            { duration: 5000 },
          );
        } else if (code === "size_below_min_size") {
          setReason("size_below_min_size_at_execute");
        } else {
          setReason("quote_failed");
        }
        return;
      }
      // Phase 5 Part B.2: explicit min-notional check on the returned quote.
      // Mirrors the backend gate and the TradePanel Market check; fires when
      // the BE has been bypassed/misconfigured, or when SEA-specific rules
      // ever drift from /match/quote's rules. Runs BEFORE the sufficient-
      // liquidity guard so a clearer reason is surfaced.
      const notionalQ = marketQuoteNotionalQ(market, intent.side, qq);
      const minNotionalQ = BigInt(market.rules.minNotionalQ);
      if (notionalQ < minNotionalQ) {
        setStage("error");
        setReason("notional_below_min_notional_at_execute");
        toast.error(
          "Cannot execute: notional below min notional at execute. Increase size and re-arm.",
          { duration: 5000 },
        );
        onAfterAction?.();
        return;
      }
      // Step 3: explicit sufficient-liquidity check on the returned quote.
      // remainingBase MUST be "0" AND fills must cover requested AND a tx is
      // buildable. Worst-case race fallback: server-side guard already prevents
      // a worse-than-trigger fill, but we double-gate to avoid an avoidable
      // wallet popup.
      const ZERO = BigInt(0);
      const requested = BigInt(intent.sizeBase);
      const fillsBase = (qq.fills ?? []).reduce((acc, f) => acc + BigInt(f.sizeBase), ZERO);
      const remaining = (() => {
        try {
          return BigInt(qq.remainingBase ?? "0");
        } catch {
          return ZERO;
        }
      })();
      const hasTx = Boolean(qq.txData || (qq.txList && qq.txList.length > 0));
      const sufficient = remaining === ZERO && fillsBase >= requested && hasTx;
      if (!sufficient) {
        setStage("insufficient");
        setReason("insufficient_liquidity_at_execute");
        toast.error(
          "Liquidity moved between validation and quote. Wait for the next refresh and retry.",
          { duration: 5000 },
        );
        onAfterAction?.();
        return;
      }
      // Phase 4.x-b multi-tx guard: CMR Execute v1 supports SINGLE-tx
      // quotes only. A split plan is refused at the FE. Note (v1 trade-off):
      // wallet-lock has ALREADY been stamped by this point, so the row
      // stays locked until `walletLockUntilAt` expires; monitor then
      // re-arms automatically. No approve popup, no tx popup, no marker.
      if (Array.isArray(qq.txList) && qq.txList.length > 1) {
        setStage("insufficient");
        setReason("multi_tx_not_supported");
        toast.error(
          "Split fills not supported for CMR v1. Use the Market panel or wait for a single-tx quote.",
          { duration: 6000 },
        );
        onAfterAction?.();
        return;
      }
      setStage("sufficient");
    } catch (e) {
      setStage("error");
      setReason(e instanceof Error ? e.message : String(e));
    } finally {
      setOrchestrating(false);
    }
  };

  const onApproveClick = async () => {
    if (readOnly) return;
    await onApprove();
  };

  const onConfirmClick = async () => {
    if (readOnly) return;
    // Phase 4.x-b: pass onSubmitted callback so the marker POST fires
    // immediately after broadcast, BEFORE awaiting the receipt.
    // executionToken was minted during orchestrate(); if missing the FE
    // skips the marker call (defensive — wallet-lock step would have
    // bailed earlier).
    const token = executionToken;
    await onExecute({
      onSubmitted: async (txHash: string) => {
        if (!token) return;
        try {
          await postIntentExecuting(intent.id, txHash, token);
        } catch (e) {
          // Non-blocking: the tx is on-chain; we toast but do not throw.

          console.warn("[ReadyIntentRowActions] /executing POST failed", e);
          toast.error(
            "Trade submitted but SEA could not record the link. Tx will reconcile via watcher if it lands.",
            { duration: 6000 },
          );
        }
      },
    });
    setStage("submitted");
    onAfterAction?.();
  };

  // Idle state: single Execute button to start the orchestration. Disabled
  // when the snapshot is locally known to be TTL-expired (server will reject;
  // we save the round-trip).
  if (stage === "idle" || stage === "error" || stage === "insufficient") {
    const blockedByTtl = ttlExpired;
    const label =
      stage === "insufficient"
        ? "Retry"
        : stage === "error"
          ? "Retry"
          : blockedByTtl
            ? "Snapshot expired"
            : "Execute now";
    return (
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-[11px] text-neutral-400">
          {stage === "insufficient" || stage === "error"
            ? (reason ?? "Failed")
            : "Ready to execute. A fresh server-side check runs before the wallet opens."}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={orchestrate}
          disabled={readOnly || orchestrating || blockedByTtl}
          title={
            readOnly ? "Read-only mode" : blockedByTtl ? "Snapshot expired — wait for re-arm" : ""
          }
        >
          {orchestrating ? "Validating…" : label}
        </Button>
      </div>
    );
  }

  // Validating state: spinner while fresh-quote + onQuote in flight.
  if (stage === "validating") {
    return (
      <div className="mt-2 text-[11px] text-neutral-400">
        Validating intent and fetching a fresh guarded quote…
      </div>
    );
  }

  // Sufficient state: render approval (if needed) then confirm. Approval/
  // execute share the existing useMarketOrder pipeline — no SEA-specific
  // tx-builder code.
  if (stage === "sufficient") {
    if (needsApproval) {
      return (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-[11px] text-neutral-400">
            Plan ready · approval required for taker token
          </div>
          <Button type="button" size="sm" onClick={onApproveClick} disabled={readOnly || busy}>
            {busy ? "Approving…" : "Approve"}
          </Button>
        </div>
      );
    }
    return (
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-[11px] text-neutral-400">Plan ready · confirm in wallet</div>
        <Button
          type="button"
          size="sm"
          onClick={onConfirmClick}
          disabled={readOnly || busy || !hasAnyTx}
        >
          {busy ? "Sending…" : "Confirm"}
        </Button>
      </div>
    );
  }

  // Submitted state: tx broadcast. The intents poll will surface
  // EXECUTING → EXECUTED / FAILED from the backend on the next refresh.
  return <div className="mt-2 text-[11px] text-emerald-300">Submitted — confirming on-chain…</div>;
}
