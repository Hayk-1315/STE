/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/web/src/hooks/useMarketOrder.ts
"use client";

// Market-order execution pipeline: quote → approve → execute → apply, plus
// preflight gas check. Consumed by TradePanel's Market mode. The "taker" naming
// inside this file refers to the 0x v4 LimitOrder taker side (the field names
// returned by the backend match what the on-chain ExchangeProxy expects), not
// to a separate UI surface.

import { useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { postMatchQuote } from "@/lib/api";
import { env } from "@/lib/env";
import { useWallet } from "@/providers/wallet";
import { approveIfNeeded, erc20Allowance } from "@/lib/erc20";
import type { QuoteResponse as MatchQuoteResponse, Tif } from "@/lib/types";
import { getZeroExDomainFallback } from "@/lib/zeroex";

export type TxData = { to: `0x${string}`; data: `0x${string}`; value: string };

// Extendemos el tipo de respuesta para incluir txData/txList y campos de fee
export type MatchQuoteWithTx = MatchQuoteResponse & {
  txData?: TxData;
  txList?: TxData[];
  takerTotalAmount?: string;
  takerFeeTotal?: string;
  takerFeeRecipient?: string;
  feeRecipient?: string;
};

export type MarketOrderResult = {
  fills: number;
  hasTx: boolean;
  txHash?: string;
  txData?: TxData;
};

// —— helpers de error legible ——
function messageFromUnknown(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function parseAvailableFromMsg(msg: string): bigint | null {
  const m = msg.match(/available\s*=\s*(\d+)/i);
  if (m && m[1]) {
    try {
      return BigInt(m[1]);
    } catch {}
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function humanizeApiError(e: unknown, market?: Market | null, _side?: "BUY" | "SELL"): string {
  const raw = messageFromUnknown(e);
  const lower = raw.toLowerCase();
  const looksInsuff =
    lower.includes("insufficient_liquidity") ||
    lower.includes("requested_gt_available") ||
    lower.includes("exceeds_available") ||
    lower.includes("no_fills") ||
    lower.includes("no liquidity");
  if (!looksInsuff) return raw;

  const avail = parseAvailableFromMsg(raw);
  if (avail != null && market) {
    const human = (() => {
      try {
        return ethers.formatUnits(avail, market.base.decimals);
      } catch {
        return avail.toString();
      }
    })();
    return `There isn’t enough liquidity for that size. Currently available: ${human} ${market.base.symbol}.`;
  }
  return market
    ? ` There isn’t enough liquidity ${market.base.symbol} para ese tamaño.`
    : "There isn’t enough liquidity for that size.";
}

export type UseMarketOrderParams = {
  market: Market | null;
  side: "BUY" | "SELL";
  sizeHuman: string;
  tif: Tif;
  // Optional taker price cap (in ticks). When set, the backend matcher
  // truncates its sweep so the resulting tx cannot fill above (BUY) or
  // below (SELL) this price. Used by TradePanel's marketable-limit branch.
  limitPriceTicks?: string;
};

export function useMarketOrder({
  market,
  side,
  sizeHuman,
  tif,
  limitPriceTicks,
}: UseMarketOrderParams) {
  const { getSigner } = useWallet();

  const [busy, setBusy] = useState(false);

  const [result, setResult] = useState<MarketOrderResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // Phase 5 Part B.2: synchronous parse of the latest /match/quote failure
  // code (e.g. "notional_below_min_notional") so a consumer that awaits
  // onQuote() can inspect WHY null came back without depending on stale
  // React state. Refs are read synchronously and are not subject to render
  // batching. Cleared on every successful quote.
  const lastFailureCodeRef = useRef<string | null>(null);

  // Flujo 3 pasos
  const [q, setQ] = useState<MatchQuoteWithTx | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [approving, setApproving] = useState(false);
  const [needed, setNeeded] = useState<bigint>(BigInt(0));
  const [takerToken, setTakerToken] = useState<`0x${string}` | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingTxData, setPendingTxData] = useState<TxData | null>(null);
  const [takerFee, setTakerFee] = useState<bigint>(BigInt(0));
  const [feeRecipient, setFeeRecipient] = useState<`0x${string}` | null>(null);

  // Devuelve { label, explorerTxBase } según NEXT_PUBLIC_CHAIN_ID
  const { label: chainLabel, explorerTxBase } = useMemo(() => {
    const id = Number(env().NEXT_PUBLIC_CHAIN_ID);
    if (id === 8453) return { label: "Base", explorerTxBase: "https://basescan.org/tx/" };
    if (id === 11155111)
      return { label: "Sepolia", explorerTxBase: "https://sepolia.etherscan.io/tx/" };
    if (id === 84532)
      return { label: "Base Sepolia", explorerTxBase: "https://sepolia.basescan.org/tx/" };
    return { label: `Chain ${id}`, explorerTxBase: "https://etherscan.io/tx/" }; // fallback genérico
  }, []);

  // Invalidate any cached quote/plan whenever the inputs that produced it change.
  // Prevents executing a stale plan against the wrong side / size / TIF — the unified
  // panel's prominent Buy/Sell toggle makes this race much easier to hit.
  useEffect(() => {
    if (q === null) return;
    setQ(null);
    setResult(null);
    setErr(null);
    setNeedsApproval(false);
    setNeeded(BigInt(0));
    setTakerToken(null);
    setTakerFee(BigInt(0));
    setFeeRecipient(null);
    setPendingTxData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.symbol, side, sizeHuman, tif, limitPriceTicks]);

  // -------- Paso 1: QUOTE --------
  // Returns the fresh quote on success, or null on any failure / no-tx path
  // (matches the existing state-setting semantics). Existing callers that
  // ignore the return value (e.g. TradePanel) are unaffected; the SEA Phase 5
  // ReadyIntentRowActions uses the returned value to run a synchronous
  // "sufficient liquidity" guard before approve/execute, avoiding stale-state
  // reads from React's batched updates.
  async function onQuote(): Promise<MatchQuoteWithTx | null> {
    if (!market) return null;
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const sizeBaseStr = ethers.parseUnits(sizeHuman, market.base.decimals).toString();
      const requested = BigInt(sizeBaseStr);

      // ⬅️ NUEVO: usamos postMatchQuote y pasamos tif solo si es FOK
      const qq = (await postMatchQuote({
        marketId: market.symbol,
        side,
        sizeBase: sizeBaseStr,
        ...(tif === "FOK" ? { tif: "FOK" as Tif } : {}),
        ...(limitPriceTicks ? { limitPriceTicks } : {}),
      })) as MatchQuoteWithTx;

      // Detecta liquidez total en fills (para mensajes claros)
      const fillsArr = Array.isArray(qq?.fills) ? qq.fills : [];
      const availableBase = fillsArr.reduce((acc, f) => {
        const sv =
          typeof f?.sizeBase === "string"
            ? f.sizeBase
            : String((f as unknown as { sizeBase?: unknown })?.sizeBase ?? "0");
        let v = BigInt(0);
        try {
          v = BigInt(sv);
        } catch {}
        return acc + v;
      }, BigInt(0));

      const txList = qq.txList as TxData[] | undefined;
      const hasAnyTx = Boolean(qq.txData || (Array.isArray(txList) && txList.length > 0));

      // Si NO hay ni txData ni txList → tratar razones y mensajes
      if (!hasAnyTx) {
        if (availableBase === BigInt(0)) {
          const msg = `There’s no liquidity available right now on the other side.`;
          setQ(null);
          setPendingTxData(null);
          setNeedsApproval(false);
          setErr(msg);
          toast.error(msg, { duration: 4000 });
          return null;
        }
        if (availableBase < requested) {
          const humanAvail = (() => {
            try {
              return ethers.formatUnits(availableBase, market.base.decimals);
            } catch {
              return availableBase.toString();
            }
          })();
          const msg = `There isn’t enough liquidity for that size. Currently available: ${humanAvail} ${market.base.symbol}.`;
          setQ(null);
          setPendingTxData(null);
          setNeedsApproval(false);
          setErr(msg);
          toast.error(msg, { duration: 4500 });
          return null;
        }
        const msg = "Couldn’t build the transaction for this quote.";
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(msg);
        toast.error(msg, { duration: 4000 });
        return null;
      }

      // Con txData o txList → flujo normal: aprobar si hace falta y permitir Execute
      setQ(qq);
      // ⬇️ total de fee y recipient (si el backend los envía)
      const feeTotal = (() => {
        try {
          const v = (qq as any)?.takerFeeTotal;
          return v ? BigInt(v as string) : BigInt(0);
        } catch {
          return BigInt(0);
        }
      })();
      setTakerFee(feeTotal);

      // intenta top-level y luego del primer fill
      const recAny =
        (qq as any)?.takerFeeRecipient ??
        (qq as any)?.feeRecipient ??
        (qq?.fills?.[0] as any)?.feeRecipient ??
        (qq?.fills?.[0] as any)?.rawOrder?.feeRecipient ??
        null;

      setFeeRecipient(
        recAny && /^0x[0-9a-fA-F]{40}$/.test(String(recAny))
          ? (String(recAny) as `0x${string}`)
          : null,
      );

      // Derivar takerToken (igual que antes)
      const fill0 = qq.fills?.[0];
      const token: `0x${string}` =
        (fill0 as any)?.takerToken && /^0x[0-9a-fA-F]{40}$/.test((fill0 as any).takerToken)
          ? ((fill0 as any).takerToken as `0x${string}`)
          : side === "BUY"
            ? (market.quote.address as `0x${string}`)
            : (market.base.address as `0x${string}`);
      setTakerToken(token);

      // Preferir el total top-level para multi-fill
      const amt: bigint = (() => {
        // prioridad: total con fee
        if ((qq as any)?.takerTotalAmount) {
          try {
            return BigInt((qq as any).takerTotalAmount as string);
          } catch {}
        }
        // fallback: antiguo comportamiento
        if ((qq as any)?.takerAmount) {
          try {
            return BigInt((qq as any).takerAmount as string);
          } catch {}
        }
        if (fill0 && (fill0 as any).takerAmount) {
          try {
            return BigInt((fill0 as any).takerAmount as string);
          } catch {}
        }
        return BigInt(0);
      })();

      if (amt > BigInt(0)) {
        const signer = await getSigner();
        const owner = (await signer.getAddress()) as `0x${string}`;
        const { verifyingContract } = await getZeroExDomainFallback();
        const alw = await erc20Allowance(signer.provider!, token, owner, verifyingContract);
        setNeeded(amt);
        setNeedsApproval(alw < amt);
      } else {
        setNeeded(BigInt(0));
        setNeedsApproval(false);
      }

      // Guarda txData (single) opcionalmente; para multi usamos txList al ejecutar
      setPendingTxData(qq.txData as TxData | null);

      // Phase 5 Part B.2: clear any prior failure code on success.
      lastFailureCodeRef.current = null;

      toast.success(`Plan ready · fills=${qq.fills?.length ?? 0}`, { duration: 2500 });
      return qq;
    } catch (e) {
      const raw = messageFromUnknown(e);
      const lower = raw.toLowerCase();

      // Phase 5 Part B.2: classify the backend rejection code so CMR
      // ReadyIntentRowActions can surface the specific reason without
      // depending on stale React state. Simple substring check is robust to
      // both string and JSON-payload error bodies.
      lastFailureCodeRef.current = (() => {
        if (lower.includes("notional_below_min_notional")) return "notional_below_min_notional";
        if (lower.includes("size_below_min_size")) return "size_below_min_size";
        if (lower.includes("fok_insufficient_liquidity")) return "fok_insufficient_liquidity";
        return null;
      })();

      // ⬅️ manejo específico FOK
      if (lower.includes("fok_insufficient_liquidity")) {
        const msg = "FOK rejected: not enough liquidity to fill the whole size.";
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(msg);
        toast.error(msg, { duration: 3000 });
      } else if (lower.includes("notional_below_min_notional")) {
        // Parse the structured payload to render a friendlier inline message.
        let friendly = "Below the market's minimum notional. Increase size and re-quote.";
        try {
          const parsed = JSON.parse(raw) as { minNotionalQ?: string };
          if (parsed?.minNotionalQ && market) {
            const minHuman = ethers.formatUnits(BigInt(parsed.minNotionalQ), market.quote.decimals);
            friendly = `Min notional: ${minHuman} ${market.quote.symbol}`;
          }
        } catch {
          // fall through to default copy
        }
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(friendly);
        toast.error(friendly, { duration: 4000 });
      } else {
        const nice = humanizeApiError(e, market, side);
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(nice);
        toast.error(nice, { duration: 4000 });
      }
      return null;
    } finally {
      setBusy(false);
    }
  }

  // -------- Paso 2: APPROVE (si hace falta) --------
  async function onApprove() {
    const txList = q?.txList as TxData[] | undefined;
    const hasAnyTx = Boolean(q?.txData || (Array.isArray(txList) && txList.length > 0));
    if (!market || !takerToken || !hasAnyTx || needed <= BigInt(0)) return;

    setApproving(true);
    setBusy(true);
    try {
      const signer = await getSigner();
      const { verifyingContract } = await getZeroExDomainFallback();
      const txHash = await approveIfNeeded(signer, takerToken, verifyingContract, needed);
      if (txHash) toast.success(`Approve sent · ${txHash.slice(0, 10)}…`);
      setNeedsApproval(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setApproving(false);
      setBusy(false);
    }
  }

  // -------- Paso 3: EXECUTE --------
  // Phase 4.x-b: `onExecute` accepts an optional `onSubmitted` callback. It
  // fires exactly once with `sent.hash` immediately after broadcast and
  // BEFORE `await sent.wait()`. CMR uses this to post
  // /sea/intents/:id/executing with the bearer executionToken so the
  // intent state updates while the FillWatcher races to reconcile.
  // Normal Market mode passes no callback → behaviour is byte-identical
  // to the pre-4.x-b code path. Callback throws are caught + logged; the
  // receipt / /match/apply flow is unaffected.
  async function onExecute(options?: { onSubmitted?: (txHash: string) => void | Promise<void> }) {
    const txList = q?.txList as TxData[] | undefined;
    const hasAnyTx = Boolean(q?.txData || (Array.isArray(txList) && txList.length > 0));
    if (!hasAnyTx) {
      alert("Without txData/txList (multi-fill builder not available)");
      return;
    }

    setBusy(true);
    setErr(null);
    // Lifted to function scope so the catch path can detect partial multi-fill
    // and refresh the UI for whatever already landed on-chain.
    let lastHash: string | undefined;
    let executedTxs = 0;
    let submittedNotified = false;
    const notifySubmitted = async (txHash: string) => {
      if (submittedNotified) return;
      submittedNotified = true;
      if (!options?.onSubmitted) return;
      try {
        await options.onSubmitted(txHash);
      } catch (e) {
        // Never break the receipt/match-apply flow on a callback error.

        console.warn("[useMarketOrder] onSubmitted threw", e);
      }
    };
    const totalPlannedTxs = q?.txData ? 1 : Array.isArray(txList) ? txList.length : 0;
    try {
      const signer = await getSigner();
      if (!market) throw new Error("Market not available");

      if (q?.txData) {
        // Single
        const sent = await signer.sendTransaction({
          to: (q.txData as TxData).to,
          data: (q.txData as TxData).data,
          value: BigInt((q.txData as TxData).value ?? "0"),
        });
        // Fire the optional submitted callback BEFORE awaiting the receipt
        // so SEA's marker endpoint can post `READY → EXECUTING` while the
        // FillWatcher races to reconcile the fill.
        await notifySubmitted(sent.hash);
        const rec = await sent.wait();
        lastHash = rec?.hash ?? sent.hash;
        executedTxs = 1;
      } else if (Array.isArray(txList) && txList.length > 0) {
        // Multi: secuencial. CMR's FE guard refuses multi-tx Execute, so
        // the callback only fires for the first hash if a non-CMR caller
        // somehow set onSubmitted on a multi-tx plan.
        for (const txd of txList) {
          const sent = await signer.sendTransaction({
            to: txd.to,
            data: txd.data,
            value: BigInt(txd.value ?? "0"),
          });
          await notifySubmitted(sent.hash);
          const rec = await sent.wait();
          lastHash = rec?.hash ?? sent.hash;
          executedTxs++;
        }
      }

      setResult({
        fills: q?.fills?.length ?? 0,
        hasTx: true,
        txHash: lastHash,
        txData: q?.txData as TxData | undefined,
      });
      // Tell the backend about the fills we just settled on-chain so the
      // orderbook / trades / orders reflect reality fast (the watcher would
      // also pick them up, but with a per-tick delay or — for batch txs —
      // not at all). Errors here are surfaced (not swallowed) so the user
      // and the console see the failure instead of a permanently stale UI.
      let applyOk = false;
      try {
        const fillsForApply = Array.isArray(q?.fills)
          ? q!.fills.map((f: any) => ({
              orderHash: String(f.makerOrderHash),
              execBase: String(f.sizeBase), // ya viene en base units del plan
            }))
          : [];

        if (market && fillsForApply.length > 0) {
          const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
          const res = await fetch(`${base}/match/apply`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ marketId: market.symbol, fills: fillsForApply }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            const msg = `/match/apply failed: HTTP ${res.status}${body ? ` — ${body.slice(0, 200)}` : ""}`;
            console.error("[useMarketOrder]", msg);
            toast.error(
              "Trade settled on-chain but the backend did not record it. Refresh in a few seconds; if state is still stale, the on-chain watcher likely missed the fill.",
              { duration: 6000 },
            );
          } else {
            applyOk = true;
          }
        } else {
          // No fills to apply: nothing to call. Treat as ok so we don't double-warn.
          applyOk = true;
        }
      } catch (e) {
        console.error("[useMarketOrder] /match/apply network error:", e);
        toast.error(
          "Could not reach the backend to record the fill. The on-chain watcher may catch up shortly.",
          { duration: 6000 },
        );
      }

      // Refresca UI inmediatamente, y otra vez tras un breve margen para
      // dar tiempo al watcher on-chain (tick ~2 s) a aplicar el fill cuando
      // /match/apply sea no-op (DEV_ONCHAIN_WATCHER=1).
      window.dispatchEvent(new CustomEvent("ste:refresh"));
      if (!applyOk) {
        // Earlier (and longer) catch-up window when /match/apply did not confirm.
        setTimeout(() => window.dispatchEvent(new CustomEvent("ste:refresh")), 1500);
        setTimeout(() => window.dispatchEvent(new CustomEvent("ste:refresh")), 4500);
      } else {
        setTimeout(() => window.dispatchEvent(new CustomEvent("ste:refresh")), 3000);
      }

      // Clear the consumed plan so the user cannot accidentally re-fire the same
      // tx(s) against a now-empty maker order. `result` (with txHash + explorer link)
      // is preserved so the success summary stays visible.
      setQ(null);
      setNeedsApproval(false);
      setNeeded(BigInt(0));
      setTakerToken(null);
      setTakerFee(BigInt(0));
      setFeeRecipient(null);
      setPendingTxData(null);

      toast.success(
        (Array.isArray(txList) && txList.length > 0
          ? "Trade executed (multi-fill)"
          : "Trade executed") + ` · ${chainLabel}`,
        { duration: 3500 },
      );
    } catch (e) {
      // Partial multi-fill: at least one tx already mined on-chain. Refresh the
      // page so orderbook/trades/balances reflect reality, and clear the plan so
      // the user cannot re-fire txs that are already partially consumed. Do NOT
      // populate `result.fills` — we cannot know precisely how many maker fills
      // landed without re-reading on-chain state.
      if (executedTxs > 0) {
        window.dispatchEvent(new CustomEvent("ste:refresh"));
        setQ(null);
        setNeedsApproval(false);
        setNeeded(BigInt(0));
        setTakerToken(null);
        setTakerFee(BigInt(0));
        setFeeRecipient(null);
        setPendingTxData(null);
      }
      const baseMsg = humanizeApiError(e, market, side);
      const nice =
        executedTxs > 0
          ? `${baseMsg} (${executedTxs}/${totalPlannedTxs} transactions confirmed before failure — re-quote before retrying.)`
          : baseMsg;
      setErr(nice);
      toast.error(nice, { duration: 5000 });
    } finally {
      setBusy(false);
    }
  }

  // Preflight gas (opcional)
  async function preflightGas(res: MarketOrderResult | null) {
    try {
      const signer = await getSigner();
      const me = await signer.getAddress();
      const p = signer.provider!;
      const net = await p.getNetwork();
      const bal = await p.getBalance(me);

      const txList = q?.txList as TxData[] | undefined;

      // Single
      if (res?.txData && !txList?.length) {
        const tx = {
          to: res.txData.to,
          data: res.txData.data,
          value: BigInt(res.txData.value ?? "0"),
        };
        const gas = await p.estimateGas({ ...tx, from: me });
        const fee = await p.getFeeData();
        const gasPrice = fee.maxFeePerGas ?? fee.gasPrice ?? BigInt(0);
        const needed = tx.value + gas * gasPrice;

        alert(
          `Red: ${net.chainId}\n` +
            `Balance: ${bal.toString()} wei\n` +
            `Gas limit estimado: ${gas.toString()}\n` +
            `Gas price: ${gasPrice.toString()} wei\n` +
            `ETH requerido total: ${needed.toString()} wei\n` +
            (bal < needed
              ? `❌ Te faltan ${(needed - bal).toString()} wei`
              : "✅ Tienes saldo para gas"),
        );
        return;
      }

      // Multi: sumar estimaciones
      if (Array.isArray(txList) && txList.length > 0) {
        let totalGas = BigInt(0);
        let totalValue = BigInt(0);
        for (const t of txList) {
          const req = {
            to: t.to,
            data: t.data,
            value: BigInt(t.value ?? "0"),
            from: me as `0x${string}`,
          };
          const g = await p.estimateGas(req).catch(() => BigInt(0));
          totalGas += g;
          totalValue += BigInt(t.value ?? "0");
        }
        const fee = await p.getFeeData();
        const gasPrice = fee.maxFeePerGas ?? fee.gasPrice ?? BigInt(0);
        const needed = totalValue + totalGas * gasPrice;

        alert(
          `Red: ${net.chainId}\n` +
            `Balance: ${bal.toString()} wei\n` +
            `Txs: ${txList.length}\n` +
            `Gas total estimado: ${totalGas.toString()}\n` +
            `Gas price: ${gasPrice.toString()} wei\n` +
            `ETH requerido total: ${needed.toString()} wei\n` +
            (bal < needed
              ? `❌ Te faltan ${(needed - bal).toString()} wei`
              : "✅ Tienes saldo para gas"),
        );
        return;
      }

      alert(
        `Sin txData/txList (multi-fill o builder). Red: ${net.chainId} Balance: ${bal.toString()} wei`,
      );
    } catch (e) {
      alert(`Preflight error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function onCheckGas() {
    const txList = q?.txList as TxData[] | undefined;
    if (q?.txData || (Array.isArray(txList) && txList.length > 0)) {
      const tmp: MarketOrderResult = {
        fills: q?.fills?.length ?? 0,
        hasTx: Boolean(q?.txData || txList?.length),
        txData: q?.txData as TxData | undefined,
      };
      await preflightGas(tmp);
      return;
    }
    if (!market) return alert("Selecciona un mercado");
    try {
      const sizeBase = ethers.parseUnits(sizeHuman, market.base.decimals).toString();
      const fresh = (await postMatchQuote({
        marketId: market.symbol,
        side,
        sizeBase,
        ...(tif === "FOK" ? { tif: "FOK" as Tif } : {}),
        ...(limitPriceTicks ? { limitPriceTicks } : {}),
      })) as MatchQuoteWithTx;

      const freshTxList = fresh.txList as TxData[] | undefined;
      const freshHasAnyTx = Boolean(
        fresh.txData || (Array.isArray(freshTxList) && freshTxList.length > 0),
      );

      // Empty book / no-liquidity path: surface a clear human message and
      // do NOT pollute hook state with an empty plan. Mirrors onQuote's
      // messaging so users get the same experience from either entry point.
      if (!freshHasAnyTx) {
        const fillsArr = Array.isArray(fresh?.fills) ? fresh.fills : [];
        const availableBase = fillsArr.reduce((acc, f) => {
          const sv =
            typeof f?.sizeBase === "string"
              ? f.sizeBase
              : String((f as unknown as { sizeBase?: unknown })?.sizeBase ?? "0");
          let v = BigInt(0);
          try {
            v = BigInt(sv);
          } catch {}
          return acc + v;
        }, BigInt(0));
        const requested = (() => {
          try {
            return BigInt(sizeBase);
          } catch {
            return BigInt(0);
          }
        })();

        let msg: string;
        if (availableBase === BigInt(0)) {
          msg = `There’s no liquidity available right now on the other side.`;
        } else if (availableBase < requested) {
          const humanAvail = (() => {
            try {
              return ethers.formatUnits(availableBase, market.base.decimals);
            } catch {
              return availableBase.toString();
            }
          })();
          msg = `There isn’t enough liquidity for that size. Currently available: ${humanAvail} ${market.base.symbol}.`;
        } else {
          msg = "Couldn’t build the transaction for this quote.";
        }
        setErr(msg);
        toast.error(msg, { duration: 4000 });
        return;
      }

      const tmp: MarketOrderResult = {
        fills: fresh.fills?.length ?? 0,
        hasTx: true,
        txData: fresh.txData as TxData | undefined,
      };
      setQ(fresh);
      await preflightGas(tmp);
    } catch (e) {
      const raw = messageFromUnknown(e);
      const lower = raw.toLowerCase();
      if (lower.includes("fok_insufficient_liquidity")) {
        const msg = "FOK rejected: not enough liquidity to fill the whole size.";
        setErr(msg);
        toast.error(msg, { duration: 3000 });
      } else {
        alert(`Preflight error: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  const txList = q?.txList as TxData[] | undefined;
  const hasAnyTx = Boolean(q?.txData || (Array.isArray(txList) && txList.length > 0));

  return {
    // state
    q,
    result,
    err,
    busy,
    needsApproval,
    needed,
    takerToken,
    takerFee,
    feeRecipient,
    // derived
    hasAnyTx,
    txList,
    chainLabel,
    explorerTxBase,
    // actions
    onQuote,
    onApprove,
    onExecute,
    onCheckGas,
    // Phase 5 Part B.2: synchronous read of the latest /match/quote failure
    // classification. Returns null when the last quote succeeded or when no
    // quote has been requested yet.
    getLastQuoteFailureCode: () => lastFailureCodeRef.current,
  };
}
