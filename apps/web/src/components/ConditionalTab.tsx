// apps/web/src/components/ConditionalTab.tsx
"use client";

// Phase 5: Conditional intent creation surface. Renders inside the existing
// CONDITIONAL slot of TradePanel. Two sub-modes: Conditional Limit (CL) and
// Conditional Market Ready (CMR). All write actions are disabled in readOnly
// mode (Phase 5 contract: tab stays visible, actions disabled with toast).

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { useSeaCreate } from "@/hooks/useSeaCreate";
import { useWallet } from "@/providers/wallet";
import Segmented from "@/components/ui/Segmented";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sanitizeDecimal } from "@/lib/number";
import { cn } from "@/lib/cn";
import { parsePriceScaled, parseSizeWei, validateLimitInput } from "@/lib/validation";
import type { IntentSide } from "@/lib/sea";

/**
 * Phase 5 safety: exact tick-alignment check for a single price field. Reuses
 * the same `parseUnits → modulo priceTickQ` pattern as the existing normal-
 * limit `validateLimitInput`, so the trigger field obeys the same canonical
 * rules as a limit price (Conditional Limit's limit price is already covered
 * by `validateLimitInput` itself).
 */
function isPriceTickAligned(market: Market, priceHuman: string): boolean {
  if (!priceHuman || priceHuman === "0") return false;
  try {
    const priceScaled = parsePriceScaled(priceHuman, market.quote.decimals);
    if (priceScaled <= BigInt(0)) return false;
    const tickQ = BigInt(market.rules.priceTickQ);
    if (tickQ <= BigInt(0)) return false;
    return priceScaled % tickQ === BigInt(0);
  } catch {
    return false;
  }
}

/** Render-friendly description of the market tick size, e.g. "0.01 USDC". */
function tickHint(market: Market | null): string {
  if (!market) return "";
  try {
    const tickHuman = ethers.formatUnits(BigInt(market.rules.priceTickQ), market.quote.decimals);
    return `${tickHuman} ${market.quote.symbol}`;
  } catch {
    return "";
  }
}

/** Render-friendly minimum size of the market, e.g. "0.001 WETH". */
function minSizeHint(market: Market | null): string {
  if (!market) return "";
  try {
    const minHuman = ethers.formatUnits(BigInt(market.rules.minSizeB), market.base.decimals);
    return `${minHuman} ${market.base.symbol}`;
  } catch {
    return "";
  }
}

type SubMode = "CL" | "CMR";

type Props = {
  market: Market | null;
  readOnly: boolean;
  /** Called after a successful create so the parent can refresh IntentsPanel. */
  onCreated?: () => void;
};

const CMR_EXPIRY_PRESETS = [
  { label: "1h", secs: 60 * 60 },
  { label: "6h", secs: 6 * 60 * 60 },
  { label: "24h", secs: 24 * 60 * 60 },
  { label: "3d", secs: 3 * 24 * 60 * 60 },
] as const;

const CL_EXPIRY_PRESETS = [
  { label: "1h", secs: 60 * 60 },
  { label: "6h", secs: 6 * 60 * 60 },
  { label: "24h", secs: 24 * 60 * 60 },
  { label: "7d", secs: 7 * 24 * 60 * 60 },
] as const;

export default function ConditionalTab({ market, readOnly, onCreated }: Props) {
  const { address } = useWallet();
  const { createCL, createCMR } = useSeaCreate();

  const [subMode, setSubMode] = useState<SubMode>("CMR");
  const [side, setSide] = useState<IntentSide>("BUY");
  const [sizeHuman, setSizeHuman] = useState<string>("0.1");
  const [triggerPriceHuman, setTriggerPriceHuman] = useState<string>("1000");
  const [limitPriceHuman, setLimitPriceHuman] = useState<string>("1000");
  // Phase 4.x UI polish: TIF selector removed from the CMR form. The
  // semantics the user actually picks ("execute the full requested size
  // or do not start") are already enforced by the READY gate
  // (`cmr-prepare.service.ts` requires `remainingBase === 0n`) and by
  // the FE sufficient-liquidity guard in `ReadyIntentRowActions`. FOK is
  // the matching wire value and adds one server-side defense-in-depth
  // check at /match/quote if the LOB drifts between wallet-lock and the
  // executable quote build (returns `fok_insufficient_liquidity`, already
  // mapped to a friendly toast in `useMarketOrder`). Existing CMR rows in
  // DB with `tif="IOC"` continue to work unchanged via the mapping in
  // `ReadyIntentRowActions.tsx:60`.
  const cmrTif = "FOK" as const;
  const [cmrExpirySec, setCmrExpirySec] = useState<number>(24 * 60 * 60);
  const [clExpirySec, setClExpirySec] = useState<number>(24 * 60 * 60);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Per Phase 4 CMR restriction: natural combos only. The hint text below
  // makes this explicit; the form does not let the user choose a non-natural
  // combo because side determines the reference + comparison.
  const naturalHint = useMemo(
    () =>
      side === "BUY"
        ? "Buy when best ask falls to ≤ trigger price"
        : "Sell when best bid rises to ≥ trigger price",
    [side],
  );

  // Phase 5 safety: per-field validation runs synchronously on every render.
  // No wallet prompt opens while any error is present. CL reuses the existing
  // `validateLimitInput` helper (size, min-notional, limit-price tick) and
  // adds a separate trigger-tick check. CMR only validates size + trigger
  // tick (no execution price at create time — matches the backend invariant).
  const validation = useMemo(() => {
    const errors: { size?: string; trigger?: string; limit?: string } = {};
    if (!market) return { errors, ok: false };

    if (subMode === "CL") {
      const v = validateLimitInput(market, sizeHuman, limitPriceHuman);
      if (!v.ok) {
        for (const msg of v.errors) {
          // validateLimitInput returns flat strings — categorize by content
          // so we can render under the right field.
          if (msg.startsWith("Min size:")) errors.size ??= msg;
          else if (msg.startsWith("Min notional:")) errors.limit ??= msg;
          else if (msg.startsWith("Price must be multiple of tick:")) errors.limit ??= msg;
          else errors.size ??= msg;
        }
      }
      if (!isPriceTickAligned(market, triggerPriceHuman)) {
        const tick = tickHint(market);
        errors.trigger = `Trigger price must be a multiple of tick: ${tick}`;
      }
    } else {
      // CMR: size + trigger-tick only.
      let sizeWei = BigInt(0);
      try {
        sizeWei = parseSizeWei(sizeHuman, market.base.decimals);
      } catch {
        errors.size = `Invalid size`;
      }
      const minSizeB = BigInt(market.rules.minSizeB);
      if (sizeWei <= BigInt(0) || sizeWei < minSizeB) {
        errors.size = `Min size: ${minSizeHint(market)}`;
      }
      if (!isPriceTickAligned(market, triggerPriceHuman)) {
        errors.trigger = `Trigger price must be a multiple of tick: ${tickHint(market)}`;
      }
    }

    const ok = !errors.size && !errors.trigger && (subMode === "CMR" || !errors.limit);
    return { errors, ok };
  }, [market, subMode, sizeHuman, triggerPriceHuman, limitPriceHuman]);

  const canSubmit = Boolean(market && address && !busy && !readOnly && validation.ok);

  const onSubmit = async () => {
    if (!market || !address) {
      toast.error("Connect wallet and select a market.");
      return;
    }
    if (readOnly) {
      toast.error("Read-only mode on this profile: SEA actions disabled.");
      return;
    }
    if (!validation.ok) {
      // Defense in depth: button is already disabled when invalid, but a fast
      // mutation between render and click should still not open the wallet.
      toast.error("Fix the highlighted fields before submitting.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      if (subMode === "CL") {
        await createCL({
          market,
          side,
          sizeBaseHuman: sizeHuman,
          limitPriceHuman,
          triggerPriceHuman,
          expirySec: clExpirySec,
        });
      } else {
        const expiresAtUnix = Math.floor(Date.now() / 1000) + cmrExpirySec;
        await createCMR({
          market,
          side,
          sizeBaseHuman: sizeHuman,
          triggerPriceHuman,
          tif: cmrTif,
          expiresAtUnix,
        });
      }
      onCreated?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3" data-testid="conditional-tab">
      {/* CL / CMR sub-mode */}
      <Segmented
        value={subMode}
        onChange={(v) => setSubMode(v as SubMode)}
        options={[
          { label: "Market when ready", value: "CMR" },
          { label: "Passive limit on trigger", value: "CL" },
        ]}
        className="shadow-sm"
      />

      <p className="text-[11px] text-neutral-500">{naturalHint}</p>

      {/* Side */}
      <Segmented
        value={side}
        onChange={(v) => setSide(v as IntentSide)}
        options={[
          { label: "Buy", value: "BUY" },
          { label: "Sell", value: "SELL" },
        ]}
        className="shadow-sm"
      />

      {/* Size */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-400">
          Size{market ? ` (${market.base.symbol})` : ""}
        </label>
        <Input
          inputMode="decimal"
          value={sizeHuman}
          onChange={(e) =>
            setSizeHuman(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18))
          }
          placeholder="0.0"
        />
        {validation.errors.size && (
          <p className="text-[11px] text-red-300">{validation.errors.size}</p>
        )}
      </div>

      {/* Trigger price (always) */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-400">
          Trigger price{market ? ` (${market.quote.symbol} per 1 ${market.base.symbol})` : ""}
        </label>
        <Input
          inputMode="decimal"
          value={triggerPriceHuman}
          onChange={(e) =>
            setTriggerPriceHuman(sanitizeDecimal(e.target.value, market?.quote.decimals ?? 18))
          }
          placeholder="0.0"
        />
        {validation.errors.trigger && (
          <p className="text-[11px] text-red-300">{validation.errors.trigger}</p>
        )}
      </div>

      {/* CL: limit price */}
      {subMode === "CL" && (
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">
            Passive limit price
            {market ? ` (${market.quote.symbol} per 1 ${market.base.symbol})` : ""}
          </label>
          <Input
            inputMode="decimal"
            value={limitPriceHuman}
            onChange={(e) =>
              setLimitPriceHuman(sanitizeDecimal(e.target.value, market?.quote.decimals ?? 18))
            }
            placeholder="0.0"
          />
          {validation.errors.limit && (
            <p className="text-[11px] text-red-300">{validation.errors.limit}</p>
          )}
          <p className="text-[11px] text-neutral-500">
            When the trigger fires, your pre-signed limit is placed. Passive-only: fills only
            at-or-better than this price; never crosses.
          </p>
        </div>
      )}

      {/* CMR: TIF selector removed in Phase 4.x UI polish — see comment on
          `cmrTif` declaration. The hint below sets the "full or nothing"
          expectation without exposing a dead selector. */}
      {subMode === "CMR" && (
        <p className="text-[11px] text-neutral-500">
          CMR executes the full requested size or doesn&apos;t start.
        </p>
      )}

      {/* Expiry */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-400">Intent expires in</label>
        <div className="flex gap-1">
          {(subMode === "CMR" ? CMR_EXPIRY_PRESETS : CL_EXPIRY_PRESETS).map((p) => {
            const active = (subMode === "CMR" ? cmrExpirySec : clExpirySec) === p.secs;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  subMode === "CMR" ? setCmrExpirySec(p.secs) : setClExpirySec(p.secs)
                }
                className={cn(
                  "rounded-md border px-2 py-1 text-xs",
                  active
                    ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                    : "border-neutral-700 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-800/60",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-100">
          {err}
        </div>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full"
        title={readOnly ? "Read-only mode: SEA actions disabled" : !address ? "Connect wallet" : ""}
      >
        {readOnly
          ? "Read-only mode"
          : !address
            ? "Connect wallet"
            : busy
              ? "Submitting…"
              : subMode === "CL"
                ? "Create trigger limit"
                : "Create market-ready alert"}
      </Button>

      {/* Phase 4.x UI polish: mode-aware footer copy. CL pre-signs a passive
          limit and STE only places it if it still rests safely in the book;
          CMR watches the trigger + liquidity and the user manually confirms
          a fresh-quoted market tx. No auto-settlement, no relayer, no
          backend custody in either case. */}
      <p className="border-t border-neutral-800/60 pt-2 mt-1 text-[11px] leading-relaxed text-neutral-400">
        {subMode === "CL"
          ? "Pre-sign a passive limit. When the trigger is met, the engine places it only if it still rests safely in the book."
          : "The engine watches the trigger and liquidity. When ready, you confirm the market tx yourself with a fresh quote."}
      </p>
    </div>
  );
}
