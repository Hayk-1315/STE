// apps/web/src/hooks/useOrderSigning.ts
"use client";

import { useCallback } from "react";
import {
  ethers,
  type TypedDataDomain,
  type TypedDataField,
  TypedDataEncoder,
  recoverAddress,
} from "ethers";
import { env, zeroExEP } from "@/lib/env";
import { useWallet } from "@/providers/wallet";
// ⬇️ añadimos fetchTopOfBook
import { Market, postOrder, fetchTopOfBook } from "@/lib/api";
import { toast } from "sonner";
import { postBuildCancelTx } from "@/lib/api";

const FEE_BPS = Number(process.env.NEXT_PUBLIC_TAKER_FEE_BPS || "0");
const FEE_RECIPIENT = (process.env.NEXT_PUBLIC_TAKER_FEE_RECIPIENT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

type Side = "BUY" | "SELL";

type PlaceParams = {
  market: Market;
  side: Side;
  sizeBaseHuman: string; // e.g., "0.5"
  priceHuman: string; // e.g., "2500" (quote per 1 base)
  expirySec?: number;
  // ⬇️ NUEVO: flag opcional para post-only
  postOnly?: boolean;
};

type LimitOrder = {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  takerTokenFeeAmount: string;
  taker: string;
  maker: string;
  sender: string;
  feeRecipient: string;
  pool: `0x${string}`;
  expiry: string;
  salt: string;
};

type ZeroExDomain = TypedDataDomain & {
  name: "ZeroEx";
  version: "1.0.0";
  chainId: number;
  verifyingContract: `0x${string}`;
};

/** Split 65-byte hex ECDSA signature into tuple, normalizing v to 27/28. */
function splitSigHex(sigHex: string): { v: number; r: `0x${string}`; s: `0x${string}` } {
  const hex = sigHex.startsWith("0x") ? sigHex.slice(2) : sigHex;
  if (hex.length !== 130) throw new Error("invalid signature length");
  const r = `0x${hex.slice(0, 64)}` as `0x${string}`;
  const s = `0x${hex.slice(64, 128)}` as `0x${string}`;
  let v = parseInt(hex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;
  return { v, r, s };
}

const ZERO = "0x0000000000000000000000000000000000000000" as const;
const ZERO32 = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const EIP712_TYPES: Record<string, TypedDataField[]> = {
  LimitOrder: [
    { name: "makerToken", type: "address" },
    { name: "takerToken", type: "address" },
    { name: "makerAmount", type: "uint128" },
    { name: "takerAmount", type: "uint128" },
    { name: "takerTokenFeeAmount", type: "uint128" },
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "sender", type: "address" },
    { name: "feeRecipient", type: "address" },
    { name: "pool", type: "bytes32" },
    { name: "expiry", type: "uint64" },
    { name: "salt", type: "uint256" },
  ],
};

/** Fetch domain (dev helper) from the backend sanity route. */
async function getZeroExDomain(): Promise<ZeroExDomain> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;

  try {
    const r = (await fetch(`${base}/dev/zeroex/sanity`).then((x) => x.json())) as {
      exchangeProxy?: string;
      chainId?: number;
    } | null;

    if (r?.exchangeProxy && r?.chainId) {
      return {
        name: "ZeroEx",
        version: "1.0.0",
        chainId: Number(r.chainId),
        verifyingContract: r.exchangeProxy as `0x${string}`,
      };
    }
  } catch {
    // ignore → fallback below
  }

  return {
    name: "ZeroEx",
    version: "1.0.0",
    chainId: env().NEXT_PUBLIC_CHAIN_ID,
    verifyingContract: zeroExEP(),
  } as const;
}

/** Convert human size/price to amounts in minimal units. */
function computeAmounts(params: PlaceParams, makerAddress: string) {
  const { market, side, sizeBaseHuman, priceHuman } = params;

  const baseDec = market.base.decimals;
  const quoteDec = market.quote.decimals;

  const baseWei = ethers.parseUnits(sizeBaseHuman, baseDec); // bigint
  const priceScaled = ethers.parseUnits(priceHuman, quoteDec); // bigint
  const denom = BigInt(10) ** BigInt(baseDec);
  const quoteWei = (baseWei * priceScaled) / denom;

  if (side === "SELL") {
    // Maker vende BASE, recibe QUOTE
    return {
      makerToken: market.base.address,
      takerToken: market.quote.address,
      makerAmount: baseWei.toString(),
      takerAmount: quoteWei.toString(),
      maker: makerAddress,
    };
  }
  // BUY: Maker ofrece QUOTE para recibir BASE
  return {
    makerToken: market.quote.address,
    takerToken: market.base.address,
    makerAmount: quoteWei.toString(),
    takerAmount: baseWei.toString(),
    maker: makerAddress,
  };
}

/**
 * Calcula priceTicks a partir de priceHuman y priceTickQ,
 * usando la misma relación que el backend:
 * priceTicks = (price * 10^quoteDecimals) / priceTickQ
 */
function computePriceTicks(p: PlaceParams): bigint {
  const { market, priceHuman } = p;
  const quoteDec = market.quote.decimals;
  const priceScaled = ethers.parseUnits(priceHuman, quoteDec); // price * 10^quoteDec
  const tickQ = BigInt(market.rules.priceTickQ);
  if (tickQ <= BigInt(0)) {
    throw new Error("invalid_price_tickQ");
  }
  return priceScaled / tickQ;
}

export function useOrderSigning() {
  const { address, signTypedData, personalSign, getSigner } = useWallet();

  const buildOrder = useCallback(
    async (
      p: PlaceParams,
    ): Promise<{
      domain: ZeroExDomain;
      types: Record<string, TypedDataField[]>;
      order: LimitOrder;
    }> => {
      if (!address) throw new Error("Connect wallet first.");
      const domain = await getZeroExDomain();

      const amounts = computeAmounts(p, address);
      // fee en takerToken (proporcional a takerAmount)
      const takerAmountBig = BigInt(amounts.takerAmount);
      const feeAmtBig =
        FEE_BPS > 0 ? (takerAmountBig * BigInt(FEE_BPS)) / BigInt(10000) : BigInt(0);

      const takerTokenFeeAmount = feeAmtBig.toString();
      const feeRecipient = FEE_BPS > 0 ? FEE_RECIPIENT : ZERO;

      const nowSec = Math.floor(Date.now() / 1000);
      const ttl =
        typeof p.expirySec === "number" && Number.isFinite(p.expirySec) && p.expirySec > 0
          ? p.expirySec
          : 24 * 60 * 60; // por defecto, 24h
      const expirySec = nowSec + ttl;
      // Siempre mayor que 2^128 para no chocar con cancelPair previo
      const SALT_OFFSET = BigInt(1) << BigInt(128); // 2^128
      const nowSec1 = BigInt(Math.floor(Date.now() / 1000));
      const rand96 = BigInt("0x" + ethers.hexlify(ethers.randomBytes(12)).slice(2)); // 96 bits
      // Distribución: [ nowSec:32 | rand96:96 ] + OFFSET → siempre >= 2^128, y además monótono por tiempo
      const saltBig = SALT_OFFSET + (nowSec1 << BigInt(96)) + rand96;
      const salt = saltBig.toString();

      const order: LimitOrder = {
        makerToken: amounts.makerToken,
        takerToken: amounts.takerToken,
        makerAmount: amounts.makerAmount,
        takerAmount: amounts.takerAmount,
        takerTokenFeeAmount,
        taker: ZERO,
        maker: amounts.maker,
        sender: ZERO,
        feeRecipient,
        pool: ZERO32,
        expiry: String(expirySec),
        salt,
      };

      return { domain, types: EIP712_TYPES, order };
    },
    [address],
  );

  const placeLimit = useCallback(
    async (p: PlaceParams) => {
      // ⬇️ PRE-CHEQUEO postOnly en el front: evitamos firmar si seguro cruzaría
      if (p.postOnly) {
        try {
          const pxTicks = computePriceTicks(p);
          const top = await fetchTopOfBook(p.market.symbol);

          const bestBidTicks =
            top.bestBid && top.bestBid.priceTicks != null ? BigInt(top.bestBid.priceTicks) : null;
          const bestAskTicks =
            top.bestAsk && top.bestAsk.priceTicks != null ? BigInt(top.bestAsk.priceTicks) : null;

          const wouldCross =
            p.side === "BUY"
              ? bestAskTicks !== null && pxTicks >= bestAskTicks
              : bestBidTicks !== null && pxTicks <= bestBidTicks;

          if (wouldCross) {
            toast.error("Post-only: this order would cross the current top of book.");
            // No firmamos ni llamamos al backend
            return;
          }
        } catch (e) {
          // Si el pre-check falla (sin top-of-book, etc.), dejamos que el backend decida.
          console.warn("[placeLimit] postOnly pre-check failed, letting backend decide:", e);
        }
      }

      const { domain, types, order } = await buildOrder(p);

      console.info("[sign-limit] will sign", {
        makerFromUI: order.maker,
        chainId: domain.chainId,
        ep: domain.verifyingContract,
      });

      // 1) Intento EIP-712 (v4): firma tipada
      const sig712 = await signTypedData({
        domain,
        types,
        message: order as Record<string, unknown>,
      });

      // Verificación local de la firma tipada (debe recuperar tu address)
      const digest = TypedDataEncoder.hash(
        domain as unknown as TypedDataDomain,
        types as Record<string, TypedDataField[]>,
        order as unknown as Record<string, unknown>,
      );
      console.info("[sign-limit] digest =", digest);
      const recovered712 = recoverAddress(digest, sig712 as `0x${string}`);

      if (address && recovered712.toLowerCase() === address.toLowerCase()) {
        // OK: EIP-712 correcto → enviamos string hex
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = p.postOnly
          ? { order, signature: sig712, postOnly: true }
          : { order, signature: sig712 };
        const res = await postOrder(payload);
        toast.success("Order placed", { description: res.orderHash });
        return res;
      }

      // 2) Fallback controlado: firmar el orderHash con personal_sign (ETHSIGN)
      console.warn("[sign-limit] EIP-712 mismatch; falling back to ETHSIGN");
      const sigEth = await personalSign(digest); // signer.signMessage sobre bytes del hash
      const { v, r, s } = splitSigHex(sigEth);

      // Enviamos tupla con signatureType=ETHSIGN (3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = p.postOnly
        ? { order, signature: { signatureType: 3, v, r, s }, postOnly: true }
        : { order, signature: { signatureType: 3, v, r, s } };
      const res = await postOrder(payload);
      toast.success("Order placed (eth_sign)", { description: res.orderHash });
      return res;
    },
    [buildOrder, signTypedData, personalSign, address],
  );

  // ⬇️ MISMO NOMBRE / MISMA API que usaba tu botón → ahora hace on-chain + off-chain
  const cancelByHash = useCallback(
    async (market: Market, orderHash: string): Promise<{ ok: true }> => {
      if (!address) throw new Error("Connect wallet first.");

      // 1) construir calldata
      const { txData } = await postBuildCancelTx({ marketId: market.symbol, orderHash });

      // 2) enviar tx on-chain
      const signer = await getSigner();
      const txReq = {
        to: txData.to,
        data: txData.data,
        value: txData.value as unknown as bigint, // "0" -> BigNumberish
      };

      const gas = await signer.estimateGas(txReq).catch(() => null);
      const sent = await signer.sendTransaction({ ...txReq, gasLimit: gas ?? undefined });

      toast.message("Cancel submitted", { description: sent.hash });
      await sent.wait();
      toast.success("Cancel confirmed");

      // ⬅️ ya no disparamos /cancel off-chain
      return { ok: true };
    },
    [address, getSigner],
  );

  // (opcional) dejas este helper por si lo llamas en otra parte
  const cancelOnchain = useCallback(
    async (market: Market, orderHash: string) => {
      if (!address) throw new Error("Connect wallet first.");

      const { txData } = await postBuildCancelTx({ marketId: market.symbol, orderHash });

      const signer = await getSigner();
      const txReq = {
        to: txData.to,
        data: txData.data,
        value: txData.value as unknown as bigint, // "0"
      };

      const gas = await signer.estimateGas(txReq).catch(() => null);
      const sent = await signer.sendTransaction({ ...txReq, gasLimit: gas ?? undefined });

      toast.message("Cancel submitted", { description: sent.hash });
      await sent.wait();
      toast.success("Cancel confirmed");
    },
    [address, getSigner],
  );

  return { buildOrder, placeLimit, cancelByHash, cancelOnchain };
}
