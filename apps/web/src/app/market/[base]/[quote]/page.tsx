// apps/web/src/app/market/[base]/[quote]/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import ConnectButton from "@/components/ConnectButton";
import { useParams } from "next/navigation";
import {
  getMarkets,
  getOrderbook,
  getTrades,
  type Market,
  type OrderbookResponse,
} from "@/lib/api";
import { useOrderSigning } from "@/hooks/useOrderSigning";
import TakerBox from "@/components/TakerBox"; // for quoting and taking orders
import { subscribeBook } from "@/lib/ws"; // for live orderbook updates
import OrdersPanel from "@/components/OrdersPanel";
import { PlaceLimitButton } from "@/components/TakerBox";
import { fmtPriceFromTicks, fmtSizeBase, fmtNotionalQuote } from "@/lib/format";
import { validateLimitInput } from "@/lib/validation";
import LiveBadge from "@/components/LiveBadge";
import { sanitizeDecimal } from "@/lib/number";
import { SkeletonList } from "@/components/Skeleton";
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
import AppFooter from "@/components/AppFooter";
import Segmented from "@/components/ui/Segmented";
import AccountBadge from "@/components/AccountBadge";
import ApiHealthBadge from "@/components/ApiHealthBadge";
import { useWallet } from "@/providers/wallet";
import { zeroExEP } from "@/lib/env";
import { erc20Allowance, erc20Balance } from "@/lib/erc20";
import { getZeroExDomainFallback } from "@/lib/zeroex";
import { env } from "@/lib/env";
import MarketSwitcher from "@/components/MarketSwitcher";

//import DemoModeBanner from "@/components/DemoModeBanner";

type TradeItem = { priceTicks: string; sizeBase: string; ts: string };

export default function MarketPage() {
  const { address, getSigner } = useWallet();
  const p = useParams<{ base: string; quote: string }>();
  const base = (Array.isArray(p.base) ? p.base[0] : p.base) ?? "";
  const quote = (Array.isArray(p.quote) ? p.quote[0] : p.quote) ?? "";
  const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`;

  // presets de duración (segundos)
  const EXPIRY_PRESETS = [
    { label: "1m", secs: 1 * 60 }, // 1 minuto
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
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Maker form state (único bloque de maker)
  const [makerSide, setMakerSide] = useState<"BUY" | "SELL">("SELL");
  const [makerSize, setMakerSize] = useState<string>("0.10");
  const [makerPrice, setMakerPrice] = useState<string>("1000");

  const { cancelByHash } = useOrderSigning();

  type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]["secs"];

  // NUEVO: duración seleccionada (por defecto 24h)
  const [makerExpirySecs, setMakerExpirySecs] = useState<ExpiryPreset>(24 * 60 * 60);

  // Maker Allowance state (mantiene semántica actual)
  const [makerAllowance, setMakerAllowance] = React.useState<bigint | null>(null);
  const [checkingAllowance, setCheckingAllowance] = React.useState(false);

  // Cancel form state
  const [cancelHash, setCancelHash] = useState("");
  // WS/live toggle
  const [live, setLive] = useState<boolean>(true);

  // cache in-memory de ts por nivel (no se pierde con renders)
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
    let spender = verifyingContract as `0x${string}`;
    try {
      const base = env().NEXT_PUBLIC_API_BASE_URL;
      const r = (await fetch(`${base}/dev/zeroex/sanity`).then((x) => x.json())) as {
        allowanceSpender?: string;
      } | null;
      const s = r?.allowanceSpender;
      if (typeof s === "string" && s.startsWith("0x") && s.length === 42) {
        spender = s as `0x${string}`;
      }
    } catch {
      /* fallback al EP */
    }
    return spender;
  }, []);

  // === NUEVO: resolver spender una vez (estable) ===
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

  // load market + data
  useEffect(() => {
    let alive = true;
    setErr(null); // limpia la barra roja al comenzar este ciclo

    (async () => {
      // 1) Markets
      let m: Market | null = null;
      try {
        const mkts = await getMarkets();
        m = mkts.find((x) => x.symbol.toUpperCase() === symbol) ?? null;
        if (alive) {
          setMarket(m);
          setErr(null); // si mercados responde, aseguramos limpiar error
        }
        if (!m) return;
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : String(e));
        return;
      }

      // 2) Orderbook
      try {
        const ob = await getOrderbook({ symbol: m.symbol, source: "live", depth: 10 });
        if (alive) setBook(ob);
        rememberLevelsTs("bids", ob.bids ?? []);
        rememberLevelsTs("asks", ob.asks ?? []);
      } catch {
        if (alive) setBook(null);
      }

      // 3) Trades
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

  // Forzar refresco (book + trades) cuando TakerBox lo pida
  const reloadData = useCallback(async () => {
    const sym = market?.symbol ?? symbol;
    setRefreshing(true);
    try {
      const ob = await getOrderbook({ symbol: sym, source: "live", depth: 10 });
      console.log("[UI] refresh → orderbook", ob);
      setBook(ob);
      rememberLevelsTs("bids", ob.bids ?? []);
      rememberLevelsTs("asks", ob.asks ?? []);
    } catch (e) {
      console.warn("[UI] orderbook fetch failed", e);
      setBook(null);
      setErr(e instanceof Error ? e.message : String(e));
    }

    try {
      const tr = await getTrades({ symbol: sym, limit: 10 });
      console.log("[UI] refresh → trades", tr);
      setTrades(tr.items as TradeItem[]);
    } catch (e) {
      console.warn("[UI] trades fetch failed", e);
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

  useEffect(() => {
    if (!live) {
      // No live → refresca libro + trades cada 5s
      const id = setInterval(() => {
        void reloadData();
      }, 5000);
      return () => clearInterval(id);
    }

    // Live (WS) → sólo trades cada 10s para no "mover" el layout
    const id = setInterval(async () => {
      try {
        if (!market?.symbol) return; // ← espera a tener canónico
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

  // efecto WS (activa/desactiva según toggle 'live')
  useEffect(() => {
    // Sólo suscribirse cuando tenemos el símbolo canónico del backend
    if (!live || !market?.symbol) return;
    let unsub = () => {};
    const sym = market.symbol; // ← canónico, respeta mayúsculas/minúsculas del token
    try {
      unsub = subscribeBook(sym, (snap) => {
        // sustituye el libro con el snapshot recibido
        setBook(snap);
        rememberLevelsTs("bids", snap.bids ?? []);
        rememberLevelsTs("asks", snap.asks ?? []);
        // limpia errores visuales:
        setErr(null);
      });
    } catch (e) {
      // si falla la conexión, caemos al polling
      console.warn("[WS] subscribeBook failed", e);
    }
    return () => unsub();
  }, [live, market?.symbol, rememberLevelsTs]);

  const title = useMemo(() => (market ? `${market.symbol}` : symbol), [market, symbol]);

  // Handler del maker: usa los estados visibles makerSide/makerSize/makerPrice
  async function onPlace() {
    if (!market) return;
    setLoading(true);
    setErr(null);
    try {
      // --- cantidades maker (idénticas a tu computeAmounts) ---
      const bDec = market.base.decimals;
      const qDec = market.quote.decimals;

      const baseWei = ethers.parseUnits(makerSize || "0", bDec);
      const priceScaled = ethers.parseUnits(makerPrice || "0", qDec);
      const denom = BigInt(10) ** BigInt(bDec);
      const quoteWei = (baseWei * priceScaled) / denom;

      // --- wallet + spender ---
      const signer = await getSigner();
      const me = await signer.getAddress();
      const provider = signer.provider!;
      const spenderResolved = spender ?? (await resolveAllowanceSpender());

      // --- según side, qué token paga el maker y cuánto requiere ---
      let required: bigint = BigInt(0);
      let token: `0x${string}`;
      let label: string;

      if (makerSide === "SELL") {
        token = market.base.address as `0x${string}`;
        required = baseWei;
        label = market.base.symbol;
      } else {
        token = market.quote.address as `0x${string}`;
        required = quoteWei; // notional en quote
        label = market.quote.symbol;
      }

      // Chequeos: balance y allowance (si required > 0)
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

      // --- si pasa los chequeos, firmar/colocar como siempre ---

      await reloadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error(
        msg.includes("ACTION_REJECTED") || msg.includes("4001") ? "Firma cancelada" : msg,
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
      await cancelByHash(market, cancelHash);
      await reloadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error(
        msg.includes("ACTION_REJECTED") || msg.includes("4001") ? "Acción cancelada" : msg,
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
      // Maker paga BASE
      return size;
    }
    // Maker BUY → paga QUOTE: sizeBase * price / 10^baseDecimals
    const priceScaled = ethers.parseUnits(makerPrice || "0", market.quote.decimals);
    const denom = BigInt(10) ** BigInt(market.base.decimals);
    return (size * priceScaled) / denom;
  }, [market, makerSide, makerSize, makerPrice]);

  // === CAMBIO: chequeo de allowance SIN parpadeo ===
  // 1) Chequeo inicial “visible” sólo cuando cambian owner/token/spender (no por tecleo)
  React.useEffect(() => {
    (async () => {
      if (!market || !address || !makerPayToken || !spender) {
        setMakerAllowance(null);
        return;
      }
      try {
        setCheckingAllowance(true); // visible sólo en este primer chequeo
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

  // 2) Refresco en silencio en cada bloque (sin tocar el label → no flicker)
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
    const spend = spender ?? zeroExEP(); // fallback a EP si aún no está resuelto
    const tx = await erc20.approve(spend, ethers.MaxUint256);
    toast.message(`Enabling ${makerPayToken.symbol}`, { description: tx.hash });
    await tx.wait();
    toast.success(`${makerPayToken.symbol} enabled`);
    // refrescar allowance (visible una vez tras la tx)
    const next: bigint = await erc20.allowance(address, spend);
    setMakerAllowance(next);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Columna izquierda: título + MarketHeader */}
        <div className="md:col-span-2 space-y-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="w-full">
            <MarketHeader market={market} />
          </div>
        </div>

        {/* Columna derecha: controles */}
        <div className="flex md:justify-end items-center gap-3">
          <MarketSwitcher currentSymbol={symbol} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live
            <ApiHealthBadge />
            <LiveBadge />
          </label>
          <ChainBadge />
          <AccountBadge />
          <ConnectButton />
        </div>
      </div>

      {/* Status / manual refresh */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>Last updated: {lastUpdated || "—"}</div>
        <button
          type="button"
          className="px-2 py-1 rounded border disabled:opacity-50"
          disabled={refreshing}
          onClick={() => {
            void reloadData();
          }}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <div className="rounded bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Order form (Maker) */}
        <Card>
          <CardHeader>
            <CardTitle>Maker (limit)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Segmented
              value={makerSide}
              onChange={(v) => setMakerSide(v)}
              options={[
                { label: "BUY", value: "BUY" },
                { label: "SELL", value: "SELL" },
              ]}
            />

            <label className="block text-sm">Size ({market?.base.symbol})</label>
            <Input
              value={makerSize}
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              onChange={(e) =>
                setMakerSize(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18, true))
              }
            />

            <label className="block text-sm">Price ({market?.quote.symbol})</label>
            <div className="space-y-2">
              <Input
                value={makerPrice}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                onChange={(e) =>
                  setMakerPrice(sanitizeDecimal(e.target.value, market?.quote.decimals ?? 6, true))
                }
              />
              <label className="block text-sm">Expires in</label>
              <Segmented
                value={String(makerExpirySecs)}
                onChange={(v) => setMakerExpirySecs(Number(v) as ExpiryPreset)}
                options={EXPIRY_PRESETS.map((p) => ({ label: p.label, value: String(p.secs) }))}
              />

              {/* fila separada y con wrap para que no se pisen */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
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
                  variant="outline"
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
                  variant="outline"
                  aria-label="set to best book level"
                  onClick={async () => {
                    if (!market) return;

                    // Usa el libro en memoria; si está vacío, trae uno fresco
                    const hasLocal =
                      !!book && (book.bids?.length ?? 0) + (book.asks?.length ?? 0) > 0;

                    const current = hasLocal
                      ? book
                      : await getOrderbook({ symbol, source: "live", depth: 10 }).catch(() => null);

                    if (
                      !current ||
                      ((current.bids?.length ?? 0) === 0 && (current.asks?.length ?? 0) === 0)
                    ) {
                      toast.warning("No hay precios en el libro todavía");
                      return;
                    }

                    const bids = current.bids ?? [];
                    const asks = current.asks ?? [];

                    // best bid = ticks más alto; best ask = ticks más bajo
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

                    // SELL → preferimos best ask; si no hay, caemos a best bid. BUY al revés.
                    const pick = makerSide === "SELL" ? (bestAsk ?? bestBid) : (bestBid ?? bestAsk);
                    if (!pick) {
                      toast.warning("No hay niveles para establecer precio");
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
              onPlace={onPlace}
            />

            {market && makerValidation && (
              <MakerHints market={market} makerValidation={makerValidation} tickHuman={tickHuman} />
            )}
            {address &&
            market &&
            makerPayToken &&
            makerAllowance !== null &&
            makerAllowance < requiredAmountWei ? (
              <div className="flex items-center justify-between border rounded p-2">
                <div className="text-xs">
                  <b>Enable {makerPayToken.symbol}</b>
                  <div className="text-gray-500">
                    Allow the exchange to spend your {makerPayToken.symbol} for this order to be
                    fillable.
                  </div>
                </div>
                <Button
                  type="button"
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

        {/* Orderbook */}
        <div className="rounded-2xl p-4 shadow border">
          <h3 className="font-medium mb-2">Orderbook (top 10)</h3>
          {!book ? (
            <SkeletonList rows={8} />
          ) : (
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="font-semibold mb-1">Bids</div>
                <OrderbookTable
                  side="bids"
                  levels={book.bids ?? []}
                  market={market}
                  onTake={(l) => {
                    // Si tomas un bid → tú eres SELL
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
              <div>
                <div className="font-semibold mb-1">Asks</div>
                <OrderbookTable
                  side="asks"
                  levels={book.asks ?? []}
                  market={market}
                  onTake={(l) => {
                    // Si tomas un ask → tú eres BUY
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
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Market summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-2 gap-2">
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
                  <div className="text-gray-500">Best bid</div>
                  <div className="text-right font-mono">{s.bestBid ?? "—"}</div>
                  <div className="text-gray-500">Best ask</div>
                  <div className="text-right font-mono">{s.bestAsk ?? "—"}</div>
                  <div className="text-gray-500">Mid</div>
                  <div className="text-right font-mono">{s.mid ?? "—"}</div>
                  <div className="text-gray-500">Spread</div>
                  <div className="text-right font-mono">
                    {s.spreadBps ? `${s.spreadBps} bps` : "—"}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Trades */}
        <div className="rounded-2xl p-4 shadow border">
          <h3 className="font-medium mb-2">Recent trades</h3>
          {trades.length === 0 && !book ? (
            <SkeletonList rows={6} />
          ) : (
            <ul className="space-y-1 text-sm">
              {trades?.map((t, i) => (
                <li key={i}>
                  <span className="text-xs text-gray-500">{new Date(t.ts).toLocaleString()}</span>
                  {" · "}
                  px{" "}
                  {fmtPriceFromTicks(
                    t.priceTicks,
                    market?.rules.priceTickQ ?? "1",
                    market?.quote.decimals ?? 6,
                  )}
                  {" · "}
                  size {fmtSizeBase(t.sizeBase, market?.base.decimals ?? 18)}
                  {market && (
                    <>
                      {" · "}notional{" "}
                      {fmtNotionalQuote({
                        sizeBase: t.sizeBase,
                        priceTicks: t.priceTicks,
                        priceTickQ: market.rules.priceTickQ,
                        baseDecimals: market.base.decimals,
                        quoteDecimals: market.quote.decimals,
                      })}{" "}
                      {market.quote.symbol}
                    </>
                  )}
                </li>
              )) ?? <li>—</li>}
            </ul>
          )}
        </div>
        <BalancesPanel market={market} />

        {/* Taker box y panel de órdenes en vivo */}
        <TakerBox market={market} />
        <OrdersPanel />
      </div>

      {/* Cancel */}
      <div className="rounded-2xl p-4 shadow border max-w-md">
        <label className="block text-sm">Cancel by orderHash</label>
        <input
          className="w-full border rounded p-2 my-2"
          placeholder="0x..."
          value={cancelHash}
          onChange={(e) => setCancelHash(e.target.value)}
        />
        <button
          disabled={!cancelHash || loading}
          onClick={onCancel}
          className="w-full rounded border py-2"
        >
          {loading ? "Sending..." : "Cancel"}
        </button>
      </div>
      <AppFooter />
    </div>
  );
}
