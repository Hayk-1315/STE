// apps/web/src/lib/sea.ts
// Typed wrappers around the backend's SEA REST surface plus the canonical
// EIP-191 message builder for CMR ownerAuth. Mirrors the backend exactly so
// the recovered signer matches the owner.
import { env } from "./env";

export type IntentStatus =
  | "DRAFT"
  | "ACTIVE"
  | "TRIGGERED"
  | "READY"
  | "EXECUTING"
  | "PLACED"
  | "EXECUTED"
  | "CANCELLED"
  | "EXPIRED"
  | "REJECTED"
  | "FAILED";

export type IntentType = "CONDITIONAL_LIMIT" | "CONDITIONAL_MARKET_READY";
export type IntentSide = "BUY" | "SELL";
export type TriggerType = "PRICE_BELOW" | "PRICE_ABOVE";
export type ReferencePriceKind = "BEST_BID" | "BEST_ASK" | "MID";

/** Serialized shape returned by GET /sea/intents and GET /sea/intents/:id. */
export type IntentDto = {
  id: string;
  owner: string;
  marketId: string;
  type: IntentType;
  status: IntentStatus;
  side: IntentSide;
  sizeBase: string;
  limitPriceTicks: string | null;
  tif: string | null;
  triggerType: TriggerType;
  triggerReference: ReferencePriceKind;
  triggerPriceTicks: string;
  executionAuthority: string;
  preSignedOrderHash: string | null;
  linkedOrderHash: string | null;
  preparedQuote: unknown | null;
  preparedQuoteAt: string | null;
  cooldownUntilAt: string | null;
  expiresAt: string;
  failureReason: string | null;
  rawText: string | null;
  createdAt: string;
  updatedAt: string;
  // Phase 4.x-b additive fields.
  linkedTxHash?: string | null;
  walletLockUntilAt?: string | null;
};

export type FreshQuoteReason =
  | "intent_not_found"
  | "intent_expired"
  | "ready_ttl_expired"
  | "trigger_no_longer_satisfied"
  | "insufficient_liquidity"
  | "notional_below_min_notional"
  | `intent_not_ready:${IntentStatus}`;

export type FreshQuoteOk = {
  ok: true;
  intent: IntentDto;
  preview: {
    marketId: string;
    symbol: string;
    side: IntentSide;
    requestedBase: string;
    remainingBase: string;
    takerToken: `0x${string}`;
    takerAmount: string;
    takerFeeAmount: string;
    takerTotalAmount: string;
    levelCount: number;
    triggerPriceTicks: string;
  };
  // Phase 4.x-b additive fields. Present only when the row is READY and
  // the server could derive the lockNonce (which requires preparedQuoteAt
  // + a configured SEA_LOCK_NONCE_SECRET).
  lockNonce?: string;
  walletLockProposal?: { walletLockUntilAt: string };
};

export type FreshQuoteFail = { ok: false; reason: FreshQuoteReason };
export type FreshQuoteResult = FreshQuoteOk | FreshQuoteFail;

function baseUrl(): string {
  return env().NEXT_PUBLIC_API_BASE_URL;
}

async function readErr(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return `HTTP ${r.status}`;
  }
}

/* =========================
 * CRUD
 * ========================= */

export async function createIntent(body: unknown): Promise<IntentDto> {
  const r = await fetch(`${baseUrl()}/sea/intents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as IntentDto;
}

export async function getIntents(params: {
  address: string;
  status?: string;
  limit?: number;
}): Promise<IntentDto[]> {
  const q = new URLSearchParams({ address: params.address });
  if (params.status) q.set("status", params.status);
  if (params.limit) q.set("limit", String(params.limit));
  const r = await fetch(`${baseUrl()}/sea/intents?${q.toString()}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as IntentDto[];
}

export async function getIntent(id: string): Promise<IntentDto> {
  const r = await fetch(`${baseUrl()}/sea/intents/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as IntentDto;
}

export async function cancelIntent(id: string, signature: string): Promise<IntentDto> {
  const r = await fetch(`${baseUrl()}/sea/intents/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ signature }),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as IntentDto;
}

/* =========================
 * Phase 5: fresh-quote
 * ========================= */

export async function getFreshQuote(id: string): Promise<FreshQuoteResult> {
  const r = await fetch(`${baseUrl()}/sea/intents/${encodeURIComponent(id)}/fresh-quote`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as FreshQuoteResult;
}

/* =========================
 * CMR ownerAuth canonical message
 * =========================
 * Backend reference: apps/api/src/sea/intent-validator.service.ts
 *   buildCmrOwnerAuthMessage(...)
 * Format (pipe-delimited, no whitespace):
 *   SEA-CMR-INTENT|v=1|chainId=<n>|owner=<lower>|marketId=<m>|side=<S>|
 *   sizeBase=<n>|tif=<T>|trigger=<TYPE>:<REF>:<TICKS>|expiresAtUnix=<n>
 * Defaults: tif defaults to "IOC" when omitted by the user.
 * MUST reproduce backend byte-for-byte or the recovered signer mismatch
 * fires with `owner_auth_signer_mismatch`.
 */
export type CmrOwnerAuthInput = {
  chainId: number;
  owner: string;
  marketId: string;
  side: IntentSide;
  sizeBase: string;
  tif?: "IOC" | "FOK";
  trigger: {
    type: TriggerType;
    reference: ReferencePriceKind;
    priceTicks: string;
  };
  expiresAtUnix: number;
};

export function buildCmrOwnerAuthMessage(p: CmrOwnerAuthInput): string {
  const tif = p.tif ?? "IOC";
  const trig = `${p.trigger.type}:${p.trigger.reference}:${p.trigger.priceTicks}`;
  return [
    "SEA-CMR-INTENT",
    "v=1",
    `chainId=${p.chainId}`,
    `owner=${p.owner.toLowerCase()}`,
    `marketId=${p.marketId}`,
    `side=${p.side}`,
    `sizeBase=${p.sizeBase}`,
    `tif=${tif}`,
    `trigger=${trig}`,
    `expiresAtUnix=${p.expiresAtUnix}`,
  ].join("|");
}

/* =========================
 * Cancel canonical message
 * =========================
 * Mirrors backend buildCancelOwnerAuthMessage:
 *   SEA-CANCEL-INTENT|v=1|chainId=<n>|owner=<lower>|intentId=<id>
 * Bound to owner+intentId so it cannot be reused against a different intent.
 */
export function buildCancelIntentMessage(p: {
  chainId: number;
  owner: string;
  intentId: string;
}): string {
  return [
    "SEA-CANCEL-INTENT",
    "v=1",
    `chainId=${p.chainId}`,
    `owner=${p.owner.toLowerCase()}`,
    `intentId=${p.intentId}`,
  ].join("|");
}

/* =========================
 * Phase 4.x-b: CMR execution-lifecycle flow
 * =========================
 *
 * One EIP-191 popup pre-tx (wallet-lock). The post-tx /executing call uses
 * a bearer executionToken — no second signature.
 *
 * Canonical wallet-lock message (mirror of
 * apps/api/src/sea/intent-validator.service.ts → buildWalletLockOwnerAuthMessage):
 *   sea:wallet-lock|<intentId>|<owner-lower>|<chainId>|<lockNonce>|<walletLockUntilAt-iso>
 */
export function buildWalletLockMessage(p: {
  intentId: string;
  owner: string;
  chainId: number;
  lockNonce: string;
  walletLockUntilAt: string; // ISO 8601 from /fresh-quote.walletLockProposal
}): string {
  return [
    "sea:wallet-lock",
    p.intentId,
    p.owner.toLowerCase(),
    String(p.chainId),
    p.lockNonce,
    p.walletLockUntilAt,
  ].join("|");
}

export type WalletLockResponse = {
  ok: true;
  walletLockUntilAt: string;
  executionToken: string;
};

export async function postIntentWalletLock(
  id: string,
  body: {
    signature: string;
    lockNonce: string;
    walletLockUntilAt: string;
  },
): Promise<WalletLockResponse> {
  const r = await fetch(`${baseUrl()}/sea/intents/${encodeURIComponent(id)}/wallet-lock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ownerAuth: body }),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as WalletLockResponse;
}

export async function postIntentExecuting(
  id: string,
  txHash: string,
  executionToken: string,
): Promise<IntentDto> {
  const r = await fetch(`${baseUrl()}/sea/intents/${encodeURIComponent(id)}/executing`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txHash, executionToken }),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as IntentDto;
}
