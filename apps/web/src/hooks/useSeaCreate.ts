// apps/web/src/hooks/useSeaCreate.ts
// Phase 5: create / cancel SEA intents from the frontend.
//
// CL creation reuses `useOrderSigning().buildOrder(...)` to assemble the same
// 0x v4 LimitOrder struct used by normal limits, then signs and POSTs to
// /sea/intents (NOT /orders). `placeLimit` and the normal Limit flow are
// completely untouched.
//
// CMR creation has no 0x order — only an EIP-191 personal_sign over the
// canonical `SEA-CMR-INTENT|...` message built by lib/sea.buildCmrOwnerAuthMessage.
"use client";

import { useCallback } from "react";
import {
  ethers,
  TypedDataEncoder,
  recoverAddress,
  type TypedDataDomain,
  type TypedDataField,
} from "ethers";
import { toast } from "sonner";
import { useWallet } from "@/providers/wallet";
import type { Market } from "@/lib/api";
import { useOrderSigning } from "./useOrderSigning";
import { env } from "@/lib/env";
import {
  buildCancelIntentMessage,
  buildCmrOwnerAuthMessage,
  cancelIntent,
  createIntent,
  type IntentDto,
  type IntentSide,
  type ReferencePriceKind,
  type TriggerType,
} from "@/lib/sea";

function splitSigHex(sigHex: string): {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
} {
  const hex = sigHex.startsWith("0x") ? sigHex.slice(2) : sigHex;
  if (hex.length !== 130) throw new Error("invalid signature length");
  const r = `0x${hex.slice(0, 64)}` as `0x${string}`;
  const s = `0x${hex.slice(64, 128)}` as `0x${string}`;
  let v = parseInt(hex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;
  return { v, r, s };
}

export type CreateCLParams = {
  market: Market;
  side: IntentSide;
  sizeBaseHuman: string;
  /** Limit price per 1 base, in quote tokens (human). */
  limitPriceHuman: string;
  /** Trigger price per 1 base, in quote tokens (human). */
  triggerPriceHuman: string;
  /** Intent expiry from now, seconds. Defaults 24h. */
  expirySec?: number;
  /** Phase 6 (AI Assist): optional NL text, non-signing provenance only. */
  rawText?: string;
  /** Phase 6 (AI Assist): optional parser metadata, non-signing provenance only. */
  parserMeta?: Record<string, unknown>;
};

export type CreateCMRParams = {
  market: Market;
  side: IntentSide;
  sizeBaseHuman: string;
  /** Trigger price per 1 base, in quote tokens (human). */
  triggerPriceHuman: string;
  /** "IOC" | "FOK". Defaults to "IOC" (matches backend default). */
  tif?: "IOC" | "FOK";
  /** Absolute expiry, unix seconds. Required for CMR per backend invariant. */
  expiresAtUnix: number;
  /** Phase 6 (AI Assist): optional NL text, non-signing provenance only. */
  rawText?: string;
  /** Phase 6 (AI Assist): optional parser metadata, non-signing provenance only. */
  parserMeta?: Record<string, unknown>;
};

function priceHumanToTicks(market: Market, priceHuman: string): bigint {
  const quoteDec = market.quote.decimals;
  const priceScaled = ethers.parseUnits(priceHuman, quoteDec);
  const tickQ = BigInt(market.rules.priceTickQ);
  if (tickQ <= BigInt(0)) throw new Error("invalid_price_tickQ");
  return priceScaled / tickQ;
}

/** Natural CMR/CL combo per Phase 4 restriction. BUY → BEST_ASK, SELL → BEST_BID. */
function naturalRefAndType(side: IntentSide): {
  reference: ReferencePriceKind;
  type: TriggerType;
} {
  return side === "BUY"
    ? { reference: "BEST_ASK", type: "PRICE_BELOW" }
    : { reference: "BEST_BID", type: "PRICE_ABOVE" };
}

export function useSeaCreate() {
  const { address, signTypedData, personalSign, personalSignMessage } = useWallet();
  const { buildOrder } = useOrderSigning();

  /**
   * Build, sign, and POST a Conditional Limit intent.
   * Uses the same 0x v4 LimitOrder shape as normal limits (via buildOrder).
   * The signed order is sent to /sea/intents, NOT /orders.
   */
  const createCL = useCallback(
    async (p: CreateCLParams): Promise<IntentDto> => {
      if (!address) throw new Error("Connect wallet first.");

      // Phase 5 bug-fix (CL expiry mismatch):
      // The validator requires `order.expiry >= intent.expiresAt + SEA_FIRE_EXPIRY_GRACE_SECS`
      // (default 60s). Previously CL passed the same TTL into both the intent
      // (`secsFromActivation`) and the 0x order, leaving zero buffer → the
      // backend rejected with `zeroex_order_expiry_too_close`.
      //
      // Fix: compute `intentExpiresAtUnix` once on the client, send the
      // intent expiry as `{ atUnix }` (deterministic across backend clock
      // drift; CL schema permits both `atUnix` and `secsFromActivation`), and
      // build the 0x order with TTL = intent TTL + a 120s safety buffer. The
      // buffer comfortably absorbs the default 60s grace and reasonable
      // overrides. Front-end cannot read SEA_FIRE_EXPIRY_GRACE_SECS, so the
      // buffer is a conservative constant per spec.
      const nowSec = Math.floor(Date.now() / 1000);
      const intentTtlSec =
        typeof p.expirySec === "number" && p.expirySec > 0 ? p.expirySec : 24 * 60 * 60;
      const intentExpiresAtUnix = nowSec + intentTtlSec;
      const ZEROEX_EXPIRY_BUFFER_SECS = 120;
      const orderTtlSec = intentTtlSec + ZEROEX_EXPIRY_BUFFER_SECS;

      // 1) Build the 0x LimitOrder for the *limit price* (not the trigger).
      //    The pre-signed order lives at the user's chosen passive limit;
      //    the trigger is a separate condition the monitor watches.
      const { domain, types, order } = await buildOrder({
        market: p.market,
        side: p.side,
        sizeBaseHuman: p.sizeBaseHuman,
        priceHuman: p.limitPriceHuman,
        expirySec: orderTtlSec,
      });

      // 2) EIP-712 sign with ETHSIGN fallback (mirrors useOrderSigning.placeLimit).
      const sig712 = await signTypedData({
        domain,
        types,
        message: order as unknown as Record<string, unknown>,
      });
      const digest = TypedDataEncoder.hash(
        domain as unknown as TypedDataDomain,
        types as Record<string, TypedDataField[]>,
        order as unknown as Record<string, unknown>,
      );
      const recovered = recoverAddress(digest, sig712 as `0x${string}`);

      let signaturePayload: unknown;
      if (recovered.toLowerCase() === address.toLowerCase()) {
        signaturePayload = sig712;
      } else {
        // ETHSIGN fallback path: signs the 32-byte EIP-712 digest as a hash,
        // not a UTF-8 message — use the dedicated personalSign(orderHash) helper.
        const sigEth = await personalSign(digest);
        const { v, r, s } = splitSigHex(sigEth);
        signaturePayload = { signatureType: 3, v, r, s };
      }

      // 3) Compute fields for the structured intent.
      const sizeBase = ethers.parseUnits(p.sizeBaseHuman, p.market.base.decimals).toString();
      const limitPriceTicks = priceHumanToTicks(p.market, p.limitPriceHuman).toString();
      const triggerPriceTicks = priceHumanToTicks(p.market, p.triggerPriceHuman).toString();
      const { reference, type: triggerType } = naturalRefAndType(p.side);

      const body = {
        owner: address,
        structuredIntent: {
          version: 1 as const,
          type: "CONDITIONAL_LIMIT" as const,
          marketId: p.market.symbol,
          side: p.side,
          sizeBase,
          limitPriceTicks,
          trigger: {
            type: triggerType,
            reference,
            priceTicks: triggerPriceTicks,
          },
          // Use deterministic absolute expiry. CL schema permits atUnix; the
          // 0x order's expiry computed above is intentExpiresAtUnix + 120s.
          expiry: { atUnix: intentExpiresAtUnix },
          executionAuthority: "PRE_SIGNED_LIMIT_ORDER" as const,
          enforcement: "PASSIVE_ONLY" as const,
        },
        zeroExOrder: order,
        signature: signaturePayload,
        preSignedOrderHash: digest,
        // Phase 6 (AI Assist): optional provenance. Not part of any signed
        // payload (the 0x order signature is unchanged); pure pass-through.
        ...(p.rawText ? { rawText: p.rawText } : {}),
        ...(p.parserMeta ? { parserMeta: p.parserMeta } : {}),
      };

      const intent = await createIntent(body);
      toast.success("Conditional Limit created", {
        description: intent.id,
      });
      return intent;
    },
    [address, buildOrder, signTypedData, personalSign],
  );

  /**
   * Build, sign (EIP-191 only), and POST a Conditional Market Ready intent.
   * No 0x order; ownerAuth.signature is the sole proof of ownership.
   */
  const createCMR = useCallback(
    async (p: CreateCMRParams): Promise<IntentDto> => {
      if (!address) throw new Error("Connect wallet first.");

      const sizeBase = ethers.parseUnits(p.sizeBaseHuman, p.market.base.decimals).toString();
      const triggerPriceTicks = priceHumanToTicks(p.market, p.triggerPriceHuman).toString();
      const tif = p.tif ?? "IOC";
      const { reference, type: triggerType } = naturalRefAndType(p.side);
      const chainId = Number(env().NEXT_PUBLIC_CHAIN_ID);

      // Build the structured intent first; the canonical message is derived
      // from these exact fields, so any mismatch fails the recovered-signer
      // check on the backend.
      const structuredIntent = {
        version: 1 as const,
        type: "CONDITIONAL_MARKET_READY" as const,
        marketId: p.market.symbol,
        side: p.side,
        sizeBase,
        tif,
        trigger: {
          type: triggerType,
          reference,
          priceTicks: triggerPriceTicks,
        },
        expiry: { atUnix: p.expiresAtUnix },
        executionAuthority: "USER_CONFIRMATION_REQUIRED" as const,
      };

      const message = buildCmrOwnerAuthMessage({
        chainId,
        owner: address,
        marketId: p.market.symbol,
        side: p.side,
        sizeBase,
        tif,
        trigger: {
          type: triggerType,
          reference,
          priceTicks: triggerPriceTicks,
        },
        expiresAtUnix: p.expiresAtUnix,
      });

      // Phase 5 bug-fix: CMR ownerAuth is a canonical UTF-8 string
      // ("SEA-CMR-INTENT|..."), not a 0x-prefixed hash. Use the new
      // personalSignMessage helper (arbitrary EIP-191) instead of
      // personalSign which is reserved for ETHSIGN orderHash fallback.
      const signature = await personalSignMessage(message);

      const body = {
        owner: address,
        structuredIntent,
        ownerAuth: { signature },
        // Phase 6 (AI Assist): optional provenance. Not part of the EIP-191
        // canonical message that was signed; pure pass-through.
        ...(p.rawText ? { rawText: p.rawText } : {}),
        ...(p.parserMeta ? { parserMeta: p.parserMeta } : {}),
      };

      const intent = await createIntent(body);
      toast.success("Conditional Market Ready created", {
        description: intent.id,
      });
      return intent;
    },
    [address, personalSignMessage],
  );

  /**
   * Cancel a SEA intent. Personal-signs the canonical cancel message.
   * Backend allows DRAFT / ACTIVE / READY (Phase 5).
   */
  const cancelById = useCallback(
    async (intentId: string): Promise<IntentDto> => {
      if (!address) throw new Error("Connect wallet first.");
      const chainId = Number(env().NEXT_PUBLIC_CHAIN_ID);
      const message = buildCancelIntentMessage({
        chainId,
        owner: address,
        intentId,
      });
      // Phase 5 bug-fix: cancel auth is also a UTF-8 canonical message
      // ("SEA-CANCEL-INTENT|..."), not a hash. Same helper as CMR ownerAuth.
      const signature = await personalSignMessage(message);
      const updated = await cancelIntent(intentId, signature);
      toast.success("Intent cancelled", { description: updated.id });
      return updated;
    },
    [address, personalSignMessage],
  );

  return { createCL, createCMR, cancelById };
}
