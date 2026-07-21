// apps/web/src/components/IntentsPanel.tsx
"use client";

// Phase 5 + 4.x UI polish: per-wallet list of SEA intents. Hydrates from
// GET /sea/intents and polls (5s default; 1s when any visible intent is in
// READY so TTL countdown stays fresh). Visible only when
// NEXT_PUBLIC_SEA_ENABLED=true && address. Cancel allowed for
// DRAFT/ACTIVE/READY (backend enforces the actual gate). READY CMR rows
// render a child component that calls useMarketOrder at its top level
// (Rules of Hooks) and drives the fresh-quote → quote → approve → execute
// flow.
//
// Render layer (Phase 4.x polish):
//   - Human prices in quote-token units (no raw ticks in the UI).
//   - Per-type summary (CL vs CMR) one-liner.
//   - Terminal statuses hidden by default behind a Show history toggle.
//   - Friendly copy for known failureReason codes.
//   - Compact explorer link for linkedTxHash on EXECUTING/EXECUTED/FAILED.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { getIntents, type IntentDto } from "@/lib/sea";
import { useSeaCreate } from "@/hooks/useSeaCreate";
import { useWallet } from "@/providers/wallet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { txUrl } from "@/lib/explorer";
import ReadyIntentRowActions from "./ReadyIntentRowActions";
import DelegatedIntentRowActions from "./DelegatedIntentRowActions";
import DelegatedPendingRowActions from "./DelegatedPendingRowActions";
import {
  getDelegatedGrants,
  isDelegatedEnabled,
  type DelegatedGrantSummary,
} from "@/lib/delegated";
import {
  clearDelegatedPending,
  usePendingDelegatedEntries,
  type DelegatedPendingEntry,
} from "@/lib/delegatedPending";

type Props = {
  market: Market | null;
  readOnly: boolean;
  /**
   * When the panel is rendered inside a card that already shows a "Smart
   * intents" title, suppress the internal heading to avoid a duplicate.
   * The history toggle + item count stay visible.
   */
  hideHeading?: boolean;
};

const POLL_IDLE_MS = 5000;
const POLL_READY_MS = 1000;

// Phase 4.x UI polish (+ post-merge follow-up): statuses hidden from the
// live list by default. Includes the five truly-terminal states plus
// PLACED, which is non-terminal but UX-equivalent to "handed off" once the
// linked normal order is created — the Smart Intent has done its job and
// the underlying Order takes over via the Orders panel. There is no
// backend transition from PLACED on order fill/cancel in v1 by design.
const HISTORY_STATUSES: ReadonlySet<IntentDto["status"]> = new Set([
  "CANCELLED",
  "FAILED",
  "EXPIRED",
  "EXECUTED",
  "REJECTED",
  "PLACED",
]);

// Phase 4.x: friendly copy for known backend failureReason values. Falls
// back to the raw value when a new code is introduced (defense against
// taxonomy drift; keep this map in sync as new reasons land).
const REASON_COPY: Record<string, string> = {
  would_cross_at_fire:
    "Not placed: would cross the book at trigger time. Create a new passive trigger with a safer limit price.",
  insufficient_liquidity: "Not enough liquidity at or better than trigger price.",
  notional_below_min_notional: "Below market minimum notional.",
  stale_pending: "Execution was not confirmed in time.",
  tx_reverted: "Transaction reverted on-chain.",
  tx_reverted_at_marker: "Transaction reverted on-chain.",
  ready_ttl_expired: "Ready quote expired; waiting for next valid opportunity.",
  intent_expired_by_ts: "Intent expired before trigger conditions were met.",
};

export default function IntentsPanel({ market, readOnly, hideHeading = false }: Props) {
  const { address } = useWallet();
  const { cancelById } = useSeaCreate();
  // Intents whose delegated create flow started but whose grant is not yet ACTIVE
  // (in-flight, or interrupted before finalize). Persisted, so it survives a
  // reload — such an intent must render delegated/pending UI, never the manual
  // "Execute now". Empty for manual intents and when the flag is off.
  const pendingDelegated = usePendingDelegatedEntries();

  const [intents, setIntents] = useState<IntentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const inFlight = useRef(false);
  // Phase 3b (Milestone 3D): map intentId -> delegated grant, so a delegated
  // intent renders DelegatedIntentRowActions instead of manual Execute-now.
  // Only populated when the flag is on; empty otherwise (flag OFF => every row
  // renders exactly as today via ReadyIntentRowActions).
  const [delegatedGrants, setDelegatedGrants] = useState<Map<string, DelegatedGrantSummary>>(
    new Map(),
  );

  // Phase 5 safety: scope the visible list to the current market. SEA Intent
  // dtos store `marketId` as the Market UUID; comparing to `market.id` ensures
  // ReadyIntentRowActions is never instantiated with a mismatched market and
  // therefore never opens a wallet popup on the wrong pair. Backend GET
  // /sea/intents is unchanged — filtering is purely client-side.
  const visibleIntents = useMemo(
    () => (market ? intents.filter((i) => i.marketId === market.id) : []),
    [intents, market],
  );
  const otherMarketCount = intents.length - visibleIntents.length;

  // Phase 4.x: split visible rows into live vs history. Live rows always
  // render; history rows render only when the user toggles them on.
  const { liveIntents, historyIntents } = useMemo(() => {
    const live: IntentDto[] = [];
    const hist: IntentDto[] = [];
    for (const i of visibleIntents) {
      (HISTORY_STATUSES.has(i.status) ? hist : live).push(i);
    }
    return { liveIntents: live, historyIntents: hist };
  }, [visibleIntents]);

  const hasReady = useMemo(() => liveIntents.some((i) => i.status === "READY"), [liveIntents]);

  const hydrate = useCallback(async () => {
    if (!address) {
      setIntents([]);
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setLoading(true);
      const rows = await getIntents({ address, limit: 50 });
      setIntents(rows);
      setErr(null);
      // Delegated grants (behind the flag, best-effort). A failure here (e.g.
      // backend feature disabled => 403) leaves the map empty, so every intent
      // renders as a normal manual row — never blocking the intents list.
      if (isDelegatedEnabled()) {
        try {
          const grants = await getDelegatedGrants(address);
          setDelegatedGrants(new Map(grants.map((g) => [g.intentId, g])));
          // Once a grant is visible from the backend it drives the row; any
          // leftover pending marker for it is stale — clear it so the pending
          // ("authorization incomplete") UI never shows for a granted intent.
          for (const g of grants) clearDelegatedPending(g.intentId);
        } catch {
          setDelegatedGrants(new Map());
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [address]);

  // Initial + poll. Cadence tightens when any visible intent is READY.
  useEffect(() => {
    hydrate();
    const interval = setInterval(hydrate, hasReady ? POLL_READY_MS : POLL_IDLE_MS);
    return () => clearInterval(interval);
  }, [hydrate, hasReady]);

  // Existing convention: many components re-hydrate on this custom event
  // (e.g. after a trade settles). Reuse it.
  useEffect(() => {
    const handler = () => hydrate();
    window.addEventListener("ste:refresh", handler);
    return () => window.removeEventListener("ste:refresh", handler);
  }, [hydrate]);

  const onCancel = useCallback(
    async (intentId: string) => {
      if (readOnly) {
        toast.error("Read-only mode: SEA actions disabled.");
        return;
      }
      try {
        await cancelById(intentId);
        await hydrate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [cancelById, hydrate, readOnly],
  );

  if (!address) return null;

  return (
    <div className="space-y-2" data-testid="intents-panel">
      <div
        className={cn("flex items-center gap-2", hideHeading ? "justify-end" : "justify-between")}
      >
        {!hideHeading && <h3 className="text-sm font-medium text-neutral-200">Smart intents</h3>}
        <div className="flex items-center gap-2">
          {historyIntents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="rounded-md border border-neutral-700 bg-neutral-900/40 px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-neutral-800/60"
            >
              {showHistory
                ? `Hide history (${historyIntents.length})`
                : `Show history (${historyIntents.length})`}
            </button>
          )}
          <span className="text-[11px] text-neutral-500">
            {loading ? "Refreshing…" : `${liveIntents.length} item(s)`}
          </span>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-100">
          {err}
        </div>
      )}

      {liveIntents.length === 0 && !loading && (
        <div className="rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-3 py-3 text-xs text-neutral-400">
          No Smart Intents on this market. Open the Conditional tab to create a trigger limit or
          market-ready alert.
          {isDelegatedEnabled() && (
            <span className="block">
              Manual intents ask you to confirm the trade in your wallet at READY. Delegated intents
              execute automatically from your Nexus Smart Account if policy checks pass.
            </span>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {liveIntents.map((intent) => (
          <IntentRow
            key={intent.id}
            intent={intent}
            market={market}
            readOnly={readOnly}
            onCancel={onCancel}
            onAfterAction={hydrate}
            delegatedGrant={delegatedGrants.get(intent.id) ?? null}
            pendingEntry={pendingEntryFor(pendingDelegated, intent, address)}
          />
        ))}
      </ul>

      {showHistory && historyIntents.length > 0 && (
        <>
          <h4 className="mt-3 text-[11px] uppercase tracking-wide text-neutral-500">History</h4>
          <ul className="space-y-2 opacity-80">
            {historyIntents.map((intent) => (
              <IntentRow
                key={intent.id}
                intent={intent}
                market={market}
                readOnly={readOnly}
                onCancel={onCancel}
                onAfterAction={hydrate}
              />
            ))}
          </ul>
        </>
      )}

      {otherMarketCount > 0 && (
        <p className="text-[11px] text-neutral-500">
          {otherMarketCount} intent(s) on other markets — switch markets to view.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Row + helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The persisted delegated-pending entry for this intent, scoped to the current
 * owner (defensive — the marker records owner + market). Null when there is no
 * marker or it belongs to a different owner.
 */
function pendingEntryFor(
  entries: ReadonlyMap<string, DelegatedPendingEntry>,
  intent: IntentDto,
  owner: string | null,
): DelegatedPendingEntry | null {
  const e = entries.get(intent.id);
  if (!e) return null;
  if (owner && e.owner !== owner.toLowerCase()) return null;
  return e;
}

function IntentRow({
  intent,
  market,
  readOnly,
  onCancel,
  onAfterAction,
  delegatedGrant,
  pendingEntry = null,
}: {
  intent: IntentDto;
  market: Market | null;
  readOnly: boolean;
  onCancel: (id: string) => void;
  onAfterAction: () => void;
  delegatedGrant?: DelegatedGrantSummary | null;
  /** Delegated create started, grant not yet ACTIVE — render delegated/pending. */
  pendingEntry?: DelegatedPendingEntry | null;
}) {
  const sizeHuman = useMemo(() => {
    if (!market) return intent.sizeBase;
    try {
      return ethers.formatUnits(intent.sizeBase, market.base.decimals);
    } catch {
      return intent.sizeBase;
    }
  }, [intent.sizeBase, market]);

  const triggerHuman = useMemo(
    () => priceTicksToQuoteHuman(market, intent.triggerPriceTicks),
    [market, intent.triggerPriceTicks],
  );
  const limitHuman = useMemo(
    () => (intent.limitPriceTicks ? priceTicksToQuoteHuman(market, intent.limitPriceTicks) : null),
    [market, intent.limitPriceTicks],
  );

  const cancellable =
    intent.status === "DRAFT" || intent.status === "ACTIVE" || intent.status === "READY";
  const placedCl = intent.type === "CONDITIONAL_LIMIT" && intent.status === "PLACED";
  const readyCmr = intent.type === "CONDITIONAL_MARKET_READY" && intent.status === "READY";

  const quoteSymbol = market?.quote.symbol ?? "";
  const baseSymbol = market?.base.symbol ?? "";
  const cmp = comparisonGlyph(intent.triggerType);
  const reference = referenceLabel(intent.triggerReference);

  const isCl = intent.type === "CONDITIONAL_LIMIT";
  const reasonCopy = intent.failureReason
    ? (REASON_COPY[intent.failureReason] ?? intent.failureReason)
    : null;
  const showTxLink =
    !!intent.linkedTxHash &&
    (intent.status === "EXECUTING" || intent.status === "EXECUTED" || intent.status === "FAILED");

  return (
    <li className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          {/* Header: status pill + main action line */}
          <div className="flex items-center gap-2 text-xs">
            <StatusPill status={intent.status} />
            <span className="font-medium text-neutral-200">
              {isCl ? (
                <>
                  {intent.side} {sizeHuman}
                  {baseSymbol ? ` ${baseSymbol}` : ""}
                  {limitHuman && quoteSymbol ? ` @ ${limitHuman} ${quoteSymbol}` : ""}
                </>
              ) : (
                <>
                  {intent.side} {sizeHuman}
                  {baseSymbol ? ` ${baseSymbol}` : ""}
                  {triggerHuman && quoteSymbol
                    ? ` when ${reference} ${cmp} ${triggerHuman} ${quoteSymbol}`
                    : ""}
                </>
              )}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">{isCl ? "CL" : "CMR"}</span>
          </div>

          {/* Sub-line: CL has a separate trigger line; CMR adds TIF + status hint */}
          {isCl ? (
            <div className="text-[11px] text-neutral-500">
              Trigger: {reference} {cmp} {triggerHuman}
              {quoteSymbol ? ` ${quoteSymbol}` : ""}
            </div>
          ) : (
            <div className="text-[11px] text-neutral-500">
              {intent.tif ? `TIF ${intent.tif}` : "TIF IOC"}
              {cmrStatusSuffix(intent.status) ? ` · ${cmrStatusSuffix(intent.status)}` : ""}
            </div>
          )}

          <div className="text-[11px] text-neutral-500">
            Expires {new Date(intent.expiresAt).toLocaleString()}
          </div>

          {reasonCopy && <div className="text-[11px] text-amber-400">{reasonCopy}</div>}

          {showTxLink && intent.linkedTxHash && (
            <div className="text-[11px]">
              <a
                href={txUrl(intent.linkedTxHash as `0x${string}`)}
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 hover:underline"
              >
                Tx {shorten(intent.linkedTxHash)} ↗
              </a>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {cancellable && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onCancel(intent.id)}
              disabled={readOnly}
              title={readOnly ? "Read-only mode" : "Cancel intent"}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Delegated branch: a delegated intent uses delegated row actions and NEVER
          the manual Execute-now. It is "delegated" if it has a grant OR a persisted
          delegated-pending marker (create started, grant not yet ACTIVE — including
          an interrupted authorization that survived a reload). The pending marker
          closes the window where such an intent could otherwise flash a manual
          "Execute now". Manual intents (no grant, not pending) render
          ReadyIntentRowActions exactly as before. Flag OFF => grant map empty and
          nothing pending => always the manual path. */}
      {delegatedGrant ? (
        <DelegatedIntentRowActions
          intent={intent}
          grant={delegatedGrant}
          onAfterAction={onAfterAction}
        />
      ) : pendingEntry ? (
        <DelegatedPendingRowActions
          intent={intent}
          entry={pendingEntry}
          onAfterAction={onAfterAction}
        />
      ) : (
        readyCmr &&
        market && (
          <ReadyIntentRowActions
            intent={intent}
            market={market}
            readOnly={readOnly}
            onAfterAction={onAfterAction}
          />
        )
      )}

      {placedCl && intent.linkedOrderHash && (
        <div className="mt-2 text-[11px] text-neutral-500">
          Placed as order {shorten(intent.linkedOrderHash)}. Cancel via the Orders panel (Smart
          Intent cancel is no longer the correct path; this row stays in PLACED until the underlying
          order is cancelled or filled).
        </div>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: IntentDto["status"] }) {
  const palette =
    status === "READY"
      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
      : status === "ACTIVE"
        ? "border-sky-500/50 bg-sky-500/10 text-sky-100"
        : status === "DRAFT"
          ? "border-neutral-600 bg-neutral-800/50 text-neutral-200"
          : status === "TRIGGERED" || status === "EXECUTING"
            ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
            : status === "PLACED"
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-100"
              : status === "EXECUTED"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                : "border-neutral-700 bg-neutral-900/60 text-neutral-400";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
        palette,
      )}
    >
      {status}
    </span>
  );
}

/**
 * Convert priceTicks → human quote-token units, bigint-exact.
 *   atomic_quote_per_1_base = priceTicks * priceTickQ
 *   human = formatUnits(atomic, quote.decimals)
 * Returns null when market is unknown or the value cannot be parsed; callers
 * fall back to the raw string in that case.
 */
function priceTicksToQuoteHuman(market: Market | null, priceTicks: string | bigint): string | null {
  if (!market) return null;
  try {
    const ticks = typeof priceTicks === "bigint" ? priceTicks : BigInt(priceTicks);
    const tickQ = BigInt(market.rules.priceTickQ);
    const atomic = ticks * tickQ;
    return ethers.formatUnits(atomic, market.quote.decimals);
  } catch {
    return null;
  }
}

function comparisonGlyph(triggerType: IntentDto["triggerType"]): string {
  if (triggerType === "PRICE_BELOW") return "≤";
  if (triggerType === "PRICE_ABOVE") return "≥";
  return "?";
}

function referenceLabel(reference: IntentDto["triggerReference"]): string {
  if (reference === "BEST_ASK") return "best ask";
  if (reference === "BEST_BID") return "best bid";
  return "mid";
}

function cmrStatusSuffix(status: IntentDto["status"]): string {
  if (status === "READY") return "Quote available";
  if (status === "ACTIVE") return "Watching trigger";
  if (status === "EXECUTING") return "Awaiting on-chain";
  return "";
}

function shorten(hex: string): string {
  if (hex.length <= 14) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}
