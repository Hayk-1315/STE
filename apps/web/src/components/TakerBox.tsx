// apps/web/src/components/TakerBox.tsx
"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import type { Market } from "@/lib/api";
import { postMatchQuote } from "@/lib/api";
import { env } from "@/lib/env";
import { useWallet } from "@/providers/wallet";
import { toast } from "sonner";
import { validateLimitInput } from "@/lib/validation";
import { sanitizeDecimal } from "@/lib/number";
import Segmented from "@/components/ui/Segmented";
import { approveIfNeeded, erc20Allowance } from "@/lib/erc20";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { QuoteResponse as MatchQuoteResponse, Tif } from "@/lib/types";

type Props = { market: Market | null };

type TxData = { to: `0x${string}`; data: `0x${string}`; value: string };

// Extendemos el tipo de respuesta para incluir txData/txList y campos de fee
type MatchQuoteWithTx = MatchQuoteResponse & {
  txData?: TxData;
  txList?: TxData[];
  takerTotalAmount?: string;
  takerFeeTotal?: string;
  takerFeeRecipient?: string;
  feeRecipient?: string;
};

async function getZeroExDomainFallback() {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  try {
    const r = await fetch(`${base}/dev/zeroex/sanity`, { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as { exchangeProxy?: string; chainId?: number };
      if (j.exchangeProxy && j.chainId) {
        return { chainId: j.chainId, verifyingContract: j.exchangeProxy as `0x${string}` };
      }
    }
  } catch {}
  return {
    chainId: env().NEXT_PUBLIC_CHAIN_ID,
    verifyingContract: "0x0000000000000000000000000000000000000001" as const,
  };
}

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

export default function TakerBox({ market }: Props) {
  const { getSigner } = useWallet();
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [sizeHuman, setSizeHuman] = useState("0.1");
  const [busy, setBusy] = useState(false);
  const [tif, setTif] = useState<Tif>("IOC"); // ⬅️ NUEVO estado TIF

  type Result = { fills: number; hasTx: boolean; txHash?: string; txData?: TxData };
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

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
  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  // Rellena el Taker al pulsar "Take" en el orderbook
  React.useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as
        | { side?: "BUY" | "SELL"; sizeHuman?: string }
        | undefined;
      if (!d) return;
      if (d.side) setSide(d.side);
      if (d.sizeHuman) setSizeHuman(d.sizeHuman);
    };
    window.addEventListener("ste:set-taker", handler as EventListener);
    return () => window.removeEventListener("ste:set-taker", handler as EventListener);
  }, []);

  // -------- Paso 1: QUOTE --------
  async function onQuote() {
    if (!market) return;
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
          return;
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
          return;
        }
        const msg = "Couldn’t build the transaction for this quote.";
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(msg);
        toast.error(msg, { duration: 4000 });
        return;
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

      toast.success(`Plan ready · fills=${qq.fills?.length ?? 0}`, { duration: 2500 });
    } catch (e) {
      const raw = messageFromUnknown(e);
      const lower = raw.toLowerCase();

      // ⬅️ manejo específico FOK
      if (lower.includes("fok_insufficient_liquidity")) {
        const msg = "FOK rejected: not enough liquidity to fill the whole size.";
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(msg);
        toast.error(msg, { duration: 3000 });
      } else {
        const nice = humanizeApiError(e, market, side);
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(nice);
        toast.error(nice, { duration: 4000 });
      }
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
    }
  }

  // -------- Paso 3: EXECUTE --------
  async function onExecute() {
    const txList = q?.txList as TxData[] | undefined;
    const hasAnyTx = Boolean(q?.txData || (Array.isArray(txList) && txList.length > 0));
    if (!hasAnyTx) {
      alert("Without txData/txList (multi-fill builder not available)");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const signer = await getSigner();
      if (!market) throw new Error("Market not available");

      let lastHash: string | undefined;

      if (q?.txData) {
        // Single
        const sent = await signer.sendTransaction({
          to: (q.txData as TxData).to,
          data: (q.txData as TxData).data,
          value: BigInt((q.txData as TxData).value ?? "0"),
        });
        const rec = await sent.wait();
        lastHash = rec?.hash ?? sent.hash;
      } else if (Array.isArray(txList) && txList.length > 0) {
        // Multi: secuencial
        for (const txd of txList) {
          const sent = await signer.sendTransaction({
            to: txd.to,
            data: txd.data,
            value: BigInt(txd.value ?? "0"),
          });
          const rec = await sent.wait();
          lastHash = rec?.hash ?? sent.hash;
        }
      }

      setResult({
        fills: q?.fills?.length ?? 0,
        hasTx: true,
        txHash: lastHash,
        txData: q?.txData as TxData | undefined,
      });

      // Refresca UI
      window.dispatchEvent(new CustomEvent("ste:refresh"));

      toast.success(
        Array.isArray(txList) && txList.length > 0
          ? "Trade executed (multi-fill)"
          : "Trade executed",
        { duration: 3500 },
      );
    } catch (e) {
      const nice = humanizeApiError(e, market, side);
      setErr(nice);
      toast.error(nice, { duration: 4000 });
    } finally {
      setBusy(false);
    }
  }

  // Preflight gas (opcional)
  async function preflightGas(res: Result | null) {
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
      const tmp: Result = {
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
      })) as MatchQuoteWithTx;
      const tmp: Result = {
        fills: fresh.fills?.length ?? 0,
        hasTx: Boolean(fresh.txData || fresh.txList?.length),
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

  // UI
  const txList = q?.txList as TxData[] | undefined;
  const hasAnyTx = Boolean(q?.txData || (Array.isArray(txList) && txList.length > 0));

  return (
    <div className="space-y-4">
      {/* BUY / SELL + pequeño selector de TIF (IOC / FOK) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          value={side}
          onChange={(v) => setSide(v)}
          options={[
            { label: "BUY", value: "BUY" },
            { label: "SELL", value: "SELL" },
          ]}
          className="shadow-sm"
        />
        <select
          className="rounded-full border border-neutral-700 bg-neutral-900/80 px-2 py-1 text-[11px] text-neutral-300 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
          value={tif}
          onChange={(e) => setTif(e.target.value as Tif)}
        >
          <option value="IOC">IOC</option>
          <option value="FOK">FOK</option>
        </select>
      </div>

      {/* Size input, mismo criterio que Maker */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-neutral-300">
          Size ({market?.base.symbol})
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

      {/* Botonera: Quote → Approve → Execute */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <button
          disabled={!market || busy}
          onClick={onQuote}
          className="rounded-md border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 hover:bg-neutral-800/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "…" : "Quote"}
        </button>

        <button
          disabled={!hasAnyTx || !needsApproval || busy}
          onClick={onApprove}
          className="rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-amber-100 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>

        <button
          disabled={!hasAnyTx || needsApproval || busy}
          onClick={onExecute}
          className={cn(
            "rounded-md px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50",
            side === "BUY"
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-rose-600 hover:bg-rose-500",
          )}
        >
          Execute
        </button>
      </div>

      {/* Hint de estado del quote/allowance */}
      {q?.txData && market && (
        <div className="text-xs text-neutral-400">
          {needsApproval ? (
            <>
              Need approval for{" "}
              <b>
                {ethers.formatUnits(
                  needed,
                  side === "BUY" ? market.quote.decimals : market.base.decimals,
                )}{" "}
                {side === "BUY" ? market.quote.symbol : market.base.symbol}
              </b>
              {takerFee > BigInt(0) && (
                <>
                  <br />
                  Includes fee{" "}
                  <b>
                    {ethers.formatUnits(
                      takerFee,
                      side === "BUY" ? market.quote.decimals : market.base.decimals,
                    )}{" "}
                    {side === "BUY" ? market.quote.symbol : market.base.symbol}
                  </b>
                  {feeRecipient && (
                    <>
                      {" "}
                      to <span className="font-mono">{short(feeRecipient)}</span>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-emerald-400">Allowance OK —</span> total spend{" "}
              <b>
                {ethers.formatUnits(
                  needed,
                  side === "BUY" ? market.quote.decimals : market.base.decimals,
                )}{" "}
                {side === "BUY" ? market.quote.symbol : market.base.symbol}
              </b>
              {takerFee > BigInt(0) && (
                <>
                  {" "}
                  (includes fee{" "}
                  {ethers.formatUnits(
                    takerFee,
                    side === "BUY" ? market.quote.decimals : market.base.decimals,
                  )}
                  )
                </>
              )}
            </>
          )}
        </div>
      )}

      <button
        disabled={busy}
        onClick={onCheckGas}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check Gas / Balance
      </button>

      {err && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-200">
          {err}
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
                  href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-sky-300 hover:text-sky-200"
                >
                  View on BaseScan
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="pt-2 mt-1 border-t border-neutral-800/70 text-[12px] leading-snug text-neutral-500">
        Reminder: market takers pay a 1% fee encoded as{" "}
        <span className="font-mono">takerTokenFeeAmount</span>. The fee is charged in the taker
        token and sent to the configured fee recipient. If your trade doesn&apos;t meet the
        platform&apos;s fee policy, execution will be rejected.
      </p>
    </div>
  );
}

export function PlaceLimitButton({
  market,
  side,
  sizeHuman,
  priceHuman,
  onPlace,
}: {
  market: Market | null;
  side: "BUY" | "SELL";
  sizeHuman: string;
  priceHuman: string;
  onPlace: (opts?: { postOnly?: boolean }) => Promise<void>;
}) {
  const [postOnly, setPostOnly] = useState(false);
  if (!market) {
    return (
      <button
        className="w-full rounded-md py-2 px-3 opacity-50 cursor-not-allowed"
        disabled
        type="button"
      >
        Place Limit
      </button>
    );
  }

  const valid = validateLimitInput(market, sizeHuman, priceHuman);
  const disabled = !valid.ok;
  const intent =
    side === "BUY"
      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.35)]"
      : "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.35)]";

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        className={`w-full rounded-lg py-2.5 px-3 text-sm font-semibold tracking-wide transition ${
          disabled ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : intent
        }`}
        disabled={disabled}
        onClick={async () => {
          const v = validateLimitInput(market, sizeHuman, priceHuman);
          if (!v.ok) {
            v.errors.forEach((e) => toast.error(e));
            return;
          }
          try {
            await onPlace({ postOnly });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : String(e));
          }
        }}
      >
        Place Limit
      </button>
      {/* ⬇️ NUEVO: toggle Post only */}
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
      <p className="text-[11px] leading-snug text-neutral-500">
        Reminder: takers pay a fee (1%) encoded in your order (
        <span className="font-mono">takerTokenFeeAmount</span>). The fee is charged in the taker
        token and sent to the configured fee recipient. If your order doesn’t meet the platform’s
        fee policy, it will be rejected.
      </p>
    </div>
  );
}
