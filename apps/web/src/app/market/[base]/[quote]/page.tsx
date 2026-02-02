// apps/web/src/app/market/[base]/[quote]/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import ConnectButton from "@/components/ConnectButton";
import { useParams } from "next/navigation";
import {
  getMarkets,
  getOrderbook,
  getTrades,
  getOrders,
  type Market,
  type OrderbookResponse,
} from "@/lib/api";
import { useOrderSigning } from "@/hooks/useOrderSigning";
import TakerBox from "@/components/TakerBox"; // for quoting and taking orders
import { subscribeBook, subscribeTrades } from "@/lib/ws"; // for live orderbook updates
import OrdersPanel from "@/components/OrdersPanel";
import { PlaceLimitButton } from "@/components/TakerBox";
import { fmtPriceFromTicks, fmtSizeBase, fmtNotionalQuote } from "@/lib/format";
import { validateLimitInput } from "@/lib/validation";
//import LiveBadge from "@/components/LiveBadge";
import LiveIndicator from "@/components/ui/LiveIndicator";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton, PanelSkeleton } from "@/components/ui/Skeleton";
import { sanitizeDecimal } from "@/lib/number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import OrderbookTable from "@/components/OrderbookTable";
import ChainBadge from "@/components/ChainBadge";
import BalancesPanel from "@/components/BalancesPanel";
import { marketSummary } from "@/lib/marketMath";
import { ethers } from "ethers";
import MarketHeader from "@/components/MarketHeader";
import MakerHints from "@/components/MakerHints";
// import AppFooter from "@/components/AppFooter";
import Segmented from "@/components/ui/Segmented";
import AccountBadge from "@/components/AccountBadge";
//import ApiHealthBadge from "@/components/ApiHealthBadge";
import { useWallet } from "@/providers/wallet";
import { zeroExEP } from "@/lib/env";
import { erc20Allowance, erc20Balance } from "@/lib/erc20";
import { getZeroExDomainFallback } from "@/lib/zeroex";
// import { env } from "@/lib/env";
import MarketSwitcher from "@/components/MarketSwitcher";
import { CancelPairControls } from "@/components/CancelPairControls";
import { getFeeInfo } from "@/lib/fees";
// import DemoModeBanner from "@/components/DemoModeBanner";

type TradeItem = { priceTicks: string; sizeBase: string; ts: string };

export default function MarketPage() {
  const { address, getSigner } = useWallet();
  const p = useParams<{ base: string; quote: string }>();
  const base = (Array.isArray(p.base) ? p.base[0] : p.base) ?? "";
  const quote = (Array.isArray(p.quote) ? p.quote[0] : p.quote) ?? "";
  const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`;
  const tsMs = (x?: string) => (x ? Date.parse(x) || 0 : 0);
  const lastBookTsMsRef = React.useRef<number>(0);

  // duration presets (seconds)
  const EXPIRY_PRESETS = [
    { label: "1m", secs: 1 * 60 },
    { label: "30m", secs: 30 * 60 },
    { label: "1h", secs: 60 * 60 },
    { label: "6h", secs: 6 * 60 * 60 },
    { label: "24h", secs: 24 * 60 * 60 },
    { label: "3d", secs: 3 * 24 * 60 * 60 },
  ] as const;

  const [market, setMarket] = useState<Market | null>(null);
  const [book, setBook] = useState<OrderbookResponse | null>(null);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastUpdated, setLastUpdated] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshing, setRefreshing] = useState(false);

  // maker state
  const [makerSide, setMakerSide] = useState<"BUY" | "SELL">("SELL");
  const [makerSize, setMakerSize] = useState<string>("0.10");
  const [makerPrice, setMakerPrice] = useState<string>("1000");

  const { placeLimit, cancelByHash } = useOrderSigning();

  type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]["secs"];
  const [makerExpirySecs, setMakerExpirySecs] = useState<ExpiryPreset>(24 * 60 * 60);

  // allowance state
  const [makerAllowance, setMakerAllowance] = React.useState<bigint | null>(null);
  const [checkingAllowance, setCheckingAllowance] = React.useState(false);

  // cancel state
  const [cancelHash, setCancelHash] = useState("");
  // WS/live toggle
  const [live] = useState<boolean>(true);

  // per-level timestamp cache
  const levelTs = React.useRef<Map<string, string>>(new Map());

  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
  ] as const;

  const rememberLevelsTs = React.useCallback(
    (side: "bids" | "asks", levels: Array<{ priceTicks: string; ts?: string }>) => {
      for (const l of levels) {
        const t = l.ts;
        if (t) levelTs.current.set(`${side}:${l.priceTicks}`, t);
      }
    },
    [],
  );

  const getLevelTs = React.useCallback(
    (side: "bids" | "asks", priceTicks: string) => levelTs.current.get(`${side}:${priceTicks}`),
    [],
  );

  const resolveAllowanceSpender = useCallback(async (): Promise<`0x${string}`> => {
    const { verifyingContract } = await getZeroExDomainFallback();
    const spender = verifyingContract as `0x${string}`;
    return spender;
  }, []);

  // resolve spender once
  const [spender, setSpender] = React.useState<`0x${string}` | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await resolveAllowanceSpender();
      if (!alive) return;
      setSpender(s);
    })();
    return () => {
      alive = false;
    };
  }, [resolveAllowanceSpender]);

  // initial load (markets → book → trades)
  useEffect(() => {
    let alive = true;
    setErr(null);

    (async () => {
      // 1) markets
      let m: Market | null = null;
      try {
        const mkts = await getMarkets();
        m = mkts.find((x) => x.symbol.toUpperCase() === symbol) ?? null;
        if (alive) {
          setMarket(m);
          setErr(null);
        }
        if (!m) return;
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : String(e));
        return;
      }

      // 2) orderbook
      try {
        const ob = await getOrderbook({ symbol: m.symbol, source: "live", depth: 10 });
        if (alive) setBook(ob);
        lastBookTsMsRef.current = tsMs((ob as unknown as { ts?: string })?.ts);
        rememberLevelsTs("bids", ob.bids ?? []);
        rememberLevelsTs("asks", ob.asks ?? []);
      } catch {
        if (alive) setBook(null);
      }

      // 3) trades
      try {
        const tr = await getTrades({ symbol: m.symbol, limit: 10 });
        if (alive) setTrades(tr.items as TradeItem[]);
      } catch {
        if (alive) setTrades([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [symbol, rememberLevelsTs]);

  // manual refresh hook (used by taker box and button)
  const reloadData = useCallback(async () => {
    const sym = market?.symbol ?? symbol;
    setRefreshing(true);
    try {
      const ob = await getOrderbook({ symbol: sym, source: "live", depth: 10 });
      setBook(ob);
      lastBookTsMsRef.current = tsMs((ob as unknown as { ts?: string })?.ts);
      rememberLevelsTs("bids", ob.bids ?? []);
      rememberLevelsTs("asks", ob.asks ?? []);
    } catch (e) {
      setBook(null);
      setErr(e instanceof Error ? e.message : String(e));
    }

    try {
      const tr = await getTrades({ symbol: sym, limit: 10 });
      setTrades(tr.items as TradeItem[]);
    } catch {
      setTrades([]);
    }

    setLastUpdated(new Date().toLocaleTimeString());
    setRefreshing(false);
  }, [market?.symbol, symbol, rememberLevelsTs]);

  React.useEffect(() => {
    const onRefresh = () => {
      void reloadData();
    };
    window.addEventListener("ste:refresh", onRefresh);
    return () => window.removeEventListener("ste:refresh", onRefresh);
  }, [reloadData]);

  // polling cadence depending on live toggle
  useEffect(() => {
    if (!live) {
      const id = setInterval(() => {
        void reloadData();
      }, 5000);
      return () => clearInterval(id);
    }

    // when live, poll trades lightly to avoid layout shifts
    const id = setInterval(async () => {
      try {
        if (!market?.symbol) return;
        const tr = await getTrades({ symbol: market.symbol, limit: 10 });
        setTrades(tr.items as TradeItem[]);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        /* noop */
      }
    }, 10000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, market?.symbol]);

  // WS subscription
  useEffect(() => {
    if (!live || !market?.symbol) return;
    let unsub = () => {};
    const sym = market.symbol;
    try {
      unsub = subscribeBook(sym, (snap) => {
        const incomingTs = tsMs(snap.ts);
        if (incomingTs > 0 && incomingTs < lastBookTsMsRef.current) {
          return; // snapshot viejo → ignorar
        }
        setBook(snap);
        lastBookTsMsRef.current = incomingTs || Date.now();
        rememberLevelsTs("bids", snap.bids ?? []);
        rememberLevelsTs("asks", snap.asks ?? []);
        setErr(null);
      });
    } catch (e) {
      console.warn("[WS] subscribeBook failed", e);
    }
    return () => unsub();
  }, [live, market?.symbol, rememberLevelsTs]);

  // WS subscription for trades.{pair}: backfill + realtime
  useEffect(() => {
    if (!live || !market?.symbol) return;
    const sym = market.symbol;

    const unsubscribe = subscribeTrades(sym, {
      // backfill inicial (últimos N trades desde el servidor)
      onInit: ({ items }) => {
        const mapped: TradeItem[] = items.map((t) => ({
          priceTicks: t.priceTicks,
          sizeBase: t.sizeBase,
          ts: t.ts,
        }));
        setTrades(mapped);
      },
      // un trade nuevo en tiempo real
      onTrade: (t) => {
        setTrades((prev) => {
          const next: TradeItem[] = [
            ...prev,
            {
              priceTicks: t.priceTicks,
              sizeBase: t.sizeBase,
              ts: t.ts,
            },
          ];
          // mantenemos un límite razonable (p.ej. 50) para no crecer sin control
          if (next.length > 50) {
            next.splice(0, next.length - 50);
          }
          return next;
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [live, market?.symbol]);

  const title = useMemo(() => (market ? `${market.symbol}` : symbol), [market, symbol]);

  const readOnly = useMemo(
    () =>
      process.env.NEXT_PUBLIC_READ_ONLY === "true" || process.env.NEXT_PUBLIC_PROFILE === "mainnet",
    [],
  );

  // place handler (UI-only messages updated to English)
  // place handler (UI-only messages updated to English)
  async function onPlace(opts?: { postOnly?: boolean }) {
    if (!market) return;
    setLoading(true);
    setErr(null);
    try {
      const bDec = market.base.decimals;
      const qDec = market.quote.decimals;

      const baseWei = ethers.parseUnits(makerSize || "0", bDec);
      const priceScaled = ethers.parseUnits(makerPrice || "0", qDec);
      const denom = BigInt(10) ** BigInt(bDec);
      const quoteWei = (baseWei * priceScaled) / denom;

      const signer = await getSigner();
      const me = await signer.getAddress();
      const provider = signer.provider!;
      const spenderResolved = spender ?? (await resolveAllowanceSpender());

      let required: bigint = BigInt(0);
      let token: `0x${string}`;
      let label: string;

      if (makerSide === "SELL") {
        token = market.base.address as `0x${string}`;
        required = baseWei;
        label = market.base.symbol;
      } else {
        token = market.quote.address as `0x${string}`;
        required = quoteWei;
        label = market.quote.symbol;
      }

      if (required > BigInt(0)) {
        const bal = await erc20Balance(provider, token, me as `0x${string}`);
        if (bal < required) {
          toast.error(`Insufficient ${label} balance for this order`);
          setLoading(false);
          return;
        }
        const alw = await erc20Allowance(provider, token, me as `0x${string}`, spenderResolved);
        if (alw < required) {
          toast.error(`Allowance too low for ${label}. Click “Enable” (approve) and try again.`);
          setLoading(false);
          return;
        }
      }

      await placeLimit({
        market,
        side: makerSide,
        // ⚠️ El parámetro tipado es sizeBaseHuman, NO "sizeHuman"
        sizeBaseHuman: makerSize,
        priceHuman: makerPrice,
        expirySec: makerExpirySecs,
        // ⬇️ NUEVO: propagamos el flag hacia el hook
        postOnly: opts?.postOnly,
      });

      await reloadData();
      // keep your normal place flow...
      await reloadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error(
        msg.includes("ACTION_REJECTED") || msg.includes("4001") ? "Signature rejected" : msg,
        { duration: 4000 },
      );
    } finally {
      setLoading(false);
    }
  }

  async function onCancel() {
    if (!cancelHash || !market) return;
    setLoading(true);
    setErr(null);
    try {
      // ⬇️ Pre-check: si no está PLACED, no abrimos MetaMask
      const signer = await getSigner();
      const me = await signer.getAddress();
      const { items } = await getOrders({
        address: me as `0x${string}`,
        symbol: market.symbol,
        limit: 200,
      });
      const row = items.find((o) => o.id.toLowerCase() === cancelHash.trim().toLowerCase());
      if (!row) {
        toast.warning("Order not found or not owned by current wallet");
        setLoading(false);
        return;
      }
      if (row.status !== "PLACED") {
        // status podría ser FILLED, CANCELLED/CANCELED, EXPIRED, etc.
        toast.warning(`Order is ${row.status.toLowerCase()} — cannot cancel`);
        setLoading(false);
        return;
      }
      await cancelByHash(market, cancelHash);
      await reloadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error(
        msg.includes("ACTION_REJECTED") || msg.includes("4001") ? "Action rejected" : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  const makerValidation = useMemo(
    () => (market ? validateLimitInput(market, makerSize, makerPrice) : null),
    [market, makerSize, makerPrice],
  );
  const tickHuman = useMemo(
    () =>
      market ? ethers.formatUnits(BigInt(market.rules.priceTickQ), market.quote.decimals) : "-",
    [market],
  );

  const makerPayToken = React.useMemo(() => {
    if (!market) return null;
    return makerSide === "SELL" ? market.base : market.quote;
  }, [market, makerSide]);

  const requiredAmountWei = React.useMemo(() => {
    if (!market) return BigInt(0);
    const size = ethers.parseUnits(makerSize || "0", market.base.decimals);
    if (makerSide === "SELL") {
      return size;
    }
    const priceScaled = ethers.parseUnits(makerPrice || "0", market.quote.decimals);
    const denom = BigInt(10) ** BigInt(market.base.decimals);
    return (size * priceScaled) / denom;
  }, [market, makerSide, makerSize, makerPrice]);

  // initial allowance check (visible once)
  React.useEffect(() => {
    (async () => {
      if (!market || !address || !makerPayToken || !spender) {
        setMakerAllowance(null);
        return;
      }
      try {
        setCheckingAllowance(true);
        const signer = await getSigner();
        const erc20 = new ethers.Contract(makerPayToken.address, ERC20_ABI, signer);
        const allowance: bigint = await erc20.allowance(address, spender);
        setMakerAllowance(allowance);
      } catch {
        setMakerAllowance(null);
      } finally {
        setCheckingAllowance(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.id, makerPayToken?.address, address, spender]);

  // silent allowance refresh each block
  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      if (!market || !address || !makerPayToken || !spender) return;
      const signer = await getSigner();
      const p = signer.provider!;
      const onBlock = async () => {
        try {
          const erc20 = new ethers.Contract(makerPayToken.address, ERC20_ABI, signer);
          const allowance: bigint = await erc20.allowance(address, spender);
          setMakerAllowance(allowance);
        } catch {
          /* noop */
        }
      };
      p.on("block", onBlock);
      cleanup = () => p.off("block", onBlock);
    })();
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.id, makerPayToken?.address, address, spender]);

  async function onEnableMakerToken() {
    if (!market || !makerPayToken) return;
    const signer = await getSigner();
    const erc20 = new ethers.Contract(makerPayToken.address, ERC20_ABI, signer);
    const spend = spender ?? zeroExEP();
    const tx = await erc20.approve(spend, ethers.MaxUint256);
    toast.message(`Enabling ${makerPayToken.symbol}`, { description: tx.hash });
    await tx.wait();
    toast.success(`${makerPayToken.symbol} enabled`);
    const next: bigint = await erc20.allowance(address, spend);
    setMakerAllowance(next);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header: 12-col grid avoids overlap and keeps controls on a single line */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Left: title + MarketHeader */}
        <div className="col-span-12 lg:col-span-7 min-w-0 space-y-2">
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          <div className="min-w-0">
            <MarketHeader market={market} />
            <div className="shrink-0">
              <MarketSwitcher currentSymbol={symbol} />
            </div>
          </div>
        </div>

        {/* Right: controls (no wrap; scroll if overflow) */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex justify-end">
            <div className="inline-flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 shadow-sm max-w-full">
              <div className="flex items-center gap-2 border-r border-neutral-800 pr-3 mr-1">
                <LiveIndicator status={live ? "connected" : "disconnected"} />
                <ChainBadge />
              </div>
              <div className="flex items-center gap-2">
                <AccountBadge />
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status / manual refresh */}
      {/* <div className="flex items-center justify-between text-xs text-neutral-400">
        <div>Last updated: {lastUpdated || "—"}</div>
        <button
          type="button"
          className="px-2 py-1 rounded border border-neutral-800/60 hover:bg-neutral-800/40 disabled:opacity-50"
          disabled={refreshing}
          onClick={() => {
            void reloadData();
          }}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>*/}

      {err && (
        <div className="rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 p-2 text-sm">
          {err}
        </div>
      )}

      {/* Main layout: single 12-col grid for all rows */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* === Row 1: Maker + Taker (same width) === */}
        <Card
          className={`md:col-span-12 lg:col-span-6 h-full border border-neutral-800/80 bg-neutral-950/60 transition-colors ${
            makerSide === "BUY"
              ? "shadow-[0_0_18px_rgba(16,185,129,0.28)]"
              : "shadow-[0_0_18px_rgba(244,63,94,0.28)]"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-semibold tracking-wide uppercase text-neutral-200">
              <span>Maker</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  makerSide === "BUY"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                }`}
              >
                {makerSide === "BUY" ? "Bid" : "Ask"}
              </span>
            </CardTitle>
            {/* Fee banner (concise line) */}
            {(() => {
              const { profile, bps, pct, recipientShort } = getFeeInfo();
              return (
                <p className="text-[11px] text-neutral-500">
                  {bps > 0 && profile === "sepolia"
                    ? `Demo fee ${pct}% to STE demo (${recipientShort})`
                    : `Demo: 0% taker fee`}
                </p>
              );
            })()}
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-neutral-200">
            <Segmented
              value={makerSide}
              onChange={(v) => setMakerSide(v)}
              options={[
                { label: "BUY", value: "BUY" },
                { label: "SELL", value: "SELL" },
              ]}
            />

            {/* Size */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-neutral-400">
                Size ({market?.base.symbol})
              </label>
              <Input
                value={makerSize}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                className="mt-1 font-mono"
                onChange={(e) =>
                  setMakerSize(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18, true))
                }
              />
            </div>

            {/* Price + expiry + ticks */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-400">
                Price ({market?.quote.symbol})
              </label>
              <Input
                value={makerPrice}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                className="mt-1 font-mono"
                onChange={(e) =>
                  setMakerPrice(sanitizeDecimal(e.target.value, market?.quote.decimals ?? 6, true))
                }
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-400">Expires in</label>
                <Segmented
                  value={String(makerExpirySecs)}
                  onChange={(v) => setMakerExpirySecs(Number(v) as ExpiryPreset)}
                  options={EXPIRY_PRESETS.map((p) => ({ label: p.label, value: String(p.secs) }))}
                />
              </div>

              {/* Tick controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-900"
                  aria-label="decrease one tick"
                  onClick={() => {
                    if (!market) return;
                    const qDec = market.quote.decimals;
                    const tickQ = BigInt(market.rules.priceTickQ);
                    const curScaled = ethers.parseUnits(makerPrice || "0", qDec);
                    const curTicks = curScaled / (tickQ || BigInt(1));
                    const nextScaled =
                      (curTicks > BigInt(0) ? curTicks - BigInt(1) : BigInt(0)) *
                      (tickQ || BigInt(1));
                    setMakerPrice(ethers.formatUnits(nextScaled, qDec));
                  }}
                >
                  −
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-900"
                  aria-label="increase one tick"
                  onClick={() => {
                    if (!market) return;
                    const qDec = market.quote.decimals;
                    const tickQ = BigInt(market.rules.priceTickQ);
                    const curScaled = ethers.parseUnits(makerPrice || "0", qDec);
                    const curTicks = curScaled / (tickQ || BigInt(1));
                    const nextScaled = (curTicks + BigInt(1)) * (tickQ || BigInt(1));
                    setMakerPrice(ethers.formatUnits(nextScaled, qDec));
                  }}
                >
                  +
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-900"
                  aria-label="set to best book level"
                  onClick={async () => {
                    if (!market) return;
                    const hasLocal =
                      !!book && (book.bids?.length ?? 0) + (book.asks?.length ?? 0) > 0;

                    const current = hasLocal
                      ? book
                      : await getOrderbook({ symbol, source: "live", depth: 10 }).catch(() => null);

                    if (
                      !current ||
                      ((current.bids?.length ?? 0) === 0 && (current.asks?.length ?? 0) === 0)
                    ) {
                      toast.warning("No prices in the orderbook yet");
                      return;
                    }

                    const bids = current.bids ?? [];
                    const asks = current.asks ?? [];

                    const bestBid =
                      bids.length > 0
                        ? bids.reduce(
                            (acc, l) => (BigInt(l.priceTicks) > BigInt(acc.priceTicks) ? l : acc),
                            bids[0],
                          )
                        : undefined;

                    const bestAsk =
                      asks.length > 0
                        ? asks.reduce(
                            (acc, l) => (BigInt(l.priceTicks) < BigInt(acc.priceTicks) ? l : acc),
                            asks[0],
                          )
                        : undefined;

                    const pick = makerSide === "SELL" ? (bestAsk ?? bestBid) : (bestBid ?? bestAsk);
                    if (!pick) {
                      toast.warning("No levels to set price");
                      return;
                    }

                    const qDec = market.quote.decimals;
                    const tickQ = BigInt(market.rules.priceTickQ);
                    const scaled = BigInt(pick.priceTicks) * (tickQ || BigInt(1));
                    setMakerPrice(ethers.formatUnits(scaled, qDec));
                  }}
                >
                  set best
                </Button>
              </div>
            </div>

            <PlaceLimitButton
              market={market}
              side={makerSide}
              sizeHuman={makerSize}
              priceHuman={makerPrice}
              onPlace={async () => {
                if (readOnly) {
                  toast.message("Read-only mode on Base: trading disabled");
                  return;
                }
                await onPlace();
              }}
            />
            {market && makerValidation && (
              <MakerHints market={market} makerValidation={makerValidation} tickHuman={tickHuman} />
            )}

            {address &&
            market &&
            makerPayToken &&
            makerAllowance !== null &&
            makerAllowance < requiredAmountWei ? (
              <div className="flex items-center justify-between rounded border border-amber-500/40 bg-amber-500/5 p-2">
                <div className="text-xs">
                  <b>Enable {makerPayToken.symbol}</b>
                  <div className="text-neutral-400">
                    Allow the exchange to spend your {makerPayToken.symbol} so this order can be
                    filled.
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    void onEnableMakerToken();
                  }}
                  disabled={checkingAllowance}
                >
                  {checkingAllowance ? "Checking…" : `Enable ${makerPayToken.symbol}`}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Taker wrapper: same column span and height to visually match Maker */}
        <Card className="md:col-span-12 lg:col-span-6 h-full">
          <CardHeader>
            <CardTitle>Taker</CardTitle>
            {/* Small print (dynamic) */}
            {(() => {
              const { profile, bps, pct, recipientShort } = getFeeInfo();
              return (
                <p className="text-[11px] text-neutral-500">
                  {bps > 0 && profile === "sepolia"
                    ? `Demo fee ${pct}% to STE demo (${recipientShort})`
                    : `Demo: 0% taker fee`}
                </p>
              );
            })()}
          </CardHeader>
          <CardContent className="h-full">
            <TakerBox market={market} />
          </CardContent>
        </Card>

        {/* === Row 2: Market summary (left) + Orderbook (center) + Recent trades (right) === */}
        <Card className="md:col-span-12 lg:col-span-3 h-full min-h-[300px]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
              Market summary
            </CardTitle>

            {market && (
              <div className="rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-300">
                {market.base.symbol}/{market.quote.symbol}
              </div>
            )}
          </CardHeader>

          <CardContent className="text-xs sm:text-sm text-neutral-300">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {(() => {
                const s = market
                  ? marketSummary({
                      book,
                      priceTickQ: market.rules.priceTickQ,
                      quoteDecimals: market.quote.decimals,
                    })
                  : {};

                return (
                  <>
                    <div className="text-neutral-500 uppercase tracking-wide text-[11px]">
                      Best bid
                    </div>
                    <div className="text-right font-mono text-sm text-emerald-400">
                      {s.bestBid ?? "—"}
                    </div>

                    <div className="text-neutral-500 uppercase tracking-wide text-[11px]">
                      Best ask
                    </div>
                    <div className="text-right font-mono text-sm text-rose-400">
                      {s.bestAsk ?? "—"}
                    </div>

                    <div className="text-neutral-500 uppercase tracking-wide text-[11px]">Mid</div>
                    <div className="text-right font-mono text-sm text-neutral-100">
                      {s.mid ?? "—"}
                    </div>

                    <div className="text-neutral-500 uppercase tracking-wide text-[11px]">
                      Spread
                    </div>
                    <div className="text-right font-mono text-sm text-sky-300">
                      {s.spreadBps ? `${s.spreadBps} bps` : "—"}
                    </div>
                  </>
                );
              })()}
            </div>

            {market && (
              <div className="mt-4 rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-[11px] text-neutral-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2 align-middle" />
                Snapshot from top-10 orderbook levels
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-12 lg:col-span-6 h-full min-h-[360px]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
              Orderbook
            </CardTitle>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-300">
                Top 10
              </span>
              <LiveIndicator status={live ? "connected" : "disconnected"} />
            </div>
          </CardHeader>

          <CardContent className="h-full">
            {!book ? (
              <TableSkeleton rows={10} cols={3} />
            ) : (book.bids?.length ?? 0) + (book.asks?.length ?? 0) === 0 ? (
              <EmptyState
                title="Empty orderbook"
                subtitle="Place a limit order or check back later."
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm h-full">
                {/* BIDS */}
                <div className="flex flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-400">Bids</div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/10 p-2">
                    <OrderbookTable
                      side="bids"
                      levels={book.bids ?? []}
                      market={market}
                      onTake={(l) => {
                        window.dispatchEvent(
                          new CustomEvent("ste:set-taker", {
                            detail: {
                              side: "SELL",
                              sizeHuman: fmtSizeBase(l.sizeBase, market!.base.decimals),
                            },
                          }),
                        );
                      }}
                      getLevelTs={getLevelTs}
                    />
                  </div>
                </div>

                {/* ASKS */}
                <div className="flex flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-400">Asks</div>
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="rounded-lg border border-rose-900/60 bg-rose-950/10 p-2">
                    <OrderbookTable
                      side="asks"
                      levels={book.asks ?? []}
                      market={market}
                      onTake={(l) => {
                        window.dispatchEvent(
                          new CustomEvent("ste:set-taker", {
                            detail: {
                              side: "BUY",
                              sizeHuman: fmtSizeBase(l.sizeBase, market!.base.decimals),
                            },
                          }),
                        );
                      }}
                      getLevelTs={getLevelTs}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-12 lg:col-span-3 h-full min-h-[300px]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
              Recent trades
            </CardTitle>
            <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-300">
              Live
            </span>
          </CardHeader>

          <CardContent className="h-full">
            {!trades && !book ? (
              <PanelSkeleton lines={6} />
            ) : trades.length === 0 ? (
              <EmptyState title="No recent trades" subtitle="They will appear in real time." />
            ) : (
              <ul className="space-y-1.5 text-xs">
                {trades.map((t, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-12 gap-1 rounded-md px-2 py-1 hover:bg-neutral-900/60 transition-colors"
                  >
                    {/* Time */}
                    <span className="col-span-6 text-[10px] text-neutral-500 font-mono">
                      {new Date(t.ts).toLocaleString()}
                    </span>

                    {/* Price */}
                    <span className="col-span-3 text-right font-mono text-neutral-100">
                      px{" "}
                      {fmtPriceFromTicks(
                        t.priceTicks,
                        market?.rules.priceTickQ ?? "1",
                        market?.quote.decimals ?? 6,
                      )}
                    </span>

                    {/* Size + notional */}
                    <span className="col-span-3 text-right font-mono text-neutral-300">
                      sz {fmtSizeBase(t.sizeBase, market?.base.decimals ?? 18)}
                      {market && (
                        <>
                          <br />
                          <span className="text-[10px] text-neutral-500">
                            {fmtNotionalQuote({
                              sizeBase: t.sizeBase,
                              priceTicks: t.priceTicks,
                              priceTickQ: market.rules.priceTickQ,
                              baseDecimals: market.base.decimals,
                              quoteDecimals: market.quote.decimals,
                            })}{" "}
                            {market.quote.symbol}
                          </span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* === Row 3: Balances & Allowances + My Orders + Cancel (half-width, stacked) === */}
        <div className="md:col-span-12 lg:col-span-6 lg:col-start-4 space-y-4">
          <BalancesPanel market={market} />
          <OrdersPanel />
          <Card className="bg-neutral-950/80 border-neutral-800/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
                    Cancel orders
                  </CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">
                    Use pair-wide cancel or target a single 0x order hash.
                  </p>
                </div>

                {market && (
                  <span className="hidden sm:inline-flex rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-rose-200">
                    {market.base.symbol}/{market.quote.symbol}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 🔴 Cancel pair (scope-based) */}
              <CancelPairControls market={market} className="justify-between" />

              {/* Separador fino */}
              <div className="h-px bg-neutral-800/80" />

              {/* ⚪ Cancel by orderHash (lo que ya tenías) */}
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">
                  Cancel by <span className="font-mono">orderHash</span> (0x…).
                </p>

                <Input
                  placeholder="0x..."
                  value={cancelHash}
                  onChange={(e) => setCancelHash(e.target.value)}
                  className="my-2 font-mono text-xs bg-neutral-900/60 border-neutral-700/80 focus-visible:ring-1 focus-visible:ring-red-500/60 focus-visible:border-red-500/60"
                />

                <Button
                  disabled={readOnly || !cancelHash || loading}
                  onClick={() => {
                    if (readOnly) {
                      toast.message("Read-only mode");
                      return;
                    }
                    void onCancel();
                  }}
                  className="w-full justify-center border-red-500/60 text-red-100 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  variant="outline"
                >
                  {loading ? "Sending..." : "Cancel order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
