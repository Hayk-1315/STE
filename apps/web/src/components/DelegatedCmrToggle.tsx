// apps/web/src/components/DelegatedCmrToggle.tsx
// Phase 3b: the opt-in Manual | Delegated switch for CMR, the Nexus Smart
// Account setup panel, and (Milestone 3C) the delegated CMR submission + grant
// + revoke flow. Default is Manual. Only mounted behind
// NEXT_PUBLIC_SEA_DELEGATED_ENABLED and only for CMR; it NEVER alters the
// manual CMR form (which renders below, unchanged) or the Execute-now flow.
//
// Delegated submission reuses the EXISTING useSeaCreate().createCMR verbatim —
// the intent is created exactly as a manual CMR intent (owner = the connected
// EOA, executionAuthority = USER_CONFIRMATION_REQUIRED; DELEGATED_FUTURE is not
// implementable in v1 and is not used). What makes it "delegated" is a SEPARATE
// additive Smart-Session grant attached right after creation via
// hooks/useDelegatedGrant.ts (prepare -> owner signs the enable digest with the
// EXISTING personalSign -> finalize). Submission is BLOCKED unless the Nexus SA
// setup is fully complete (deployed, funded, token funded, approval >= balance,
// SmartSessions installed) — there is no silent fallback to delegated mode and
// no delegated intent is created if any prerequisite is missing.
//
// This does NOT implement READY auto-execution UI or delegated row actions in
// IntentsPanel (Milestone 3D). It does not touch ReadyIntentRowActions or the
// manual CMR/CL forms.
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ethers } from "ethers";
import Segmented from "@/components/ui/Segmented";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/providers/wallet";
import { useSeaCreate } from "@/hooks/useSeaCreate";
import { useDelegatedGrant } from "@/hooks/useDelegatedGrant";
import NexusSaSetup from "@/components/NexusSaSetup";
import DelegationPreview from "@/components/DelegationPreview";
import { getSaStatus, isDelegatedEnabled } from "@/lib/delegated";
import { estimateRequiredSpendQ, resolveSpendBufferBps } from "@/lib/delegatedSpend";
import {
  clearDelegatedPending,
  markDelegatedPending,
  setDelegatedPendingError,
} from "@/lib/delegatedPending";
import { friendlyDelegatedError } from "@/lib/delegatedErrors";
import { env } from "@/lib/env";
import type { SaSetupState } from "@/lib/nexusSa";
import type { Market } from "@/lib/api";
import type { IntentDto, IntentSide } from "@/lib/sea";

type Mode = "manual" | "delegated";

export type DelegatedCmrSubmitParams = {
  sizeBaseHuman: string;
  triggerPriceHuman: string;
  tif?: "IOC" | "FOK";
  expiresAtUnix: number;
};

export default function DelegatedCmrToggle(props: {
  market: Market | null;
  side: IntentSide;
  /** The exact params the manual form would submit — reused verbatim for delegated. */
  getSubmitParams: () => DelegatedCmrSubmitParams | null;
  onCreated?: (intent: IntentDto) => void;
  /**
   * Reports the current Manual|Delegated sub-mode to the parent so it can hide
   * the manual CMR CTA/copy while Delegated is selected (the delegated flow has
   * its own CTA). When the flag is off this component is unmounted, so the
   * parent never receives "delegated" and behaves exactly as today.
   */
  onModeChange?: (mode: Mode) => void;
  /**
   * The shared CMR form fields (Side / Size / Trigger / Expiry). In delegated
   * mode they render INSIDE this panel, between Smart Account Setup and the
   * Create card, so the sequence reads naturally (explanation → setup → fields →
   * create). The parent hides its standalone copy while delegated is active.
   */
  fields?: ReactNode;
}) {
  // Defensive: never render anything when the flag is off (mount also gates).
  if (!isDelegatedEnabled()) return null;
  return <DelegatedCmrToggleInner {...props} />;
}

function DelegatedCmrToggleInner({
  market,
  side,
  getSubmitParams,
  onCreated,
  onModeChange,
  fields,
}: {
  market: Market | null;
  side: IntentSide;
  getSubmitParams: () => DelegatedCmrSubmitParams | null;
  onCreated?: (intent: IntentDto) => void;
  onModeChange?: (mode: Mode) => void;
  fields?: ReactNode;
}) {
  const { address } = useWallet();
  const { createCMR } = useSeaCreate();
  const { state: grant, createGrant, revoke, reset } = useDelegatedGrant();

  const [mode, setMode] = useState<Mode>("manual");
  const [setup, setSetup] = useState<SaSetupState | null>(null);
  const [intent, setIntent] = useState<IntentDto | null>(null);
  const [requiredTokenQ, setRequiredTokenQ] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const taker = useMemo(
    () => (market ? (side === "BUY" ? market.quote : market.base) : null),
    [market, side],
  );

  // Notify the parent of the current sub-mode so it can hide the manual CTA/copy
  // while Delegated is active (issue 1). Effect (not render) to avoid setState
  // during another component's render.
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Worst-case taker-token spend the delegated CMR will need, computed from the
  // CURRENT form values + a conservative fee/safety buffer. Null until the form
  // is valid enough (size + BUY price). Reactive: getSubmitParams() reads the
  // live form each render. This drives both the setup gate and the fund/approve
  // requirement shown in NexusSaSetup (issue 3).
  const requiredSpendQ = useMemo(() => {
    if (!market) return null;
    const params = getSubmitParams();
    if (!params) return null;
    const bufferBps = resolveSpendBufferBps(
      env().NEXT_PUBLIC_TAKER_FEE_BPS ? Number(env().NEXT_PUBLIC_TAKER_FEE_BPS) : 0,
    );
    return estimateRequiredSpendQ({
      side: side === "BUY" ? "BUY" : "SELL",
      sizeBaseHuman: params.sizeBaseHuman,
      triggerPriceHuman: params.triggerPriceHuman,
      baseDecimals: market.base.decimals,
      quoteDecimals: market.quote.decimals,
      bufferBps,
    });
    // getSubmitParams is a fresh closure each parent render; depend on it so the
    // estimate tracks form edits.
  }, [market, side, getSubmitParams]);

  // ALL prerequisites must hold — no partial/silent delegated submission. Balance
  // AND allowance must cover the worst-case spend (not merely be > 0) when a
  // requirement is known; if not computable yet, fall back to the > 0 check but
  // canSubmit still requires a computed requirement below.
  const setupComplete = useMemo(() => {
    if (!setup) return false;
    const balQ = BigInt(setup.tokenBalanceQ);
    const allowQ = BigInt(setup.allowanceQ);
    const req = requiredSpendQ && requiredSpendQ > BigInt(0) ? requiredSpendQ : null;
    const tokenOk = req ? balQ >= req : balQ > BigInt(0);
    const approvalOk = req ? allowQ >= req : allowQ >= balQ && balQ > BigInt(0);
    return setup.deployed && setup.moduleInstalled && tokenOk && approvalOk;
  }, [setup, requiredSpendQ]);

  // Require a computed spend requirement before submission: without it we cannot
  // prove the SA is funded enough, so we do not allow an under-funded CMR.
  const canSubmit =
    setupComplete && !!requiredSpendQ && !submitting && grant.status === "idle" && !intent;

  // Per-CMR required-spend summary, shown in the Create card (it depends on the
  // current form). `required` is the worst-case spend incl. fee/buffer; compare
  // against the SA's spend-token balance from setup.
  const required = requiredSpendQ && requiredSpendQ > BigInt(0) ? requiredSpendQ : null;
  const takerBalQ = setup ? BigInt(setup.tokenBalanceQ) : BigInt(0);
  const fundedEnough = required ? takerBalQ >= required : false;

  const submitDelegated = async () => {
    if (!market || !address || !taker) return;
    const params = getSubmitParams();
    if (!params) {
      setSubmitErr("Fill in a valid size and trigger price first.");
      return;
    }
    if (!setupComplete) {
      // Hard gate: never create a delegated intent with incomplete setup.
      setSubmitErr("Smart account setup isn't complete yet. Finish every step above first.");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    try {
      // EXACT same creation path as manual CMR (owner = connected EOA,
      // USER_CONFIRMATION_REQUIRED). "Delegated" is the grant layered on top.
      const created = await createCMR({
        market,
        side,
        sizeBaseHuman: params.sizeBaseHuman,
        triggerPriceHuman: params.triggerPriceHuman,
        tif: params.tif,
        expiresAtUnix: params.expiresAtUnix,
      });
      // Persist a delegated-pending marker IMMEDIATELY (keyed by owner + intent +
      // market) so IntentsPanel never shows the manual "Execute now" during the
      // grant round-trip — and it survives a reload/API-down before finalize.
      markDelegatedPending({ intentId: created.id, owner: address, marketId: market.id });
      setIntent(created);
      onCreated?.(created);

      // Fetch the backend-derived policy preview (same policy prepareGrant uses).
      try {
        const sa = await getSaStatus({
          intentId: created.id,
          owner: address,
          accountModel: "NEXUS_SA",
        });
        if (sa.ok && sa.requiredTokenQ) setRequiredTokenQ(sa.requiredTokenQ);
      } catch {
        /* preview-only; grant still proceeds on its own facts */
      }

      await createGrant(created.id);
    } catch (e) {
      setSubmitErr(friendlyDelegatedError(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Reflect grant progress onto the persisted pending marker:
  //  - ACTIVE  → clear it (the grants map now drives the delegated row).
  //  - error   → keep it, flagged "error", so a reload shows the recoverable
  //              "authorization incomplete" state (Resume / Return to manual).
  // The marker is only fully removed on ACTIVE or an explicit "Return to manual"
  // (startOver) — never silently — so a delegated intent can't revert to manual.
  useEffect(() => {
    if (!intent) return;
    if (grant.status === "active") clearDelegatedPending(intent.id);
    else if (grant.status === "error") setDelegatedPendingError(intent.id);
  }, [intent, grant.status]);

  const startOver = () => {
    // Abandoning the flow: drop the pending marker so the intent may render as a
    // manual row again (intentional fallback, not a transient flicker).
    if (intent) clearDelegatedPending(intent.id);
    setIntent(null);
    setRequiredTokenQ(null);
    setSubmitErr(null);
    reset();
  };

  return (
    <div className="space-y-3" data-testid="delegated-cmr-toggle">
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { label: "Manual confirmation", value: "manual" },
          { label: "Delegated", value: "delegated" },
        ]}
        className="shadow-sm"
      />

      {mode === "delegated" && (
        <div className="space-y-3">
          <Card>
            <CardContent className="text-xs leading-relaxed text-amber-300/90">
              Delegated CMR uses your Nexus Smart Account. Funds for delegated execution live there.
              When READY, it executes automatically if policy checks pass — no wallet popup at
              READY. Manual CMR remains available.
            </CardContent>
          </Card>

          <NexusSaSetup
            market={market}
            side={side}
            onSetupState={setSetup}
            requiredSpendQ={requiredSpendQ}
          />

          {/* CMR form fields render here in delegated mode: explanation → setup →
              fields → create card, so the sequence reads naturally. */}
          {fields}

          {!intent && (
            <Card>
              <CardContent className="space-y-2 text-sm">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Create delegated intent
                </div>

                {/* Per-CMR required-spend preflight (depends on the fields above). */}
                {!requiredSpendQ ? (
                  <p className="text-amber-300/90">
                    Enter a valid size and trigger price above to compute the required funding.
                  </p>
                ) : (
                  taker && (
                    <div className="rounded-md border border-neutral-800/60 bg-neutral-900/40 px-2 py-1.5 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-neutral-400">
                          Required {taker.symbol} for this delegated CMR
                        </span>
                        <span className="text-neutral-200">
                          {ethers.formatUnits(required ?? BigInt(0), taker.decimals)} {taker.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-neutral-400">Your smart account has</span>
                        <span className={fundedEnough ? "text-emerald-400" : "text-amber-300"}>
                          {setup
                            ? `${ethers.formatUnits(takerBalQ, taker.decimals)} ${taker.symbol}`
                            : "—"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-neutral-500">
                        Includes max trigger price + fee/buffer.
                      </p>
                      {setup && !setupComplete && (
                        <p className="mt-0.5 text-amber-300/90">
                          Fund more {taker.symbol}, or reduce size/price, and finish setup above
                          before creating this delegated CMR.
                        </p>
                      )}
                    </div>
                  )
                )}

                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit}
                  title={
                    !requiredSpendQ
                      ? "Enter a valid size and trigger price"
                      : !setupComplete
                        ? "Finish smart-account setup with enough funding first"
                        : ""
                  }
                  onClick={() => void submitDelegated()}
                >
                  {submitting ? "Creating…" : "Create delegated CMR"}
                </Button>
                {submitErr && <p className="text-xs text-red-400">{submitErr}</p>}
              </CardContent>
            </Card>
          )}

          {intent && (
            <Card>
              <CardContent className="space-y-2 text-sm">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Delegated grant
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Intent</span>
                  <span className="font-mono text-xs text-neutral-200">{intent.id}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Grant status</span>
                  <span
                    className={
                      grant.status === "active"
                        ? "text-emerald-400"
                        : grant.status === "error"
                          ? "text-red-400"
                          : grant.status === "revoked"
                            ? "text-neutral-400"
                            : "text-amber-300"
                    }
                  >
                    {grantStatusLabel(grant.status)}
                  </span>
                </div>
                {grant.error && (
                  <p className="text-xs text-red-400">{friendlyDelegatedError(grant.error)}</p>
                )}
                {grant.status === "active" && (
                  <div className="space-y-0.5 text-xs text-neutral-400">
                    <p className="font-medium text-emerald-400">Grant ACTIVE</p>
                    <p>No wallet popup is needed at READY.</p>
                    <p>Your Nexus Smart Account is the taker.</p>
                    <p>
                      Execution will happen automatically if policy, balance, allowance, liquidity,
                      and trigger checks pass. Track status and execution attempts in the Smart
                      Intents list below.
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  {grant.status === "active" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void revoke(intent.id)}
                    >
                      Revoke delegated grant
                    </Button>
                  )}
                  {(grant.status === "revoked" || grant.status === "error") && (
                    <Button type="button" size="sm" variant="outline" onClick={startOver}>
                      Start over
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary, collapsible session-limits detail — after the primary flow. */}
          {taker && (
            <DelegationPreview
              intent={intent}
              takerSymbol={taker.symbol}
              takerDecimals={taker.decimals}
              requiredTokenQ={requiredTokenQ}
            />
          )}
        </div>
      )}
    </div>
  );
}

function grantStatusLabel(status: string): string {
  switch (status) {
    case "preparing":
      return "Preparing session…";
    case "awaiting_signature":
      return "Waiting for your signature…";
    case "finalizing":
      return "Finalizing…";
    case "active":
      return "ACTIVE";
    case "revoking":
      return "Revoking…";
    case "revoked":
      return "REVOKED";
    case "error":
      return "ERROR";
    default:
      return status;
  }
}
