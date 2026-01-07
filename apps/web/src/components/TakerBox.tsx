// apps/web/src/components/TakerBox.tsx
"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import type { Market } from "@/lib/api";
import { postQuote } from "@/lib/api";
import { env } from "@/lib/env";
import { useWallet } from "@/providers/wallet";
import { toast } from "sonner";
import { validateLimitInput } from "@/lib/validation";
import { sanitizeDecimal } from "@/lib/number";
import Segmented from "@/components/ui/Segmented";
import { approveIfNeeded, erc20Allowance } from "@/lib/erc20";
import type { QuoteResponse } from "@/lib/api";

type Props = { market: Market | null };

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

  type TxData = { to: `0x${string}`; data: `0x${string}`; value: string };
  type Result = { fills: number; hasTx: boolean; txHash?: string; txData?: TxData };
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Flujo 3 pasos
  const [q, setQ] = useState<QuoteResponse | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [approving, setApproving] = useState(false);
  const [needed, setNeeded] = useState<bigint>(BigInt(0));
  const [takerToken, setTakerToken] = useState<`0x${string}` | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingTxData, setPendingTxData] = useState<TxData | null>(null);

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

      const qq = await postQuote({ marketId: market.symbol, side, sizeBase: sizeBaseStr });

      // Detecta “éxito sin txData” y muestra aviso claro
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

      if (!qq.txData) {
        // Multi-fill no soportado (builder off) o insuficiente
        if (fillsArr.length > 1) {
          const msg =
            "This size requires filling multiple orders, and the current router doesn’t support multi-fill. Reduce the size.";
          setQ(null);
          setPendingTxData(null);
          setNeedsApproval(false);
          setErr(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }

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

        // (Si llegáramos aquí sería otro motivo de no-txData; por seguridad mostramos genérico)
        const msg = "Couldn’t build the transaction for this quote.";
        setQ(null);
        setPendingTxData(null);
        setNeedsApproval(false);
        setErr(msg);
        toast.error(msg, { duration: 4000 });
        return;
      }

      // Con txData → flujo normal: aprobar si hace falta y permitir Execute
      setQ(qq);

      const fill0 = qq.fills?.[0];
      const token: `0x${string}` =
        fill0?.takerToken && /^0x[0-9a-fA-F]{40}$/.test(fill0.takerToken)
          ? (fill0.takerToken as `0x${string}`)
          : side === "BUY"
            ? (market.quote.address as `0x${string}`)
            : (market.base.address as `0x${string}`);
      setTakerToken(token);

      const amt: bigint =
        typeof fill0?.takerAmount === "string"
          ? BigInt(fill0.takerAmount)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (qq as any).takerAmount
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              BigInt((qq as any).takerAmount as string)
            : BigInt(0);

      if (amt > BigInt(0)) {
        const signer = await getSigner();
        const owner = (await signer.getAddress()) as `0x${string}`;
        const { verifyingContract } = await getZeroExDomainFallback();
        const alw = await erc20Allowance(signer.provider!, token, owner, verifyingContract);
        setNeeded(amt);
        setNeedsApproval(alw < amt);
        setPendingTxData(qq.txData as unknown as TxData);
      } else {
        setNeeded(BigInt(0));
        setNeedsApproval(false);
        setPendingTxData(null);
      }

      toast.success(`Plan ready · fills=${qq.fills?.length ?? 0}`, { duration: 2500 });
    } catch (e) {
      const nice = humanizeApiError(e, market, side);
      setQ(null);
      setPendingTxData(null);
      setNeedsApproval(false);
      setErr(nice);
      toast.error(nice, { duration: 4000 });
    } finally {
      setBusy(false);
    }
  }

  // -------- Paso 2: APPROVE (si hace falta) --------
  async function onApprove() {
    if (!market || !takerToken || !q?.txData || needed <= BigInt(0)) return;
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
    if (!q?.txData) {
      alert("Without txData (multi-fill or builder not implemented)");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const signer = await getSigner();

      if (!market) throw new Error("Market not available");

      const tx = await signer.sendTransaction({
        to: (q.txData as unknown as TxData).to,
        data: (q.txData as unknown as TxData).data,
        value: BigInt((q.txData as unknown as TxData).value ?? "0"),
      });
      const rec = await tx.wait();

      setResult({
        fills: q.fills?.length ?? 0,
        hasTx: true,
        txHash: rec?.hash ?? tx.hash,
        txData: q.txData as unknown as TxData,
      });

      // Refresca UI (el watcher sincroniza el estado)
      window.dispatchEvent(new CustomEvent("ste:refresh"));

      toast.success("Trade executed", { duration: 3500 });
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

      if (!res?.txData) {
        alert(
          `Sin txData (multi-fill o builder). Red: ${net.chainId} Balance: ${bal.toString()} wei`,
        );
        return;
      }
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
    } catch (e) {
      alert(`Preflight error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function onCheckGas() {
    if (q?.txData) {
      const tmp: Result = {
        fills: q.fills?.length ?? 0,
        hasTx: true,
        txData: q.txData as unknown as TxData,
      };
      await preflightGas(tmp);
      return;
    }
    if (!market) return alert("Selecciona un mercado");
    try {
      const sizeBase = ethers.parseUnits(sizeHuman, market.base.decimals).toString();
      const fresh = await postQuote({ marketId: market.symbol, side, sizeBase });
      const tmp: Result = {
        fills: fresh.fills?.length ?? 0,
        hasTx: Boolean(fresh.txData),
        txData: fresh.txData as unknown as TxData,
      };
      await preflightGas(tmp);
    } catch (e) {
      alert(`Preflight error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="rounded-2xl p-4 shadow border space-y-3">
      <h3 className="font-medium">Taker (market)</h3>

      <div className="flex gap-2">
        <Segmented
          value={side}
          onChange={(v) => setSide(v)}
          options={[
            { label: "BUY", value: "BUY" },
            { label: "SELL", value: "SELL" },
          ]}
        />
      </div>

      <label className="block text-sm">Size ({market?.base.symbol})</label>
      <input
        className="w-full border rounded p-2"
        value={sizeHuman}
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        onChange={(e) =>
          setSizeHuman(sanitizeDecimal(e.target.value, market?.base.decimals ?? 18, true))
        }
      />

      {/* Botonera: Quote → Approve → Execute */}
      <div className="grid grid-cols-3 gap-2">
        <button
          disabled={!market || busy}
          onClick={onQuote}
          className="rounded bg-neutral-900 text-white py-2 disabled:opacity-50"
        >
          {busy ? "…" : "Quote"}
        </button>

        <button
          disabled={!q?.txData || !needsApproval || busy}
          onClick={onApprove}
          className="rounded border py-2 disabled:opacity-50"
        >
          {needsApproval ? "Approve" : "Approve"}
        </button>

        <button
          disabled={!q?.txData || needsApproval || busy}
          onClick={onExecute}
          className="rounded bg-green-600 text-white py-2 disabled:opacity-50"
        >
          Execute
        </button>
      </div>

      {/* Hint de estado del quote/allowance */}
      {q?.txData && market && (
        <div className="text-xs text-gray-600">
          {needsApproval ? (
            <>
              Falta approve por{" "}
              <b>
                {ethers.formatUnits(
                  needed,
                  side === "BUY" ? market.quote.decimals : market.base.decimals,
                )}{" "}
                {side === "BUY" ? market.quote.symbol : market.base.symbol}
              </b>
            </>
          ) : (
            "Allowance OK → You can Execute"
          )}
        </div>
      )}

      <button disabled={busy} onClick={onCheckGas} className="w-full rounded border py-2">
        Check Gas / Balance
      </button>

      {err && <div className="rounded bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

      {result && (
        <div className="text-sm">
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
                  className="underline"
                >
                  View on BaseScan
                </a>
              </div>
            </div>
          )}
        </div>
      )}
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
  onPlace: () => Promise<void>;
}) {
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
  const intent = side === "BUY" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return (
    <button
      type="button"
      className={`w-full rounded-md py-2 px-3 ${disabled ? "opacity-50 cursor-not-allowed" : intent}`}
      disabled={disabled}
      onClick={async () => {
        const v = validateLimitInput(market, sizeHuman, priceHuman);
        if (!v.ok) {
          v.errors.forEach((e) => toast.error(e));
          return;
        }
        try {
          await onPlace();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }}
    >
      Place Limit
    </button>
  );
}
