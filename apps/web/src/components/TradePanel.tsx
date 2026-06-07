// apps/web/src/components/TradePanel.tsx
"use client";

// Unified trade panel — single trading surface for the market page.
// UX model: intent first (Buy/Sell), then execution mode (Market/Limit/Conditional).
// Internals reuse existing hooks so signing/settlement/watchers/API contracts are unchanged:
//   - Market mode → useMarketOrder (quote → approve → execute → apply pipeline).
//   - Limit  mode → useOrderSigning.placeLimit (EIP-712 signing + POST /orders).
//   - Conditional → disabled placeholder for the future Smart Execution Assistant layer.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { fetchTopOfBook } from "@/lib/api";
import { useWallet } from "@/providers/wallet";
import { useOrderSigning } from "@/hooks/useOrderSigning";
import { useMarketOrder } from "@/hooks/useMarketOrder";
import { erc20Allowance, erc20Balance } from "@/lib/erc20";
import { getZeroExDomainFallback } from "@/lib/zeroex";
import { zeroExEP } from "@/lib/env";
import {
  formatMinNotionalError,
  marketQuoteNotionalQ,
  parseSizeWei,
  validateLimitInput,
} from "@/lib/validation";
import { sanitizeDecimal } from "@/lib/number";
import { displayAmount } from "@/lib/format";
import { getFeeInfo } from "@/lib/fees";
import Segmented from "@/components/ui/Segmented";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LimitHints from "@/components/LimitHints";
import ConditionalTab from "@/components/ConditionalTab";
import { cn } from "@/lib/cn";
import type { Tif } from "@/lib/types";

type Side = "BUY" | "SELL";
type OrderMode = "MARKET" | "LIMIT" | "CONDITIONAL";

const EXPIRY_PRESETS = [
  { label: "1m", secs: 1 * 60 },
  { label: "30m", secs: 30 * 60 },
  { label: "1h", secs: 60 * 60 },
  { label: "6h", secs: 6 * 60 * 60 },
  { label: "24h", secs: 24 * 60 * 60 },
  { label: "3d", secs: 3 * 24 * 60 * 60 },
] as const;

type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]["secs"];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
] as const;

export type TradePickDetail = {
  side?: Side;
  sizeHuman?: string;
  priceHuman?: string;
  mode?: OrderMode;
};

export type TradePanelHandle = {
  applyPick: (detail: TradePickDetail) => void;
};

type Props = {
  market: Market | null;
};

const TradePanel = React.forwardRef<TradePanelHandle, Props>(function TradePanel({ market }, ref) {
  const { address, getSigner } = useWallet();
  const { placeLimit } = useOrderSigning();

  // —— form state ——
  const [side, setSide] = useState<Side>("BUY");
  const [mode, setMode] = useState<OrderMode>("MARKET");
  const [sizeHuman, setSizeHuman] = useState<string>("0.1");
  const [priceHuman, setPriceHuman] = useState<string>("1000");
  const [expirySecs, setExpirySecs] = useState<ExpiryPreset>(24 * 60 * 60);
  const [postOnly, setPostOnly] = useState<boolean>(false);
  const [tif, setTif] = useState<Tif>("IOC");

  // Active marketable-limit price cap (in ticks). Set when the user submits a
  // non-post-only limit that would cross the book and confirms the routing
  // dialog. While set, the Market mode quote+execute pipeline runs with the
  // cap so fills cannot land above (BUY) or below (SELL) the user's price.
  const [marketableLimitPriceTicks, setMarketableLimitPriceTicks] = useState<string | null>(null);

  // Live top-of-book snapshot for the LIMIT body advisory + the routing decision.
  // Re-fetched on a small debounce when the user changes price/side/market.
  const [topBook, setTopBook] = useState<{
    bestBid?: { priceTicks: string };
    bestAsk?: { priceTicks: string };
  } | null>(null);

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  const readOnly = useMemo(
    () =>
      process.env.NEXT_PUBLIC_READ_ONLY === "true" || process.env.NEXT_PUBLIC_PROFILE === "mainnet",
    [],
  );

  // Phase 5 SEA UI gate. Independent of readOnly: when SEA is enabled in a
  // read-only / mainnet profile, the Conditional tab is visible and the form
  // renders, but SEA actions inside it are disabled (handled by ConditionalTab).
  const seaEnabled = useMemo(() => process.env.NEXT_PUBLIC_SEA_ENABLED === "true", []);

  // —— market mode pipeline (Phase 1 hook, unchanged behavior) ——
  // The optional `limitPriceTicks` is set only when the user came in through the
  // marketable-limit branch; for plain Market orders it stays undefined so the
  // backend matcher behaves exactly as before.
  const marketOrder = useMarketOrder({
    market,
    side,
    sizeHuman,
    tif,
    ...(marketableLimitPriceTicks ? { limitPriceTicks: marketableLimitPriceTicks } : {}),
  });
  const {
    q,
    result,
    err: marketErr,
    busy: marketBusy,
    needsApproval,
    needed,
    takerFee,
    feeRecipient: mktFeeRecipient,
    hasAnyTx,
    chainLabel,
    explorerTxBase,
    onQuote,
    onApprove,
    onExecute,
    onCheckGas,
  } = marketOrder;

  // —— imperative handle for orderbook click → populate form ——
  React.useImperativeHandle(
    ref,
    () => ({
      applyPick(detail) {
        if (detail.mode) setMode(detail.mode);
        if (detail.side) setSide(detail.side);
        if (detail.sizeHuman) setSizeHuman(detail.sizeHuman);
        if (detail.priceHuman) setPriceHuman(detail.priceHuman);
      },
    }),
    [],
  );

  // —— LIMIT mode: spender + pay-token + on-demand allowance check ——
  const [spender, setSpender] = useState<`0x${string}` | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { verifyingContract } = await getZeroExDomainFallback();
        if (!alive) return;
        setSpender(verifyingContract as `0x${string}`);
      } catch {
        /* noop — fall back to zeroExEP() when needed */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const limitPayToken = useMemo(() => {
    if (!market) return null;
    return side === "SELL" ? market.base : market.quote;
  }, [market, side]);

  const limitRequiredAmountWei = useMemo(() => {
    if (!market) return BigInt(0);
    const size = ethers.parseUnits(sizeHuman || "0", market.base.decimals);
    if (side === "SELL") return size;
    const priceScaled = ethers.parseUnits(priceHuman || "0", market.quote.decimals);
    const denom = BigInt(10) ** BigInt(market.base.decimals);
    return (size * priceScaled) / denom;
  }, [market, side, sizeHuman, priceHuman]);

  const [limitAllowance, setLimitAllowance] = useState<bigint | null>(null);
  const [checkingAllowance, setCheckingAllowance] = useState(false);

  // initial + reactive allowance check (mirrors legacy maker card semantics)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!market || !address || !limitPayToken || !spender) {
        if (alive) setLimitAllowance(null);
        return;
      }
      try {
        setCheckingAllowance(true);
        const signer = await getSigner();
        const provider = signer.provider!;
        const alw = await erc20Allowance(
          provider,
          limitPayToken.address as `0x${string}`,
          address as `0x${string}`,
          spender,
        );
        if (alive) setLimitAllowance(alw);
      } catch {
        if (alive) setLimitAllowance(null);
      } finally {
        if (alive) setCheckingAllowance(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.id, limitPayToken?.address, address, spender]);

  const onEnableLimitToken = useCallback(async () => {
    if (!market || !limitPayToken) return;
    try {
      const signer = await getSigner();
      const erc20 = new ethers.Contract(limitPayToken.address, ERC20_ABI, signer);
      const spend = spender ?? zeroExEP();
      const tx = await erc20.approve(spend, ethers.MaxUint256);
      toast.message(`Enabling ${limitPayToken.symbol}`, { description: tx.hash });
      await tx.wait();
      toast.success(`${limitPayToken.symbol} enabled`);
      const next: bigint = await erc20.allowance(address, spend);
      setLimitAllowance(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [market, limitPayToken, spender, address, getSigner]);

  // —— LIMIT submit ——
  const [placingLimit, setPlacingLimit] = useState(false);
  const [limitErr, setLimitErr] = useState<string | null>(null);

  const limitValidation = useMemo(
    () => (market ? validateLimitInput(market, sizeHuman, priceHuman) : null),
    [market, sizeHuman, priceHuman],
  );
  const tickHuman = useMemo(
    () =>
      market ? ethers.formatUnits(BigInt(market.rules.priceTickQ), market.quote.decimals) : "-",
    [market],
  );

  // Debounced top-of-book refresh while in LIMIT mode. Used to (a) drive the
  // crossing advisory chip, and (b) feed the routing decision in onPlaceLimit
  // without a synchronous fetch on submit. Failure is non-fatal: the submit
  // path re-fetches on demand and falls back to the backend's authoritative
  // checks if even that fails.
  useEffect(() => {
    if (!market || mode !== "LIMIT") {
      setTopBook(null);
      return;
    }
    let alive = true;
    const handle = setTimeout(async () => {
      try {
        const top = await fetchTopOfBook(market.symbol);
        if (alive) setTopBook(top);
      } catch {
        if (alive) setTopBook(null);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.symbol, mode, priceHuman, side]);

  // Crossing state derived from the latest snapshot. Used by the LIMIT body
  // advisory chip; the submit path re-checks against a fresh fetch.
  const crossingState = useMemo(() => {
    if (!market || mode !== "LIMIT" || !limitValidation?.derived || !topBook) return null;
    const px = limitValidation.derived.priceTicks;
    if (px <= BigInt(0)) return null;
    const bestAsk = topBook.bestAsk?.priceTicks ? BigInt(topBook.bestAsk.priceTicks) : null;
    const bestBid = topBook.bestBid?.priceTicks ? BigInt(topBook.bestBid.priceTicks) : null;
    const wouldCross =
      side === "BUY" ? bestAsk !== null && px >= bestAsk : bestBid !== null && px <= bestBid;
    return { wouldCross, postOnly };
  }, [market, mode, limitValidation, topBook, side, postOnly]);

  // Clear any active marketable-limit cap when the user navigates AWAY from
  // MARKET mode, or when the market or side change. Splitting the mode case
  // out is load-bearing: the marketable-limit confirm flow batches
  // setMarketableLimitPriceTicks(px) with setMode("MARKET") in the same
  // handler, so a naive effect with `mode` in its deps would fire after the
  // commit and null out the cap before /match/quote ever sees it. We only
  // clear on transitions OUT of MARKET (i.e. the user manually switching
  // back to LIMIT or CONDITIONAL).
  useEffect(() => {
    if (mode !== "MARKET") setMarketableLimitPriceTicks(null);
  }, [mode]);
  useEffect(() => {
    setMarketableLimitPriceTicks(null);
  }, [market?.symbol, side]);

  const onPlaceLimit = useCallback(async () => {
    if (!market) return;
    if (readOnly) {
      toast.message("Read-only mode on Base: trading disabled");
      return;
    }
    const v = validateLimitInput(market, sizeHuman, priceHuman);
    if (!v.ok) {
      v.errors.forEach((e) => toast.error(e));
      return;
    }
    setPlacingLimit(true);
    setLimitErr(null);
    try {
      // preflight: balance + allowance (same semantics as legacy maker card)
      const signer = await getSigner();
      const me = await signer.getAddress();
      const provider = signer.provider!;
      const spenderResolved =
        spender ??
        (await (async () => {
          const { verifyingContract } = await getZeroExDomainFallback();
          return verifyingContract as `0x${string}`;
        })());

      const bDec = market.base.decimals;
      const qDec = market.quote.decimals;
      const baseWei = ethers.parseUnits(sizeHuman || "0", bDec);
      const priceScaled = ethers.parseUnits(priceHuman || "0", qDec);
      const denom = BigInt(10) ** BigInt(bDec);
      const quoteWei = (baseWei * priceScaled) / denom;

      const token = (side === "SELL" ? market.base.address : market.quote.address) as `0x${string}`;
      const required = side === "SELL" ? baseWei : quoteWei;
      const label = side === "SELL" ? market.base.symbol : market.quote.symbol;

      if (required > BigInt(0)) {
        const bal = await erc20Balance(provider, token, me as `0x${string}`);
        if (bal < required) {
          toast.error(`Insufficient ${label} balance for this order`);
          setPlacingLimit(false);
          return;
        }
        const alw = await erc20Allowance(provider, token, me as `0x${string}`, spenderResolved);
        if (alw < required) {
          toast.error(`Allowance too low for ${label}. Click “Enable” (approve) and try again.`);
          setPlacingLimit(false);
          return;
        }
      }

      // Marketable-limit routing. When post-only is OFF and the entered price
      // crosses the current top-of-book, this limit must execute as a taker —
      // sending it as a passive 0x LimitOrder would offer free liquidity at a
      // worse-than-best price. We re-fetch top-of-book here (the debounced
      // snapshot may be stale or absent) and confirm with the user before
      // switching to the Market pipeline with `limitPriceTicks` capping the
      // sweep. Post-only crossing rejection stays inside placeLimit() and is
      // not affected. If the top-of-book fetch fails, fall through to the
      // existing passive path — the backend will still apply its own checks.
      if (!postOnly) {
        const px = v.derived?.priceTicks ?? BigInt(0);
        if (px > BigInt(0)) {
          let crosses = false;
          try {
            const top = await fetchTopOfBook(market.symbol);
            const bestAsk = top.bestAsk?.priceTicks ? BigInt(top.bestAsk.priceTicks) : null;
            const bestBid = top.bestBid?.priceTicks ? BigInt(top.bestBid.priceTicks) : null;
            crosses =
              side === "BUY"
                ? bestAsk !== null && px >= bestAsk
                : bestBid !== null && px <= bestBid;
          } catch {
            crosses = false;
          }

          if (crosses) {
            const human = `${priceHuman} ${market.quote.symbol}`;
            const ok = window.confirm(
              `This limit price (${human}) crosses the current order book.\n\n` +
                `Sending it as a passive maker would offer liquidity below the best price. ` +
                `Continue as a taker order capped at your limit (IOC — Immediate-or-Cancel)?\n\n` +
                `Note: any portion that cannot be filled at-or-better than your limit will be ` +
                `cancelled, NOT rested on the order book.\n\n` +
                `Your wallet will be asked to approve and send the 0x ExchangeProxy transaction.`,
            );
            if (!ok) {
              setPlacingLimit(false);
              return;
            }
            setMarketableLimitPriceTicks(px.toString());
            setMode("MARKET");
            setTif("IOC");
            toast.message("Switched to taker execution", {
              description: `Cap = ${human}. Click "Preview quote" to continue.`,
              duration: 5000,
            });
            setPlacingLimit(false);
            return;
          }
        }
      }

      await placeLimit({
        market,
        side,
        sizeBaseHuman: sizeHuman,
        priceHuman,
        expirySec: expirySecs,
        postOnly,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLimitErr(msg);
      toast.error(
        msg.includes("ACTION_REJECTED") || msg.includes("4001") ? "Signature rejected" : msg,
        { duration: 4000 },
      );
    } finally {
      setPlacingLimit(false);
    }
  }, [
    market,
    readOnly,
    sizeHuman,
    priceHuman,
    expirySecs,
    postOnly,
    side,
    spender,
    getSigner,
    placeLimit,
  ]);

  // —— derived UI ——
  const sideLabel = side === "BUY" ? "Buy" : "Sell";
  const payDecimals = market && (side === "BUY" ? market.quote.decimals : market.base.decimals);
  const paySymbol = market && (side === "BUY" ? market.quote.symbol : market.base.symbol);

  const { bps, pct, recipientShort } = getFeeInfo();

  // —— MARKET adaptive CTA ——
  // Single primary action that advances through: preview → approve → execute.
  // Secondary "Check gas / balance" stays available.
  type MarketCta =
    | { kind: "quote"; label: string; action: () => void }
    | { kind: "approve"; label: string; action: () => void }
    | { kind: "execute"; label: string; action: () => void };

  const marketCta: MarketCta = useMemo(() => {
    if (!hasAnyTx) {
      return { kind: "quote", label: "Preview quote", action: () => void onQuote() };
    }
    if (needsApproval) {
      return {
        kind: "approve",
        label: `Approve ${paySymbol ?? "token"}`,
        action: () => void onApprove(),
      };
    }
    return {
      kind: "execute",
      label: `${sideLabel} ${market?.base.symbol ?? ""} at market`.trim(),
      action: () => void onExecute(),
    };
  }, [
    hasAnyTx,
    needsApproval,
    paySymbol,
    sideLabel,
    market?.base.symbol,
    onQuote,
    onApprove,
    onExecute,
  ]);

  // Phase 5 Part B.1: Market-mode min-size validation. Mirrors the existing
  // Limit-mode `validateLimitInput` size rule (and the new backend gate in
  // POST /match/quote). When invalid, the CTA stays disabled at the "quote"
  // stage so no wallet popup can open. Once a plan is in flight (hasAnyTx),
  // we don't re-block — the existing plan already reflects accepted server
  // state, and refusing here would strand approve/execute on a valid plan.
  // No min-notional check in this patch — see follow-up plan.
  const marketSizeError = useMemo(() => {
    if (!market || !sizeHuman) return null;
    let sizeWei = BigInt(0);
    try {
      sizeWei = parseSizeWei(sizeHuman, market.base.decimals);
    } catch {
      return `Invalid size`;
    }
    const minSizeB = BigInt(market.rules.minSizeB);
    if (sizeWei <= BigInt(0) || sizeWei < minSizeB) {
      const minHuman = ethers.formatUnits(minSizeB, market.base.decimals);
      return `Min size: ${minHuman} ${market.base.symbol}`;
    }
    return null;
  }, [market, sizeHuman]);

  // Phase 5 Part B.2: post-quote min-notional check. Computed on the returned
  // quote (when present) using the same formula as the backend gate, so a
  // backend that's been bypassed/misconfigured still cannot lead to a wallet
  // popup below `minNotionalQ`. If the backend already rejected (q stays
  // null), `marketErr` carries the friendly message; this memo stays null.
  const marketNotionalError = useMemo(() => {
    if (!market || !q || !Array.isArray(q.fills) || q.fills.length === 0) return null;
    const notionalQ = marketQuoteNotionalQ(market, side, q);
    const minNotionalQ = BigInt(market.rules.minNotionalQ);
    if (notionalQ < minNotionalQ) return formatMinNotionalError(market, minNotionalQ);
    return null;
  }, [market, side, q]);

  const marketCtaDisabled =
    !market ||
    marketBusy ||
    (marketCta.kind === "quote" && (!sizeHuman || marketSizeError !== null)) ||
    // Once a plan is in flight, also block Approve/Execute when the plan's
    // executed notional falls below the market's minimum. Defense in depth
    // alongside the backend gate.
    (marketCta.kind !== "quote" && marketNotionalError !== null);

  // Human-readable cap for the marketable-limit banner shown in MARKET mode.
  const marketableLimitCapHuman = useMemo(() => {
    if (!market || !marketableLimitPriceTicks) return null;
    try {
      const px = BigInt(marketableLimitPriceTicks);
      const tickQ = BigInt(market.rules.priceTickQ);
      return ethers.formatUnits(px * tickQ, market.quote.decimals);
    } catch {
      return null;
    }
  }, [market, marketableLimitPriceTicks]);

  return (
    <div className="space-y-4">
      {/* Intent: Buy / Sell. Phase 4.x UI polish — hidden in CONDITIONAL
          mode because ConditionalTab renders its own Buy/Sell segmented
          control. Market/Limit modes are unchanged. Side state itself is
          preserved across mode switches; only the rendered control hides. */}
      {mode !== "CONDITIONAL" && (
        <div className="flex items-center justify-between gap-2">
          <Segmented
            value={side}
            onChange={(v) => setSide(v)}
            options={[
              { label: "Buy", value: "BUY" },
              { label: "Sell", value: "SELL" },
            ]}
            className="shadow-sm"
          />
        </div>
      )}

      {/* Execution mode: Market / Limit / Conditional. The Conditional tab is
          interactive only when NEXT_PUBLIC_SEA_ENABLED=true; otherwise it
          keeps its disabled-placeholder look. In read-only / mainnet profiles
          the tab is still visible (per Phase 5 contract) and the form is
          rendered, but SEA actions are disabled inside ConditionalTab. */}
      <div className="inline-flex w-full rounded-full border border-neutral-800/60 bg-neutral-900/60 p-0.5">
        {(
          [
            { value: "MARKET", label: "Market", disabled: false },
            { value: "LIMIT", label: "Limit", disabled: false },
            { value: "CONDITIONAL", label: "Conditional", disabled: !seaEnabled },
          ] as Array<{ value: OrderMode; label: string; disabled: boolean }>
        ).map((o) => {
          const active = o.value === mode;
          return (
            <button
              key={o.value}
              type="button"
              disabled={o.disabled}
              title={o.disabled ? "Coming soon: Smart Execution Assistant" : undefined}
              onClick={() => !o.disabled && setMode(o.value)}
              className={cn(
                "flex-1 rounded-full px-3 py-1 text-sm transition-colors",
                active
                  ? "bg-sky-500/15 text-sky-100 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                  : "text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60",
                o.disabled &&
                  "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-neutral-500",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* ======== MARKET BODY ======== */}
      {mode === "MARKET" && (
        <div className="space-y-3">
          {marketableLimitCapHuman && market && (
            <div className="flex items-center justify-between rounded-md border border-sky-500/40 bg-sky-500/5 px-3 py-2 text-[11px] text-sky-100">
              <span>
                Marketable limit · cap ={" "}
                <b>
                  {marketableLimitCapHuman} {market.quote.symbol}
                </b>{" "}
                ({side === "BUY" ? "no fills above" : "no fills below"} this price)
              </span>
              <button
                type="button"
                className="text-sky-200/80 underline hover:text-sky-100"
                onClick={() => setMarketableLimitPriceTicks(null)}
              >
                Cancel cap
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="block text-xs font-medium text-neutral-300">
                Size ({market?.base.symbol ?? "-"})
              </label>
              <Input
                value={sizeHuman}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                className="font-mono"
                onChange={(e) =>
                  setSizeHuman(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18, true))
                }
              />
              {marketSizeError && <p className="text-[11px] text-red-300">{marketSizeError}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-neutral-300">TIF</label>
              <select
                className="w-full rounded-md border border-neutral-700 bg-neutral-900/80 px-2 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
                value={tif}
                onChange={(e) => setTif(e.target.value as Tif)}
              >
                <option value="IOC">IOC</option>
                <option value="FOK">FOK</option>
              </select>
            </div>
          </div>

          {/* Quote preview / allowance hint */}
          {q?.txData && market && (
            <div className="flex flex-col gap-0.5 text-xs text-neutral-400">
              {needsApproval ? (
                <>
                  <span>
                    Need approval for{" "}
                    <b className="text-neutral-200">
                      {displayAmount(ethers.formatUnits(needed, payDecimals ?? 18))} {paySymbol}
                    </b>
                  </span>
                  {takerFee > BigInt(0) && (
                    <span>
                      Includes fee{" "}
                      <b className="text-neutral-200">
                        {displayAmount(ethers.formatUnits(takerFee, payDecimals ?? 18))} {paySymbol}
                      </b>
                      {mktFeeRecipient && (
                        <>
                          {" "}
                          to <span className="font-mono">{short(mktFeeRecipient)}</span>
                        </>
                      )}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-emerald-400">Allowance OK</span>
                  <span>
                    Est. spend:{" "}
                    <b className="text-neutral-200">
                      {displayAmount(ethers.formatUnits(needed, payDecimals ?? 18))} {paySymbol}
                    </b>
                  </span>
                  {takerFee > BigInt(0) && (
                    <span>
                      Fee:{" "}
                      <b className="text-neutral-200">
                        {displayAmount(ethers.formatUnits(takerFee, payDecimals ?? 18))} {paySymbol}
                      </b>
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {marketNotionalError && <p className="text-[11px] text-red-300">{marketNotionalError}</p>}

          {/* Adaptive primary CTA */}
          <button
            type="button"
            disabled={marketCtaDisabled}
            onClick={() => {
              if (readOnly) {
                toast.message("Read-only mode");
                return;
              }
              marketCta.action();
            }}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
              marketCta.kind === "approve"
                ? "bg-amber-500/10 text-amber-100 border border-amber-500/60 hover:bg-amber-500/20"
                : marketCta.kind === "execute"
                  ? side === "BUY"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20"
                  : "bg-neutral-900/70 text-neutral-200 border border-neutral-700 hover:bg-neutral-800/80",
            )}
          >
            {marketBusy ? "…" : marketCta.label}
          </button>

          {/* Secondary: Check gas / balance */}
          <button
            type="button"
            disabled={marketBusy}
            onClick={() => {
              if (readOnly) {
                toast.message("Read-only mode");
                return;
              }
              void onCheckGas();
            }}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check Gas / Balance
          </button>

          {marketErr && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-200">
              {marketErr}
            </div>
          )}

          {result && (
            <div className="space-y-1 text-xs text-neutral-300">
              <div>
                Fills: <b>{result.fills}</b>
              </div>
              <div>
                Tx sent: <b>{result.hasTx ? "yes" : "no"}</b>
              </div>
              {result.txHash && (
                <div className="break-all">
                  txHash: {result.txHash}
                  <div>
                    <a
                      href={`${explorerTxBase}${result.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-sky-300 hover:text-sky-200"
                    >
                      View on {chainLabel} explorer
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======== LIMIT BODY ======== */}
      {mode === "LIMIT" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-neutral-300">
                Size ({market?.base.symbol ?? "-"})
              </label>
              <Input
                value={sizeHuman}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                className="font-mono"
                onChange={(e) =>
                  setSizeHuman(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18, true))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-neutral-300">
                Price ({market?.quote.symbol ?? "-"})
              </label>
              <Input
                value={priceHuman}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                className="font-mono"
                onChange={(e) =>
                  setPriceHuman(sanitizeDecimal(e.target.value, market?.quote.decimals ?? 6, true))
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-300">Expires in</label>
            <Segmented
              value={String(expirySecs)}
              onChange={(v) => setExpirySecs(Number(v) as ExpiryPreset)}
              options={EXPIRY_PRESETS.map((p) => ({ label: p.label, value: String(p.secs) }))}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-neutral-600 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
                checked={postOnly}
                onChange={(e) => setPostOnly(e.target.checked)}
              />
              <span>Post only (don&apos;t cross)</span>
            </label>
          </div>

          <button
            type="button"
            disabled={!market || placingLimit || (limitValidation ? !limitValidation.ok : false)}
            onClick={() => void onPlaceLimit()}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
              side === "BUY"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20"
                : "bg-rose-500/10 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20",
            )}
          >
            {placingLimit ? "…" : `Place limit ${sideLabel.toLowerCase()}`}
          </button>

          {market && limitValidation && (
            <LimitHints
              market={market}
              validation={limitValidation}
              tickHuman={tickHuman}
              crossing={crossingState ?? undefined}
            />
          )}

          {address &&
          market &&
          limitPayToken &&
          limitAllowance !== null &&
          limitAllowance < limitRequiredAmountWei ? (
            <div className="flex items-center justify-between rounded border border-amber-500/40 bg-amber-500/5 p-2">
              <div className="text-xs">
                <b>Enable {limitPayToken.symbol}</b>
                <div className="text-neutral-400">
                  Allow the exchange to spend your {limitPayToken.symbol} so this order can be
                  filled.
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (readOnly) {
                    toast.message("Read-only mode");
                    return;
                  }
                  void onEnableLimitToken();
                }}
                disabled={checkingAllowance}
              >
                {checkingAllowance ? "Checking…" : `Enable ${limitPayToken.symbol}`}
              </Button>
            </div>
          ) : null}

          {limitErr && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-200">
              {limitErr}
            </div>
          )}
        </div>
      )}

      {/* ======== CONDITIONAL BODY ======== */}
      {mode === "CONDITIONAL" && seaEnabled && (
        <ConditionalTab
          market={market}
          readOnly={readOnly}
          onCreated={() => window.dispatchEvent(new CustomEvent("ste:refresh"))}
        />
      )}
      {mode === "CONDITIONAL" && !seaEnabled && (
        <div className="rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 p-4 text-xs text-neutral-400">
          <div className="mb-1 font-medium text-neutral-200">
            Conditional / Intent — coming soon
          </div>
          <p className="leading-relaxed">
            Placeholder for the Smart Execution Assistant. Execution-critical logic stays
            deterministic; conditional orders will be layered on top without changing the
            Market/Limit engine.
          </p>
        </div>
      )}

      {/* Fee reminder (shared) */}
      <p className="text-xs text-neutral-500">
        {bps > 0
          ? `Reminder: market takers pay a ${pct}% fee encoded as takerTokenFeeAmount. The fee is charged in the taker token and sent to ${recipientShort}. If your trade doesn't meet the platform's fee policy, execution will be rejected.`
          : `Reminder: in this demo the taker fee is 0%.`}
      </p>
    </div>
  );
});

export default TradePanel;
