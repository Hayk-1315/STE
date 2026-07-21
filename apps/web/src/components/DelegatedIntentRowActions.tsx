// apps/web/src/components/DelegatedIntentRowActions.tsx
// Milestone 3D: row actions for a DELEGATED CMR intent (one that has a
// DelegationGrant). Rendered by IntentsPanel INSTEAD of ReadyIntentRowActions
// when a grant exists — so a delegated intent never shows a manual "Execute
// now" button. Shows grant status + intent status + execution attempts, and a
// revoke flow (backend stop is immediate; optional explicit on-chain session
// disable). No wallet popup is needed for execution — the Nexus Smart Account
// executes automatically at READY if the policy checks pass. This component
// does NOT touch ReadyIntentRowActions or the manual CMR/CL flow.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/providers/wallet";
import { Button } from "@/components/ui/button";
import { txUrl } from "@/lib/explorer";
import {
  getDelegatedAttempts,
  revokeDelegatedGrant,
  type DelegatedAttemptSummary,
  type DelegatedGrantSummary,
} from "@/lib/delegated";
import { friendlyDelegatedError } from "@/lib/delegatedErrors";
import type { IntentDto } from "@/lib/sea";

export default function DelegatedIntentRowActions({
  intent,
  grant,
  onAfterAction,
}: {
  intent: IntentDto;
  grant: DelegatedGrantSummary;
  onAfterAction: () => void;
}) {
  const { address, getSigner } = useWallet();
  const [attempts, setAttempts] = useState<DelegatedAttemptSummary[]>([]);
  const [revoking, setRevoking] = useState(false);
  const [disableCall, setDisableCall] = useState<{ to: string; data: string } | null>(null);
  const [disableTx, setDisableTx] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refreshAttempts = useCallback(async () => {
    if (!address) return;
    try {
      const rows = await getDelegatedAttempts(address, intent.id);
      setAttempts(rows);
    } catch {
      /* attempts are best-effort; keep the row usable */
    }
  }, [address, intent.id]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await refreshAttempts();
    })();
    return () => {
      active = false;
    };
  }, [refreshAttempts]);

  const onRevoke = useCallback(async () => {
    if (!address) return;
    setErr(null);
    setRevoking(true);
    try {
      const res = await revokeDelegatedGrant({ intentId: intent.id, owner: address });
      if (!res.ok) {
        setErr(res.reason ?? "revoke_failed");
        return;
      }
      // Backend execution stops immediately. On-chain disable is optional/extra.
      if (res.to && res.data && res.to !== "0x" && res.data !== "0x") {
        setDisableCall({ to: res.to, data: res.data });
      }
      toast.success("Delegated grant revoked", { description: intent.id });
      onAfterAction();
    } catch (e) {
      setErr(friendlyDelegatedError(e));
    } finally {
      setRevoking(false);
    }
  }, [address, intent.id, onAfterAction]);

  // Surface a clearer, actionable explanation when the last execution reverted
  // at the inner-call level (issue 4). The bundler/EntryPoint may report success
  // while the wrapped 0x fill reverts — a confusing "userop_failed" otherwise.
  const revertReason = useMemo(() => {
    const fromAttempt = attempts.find(
      (a) => (a.decision === "FAILED" || a.decision === "REJECTED") && a.reason,
    )?.reason;
    const raw = fromAttempt ?? (intent.status === "FAILED" ? (intent.failureReason ?? null) : null);
    if (!raw) return null;
    return raw;
  }, [attempts, intent.status, intent.failureReason]);

  const isUserOpRevert = useMemo(() => {
    const r = (revertReason ?? "").toLowerCase();
    return (
      r.includes("userop_failed") ||
      r.includes("reverted") ||
      r.includes("revert") ||
      r.includes("aa2") || // AA validation/exec error families
      r.includes("execution")
    );
  }, [revertReason]);

  const onDisableOnChain = useCallback(async () => {
    if (!disableCall) return;
    setErr(null);
    try {
      const signer = await getSigner();
      const tx = await signer.sendTransaction({
        to: disableCall.to,
        data: disableCall.data,
      });
      setDisableTx(tx.hash);
      toast.success("Session disable sent", { description: tx.hash });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }, [disableCall, getSigner]);

  const active = grant.status === "ACTIVE";

  return (
    <div className="mt-2 space-y-2 rounded-md border border-neutral-800/60 bg-neutral-900/40 p-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-neutral-300">Delegated execution</span>
        <span className={grantColor(grant.status)}>{grant.status}</span>
      </div>

      <p className="text-neutral-400">
        No wallet popup is needed at READY. Your Nexus Smart Account will execute automatically if
        policy checks pass.
      </p>

      <div className="flex justify-between gap-3 text-neutral-400">
        <span>Intent status</span>
        <span className="text-neutral-200">{intentStatusLabel(intent.status)}</span>
      </div>
      {grant.accountAddress && (
        <div className="flex justify-between gap-3 text-neutral-400">
          <span>Smart account (taker)</span>
          <span className="font-mono text-neutral-300">{shorten(grant.accountAddress)}</span>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">
            Execution attempts
          </div>
          {attempts.map((a, i) => (
            <div
              key={`${a.createdAt}-${i}`}
              className="flex items-center justify-between gap-2 border-t border-neutral-800/40 pt-1"
            >
              <span className={attemptColor(a.decision)}>{a.decision}</span>
              <span className="flex-1 truncate text-neutral-500">{a.reason ?? ""}</span>
              {a.txHash && (
                <a
                  href={txUrl(a.txHash as `0x${string}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  tx {shorten(a.txHash)}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actionable explanation when the userOp landed but the inner trade
          reverted (issue 4). We never fabricate a reason — the raw reason stays
          visible below for debugging; the checklist is the common set of causes
          the user can actually act on. */}
      {isUserOpRevert && (
        <div className="space-y-1 rounded-md border border-red-500/30 bg-red-500/5 p-2">
          <p className="text-red-200">
            The account operation was submitted but the inner trade execution reverted.
          </p>
          <p className="text-neutral-400">Common causes to check:</p>
          <ul className="ml-3 list-disc space-y-0.5 text-neutral-400">
            <li>Smart Account {`token balance`} below the worst-case spend + fee</li>
            <li>0x allowance below the worst-case spend</li>
            <li>The maker order is no longer fillable (cancelled or taken)</li>
            <li>Price/fee moved outside the delegated bounds</li>
            <li>The session grant expired or was revoked</li>
          </ul>
          {revertReason && (
            <p className="text-[10px] text-neutral-500">Reported reason: {revertReason}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {active && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={revoking}
            onClick={() => void onRevoke()}
          >
            {revoking ? "Revoking…" : "Revoke delegated grant"}
          </Button>
        )}
        {disableCall && !disableTx && (
          <Button type="button" size="sm" variant="outline" onClick={() => void onDisableOnChain()}>
            Disable session on-chain (optional)
          </Button>
        )}
        {!active && (
          <span className="text-neutral-500">
            To fall back to manual, this grant must be revoked; the intent then uses manual
            confirmation.
          </span>
        )}
      </div>

      {disableCall && (
        <p className="text-[10px] text-neutral-500">
          Backend execution stops immediately after revoke. On-chain session disable is an
          additional safety step you send yourself.
        </p>
      )}
      {disableTx && (
        <a
          href={txUrl(disableTx as `0x${string}`)}
          target="_blank"
          rel="noreferrer"
          className="text-sky-400 hover:underline"
        >
          Session disable tx {shorten(disableTx)}
        </a>
      )}
      {err && <p className="text-red-400">{err}</p>}
    </div>
  );
}

function grantColor(status: string): string {
  if (status === "ACTIVE") return "text-emerald-400";
  if (status === "USED") return "text-sky-400";
  if (status === "REVOKED" || status === "EXPIRED") return "text-neutral-400";
  if (status === "FAILED") return "text-red-400";
  return "text-amber-300";
}

function attemptColor(decision: string): string {
  if (decision === "CONFIRMED") return "text-emerald-400";
  if (decision === "FAILED" || decision === "REJECTED") return "text-red-400";
  return "text-amber-300";
}

function intentStatusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "pending trigger";
    case "READY":
      return "ready (auto-executing)";
    case "EXECUTING":
      return "executing";
    case "EXECUTED":
      return "executed";
    case "FAILED":
      return "failed";
    default:
      return status.toLowerCase();
  }
}

function shorten(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}
