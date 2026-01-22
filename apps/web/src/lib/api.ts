// apps/web/src/lib/api.ts
import { env } from "./env";
// ⬇️ NUEVO: usamos los tipos “nuevos” para la ruta /match/quote con TIF
import type {
  QuoteRequest as MatchQuoteRequest,
  QuoteResponse as MatchQuoteResponse,
} from "./types";

export type TxData = { to: `0x${string}`; data: `0x${string}`; value: string };

// --- helper: top-of-book live para postOnly (1 nivel) ---
export async function fetchTopOfBook(symbol: string): Promise<{
  bestBid?: { priceTicks: string; sizeBase: string };
  bestAsk?: { priceTicks: string; sizeBase: string };
}> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  const r = await fetch(
    `${base}/orderbook?symbol=${encodeURIComponent(symbol)}&depth=1&source=live`,
    { cache: "no-store" },
  );
  if (!r.ok) throw new Error(await r.text());
  const j = (await r.json()) as {
    l2: {
      bids: Array<{ priceTicks: string; sizeBase: string }>;
      asks: Array<{ priceTicks: string; sizeBase: string }>;
    };
  };
  return {
    bestBid: j?.l2?.bids?.[0],
    bestAsk: j?.l2?.asks?.[0],
  };
}

export async function postBuildCancelPairTx(p: {
  makerToken: `0x${string}`;
  takerToken: `0x${string}`;
  minValidSalt: string | number | bigint;
}): Promise<{ ok: true; txData: TxData }> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  const r = await fetch(`${base}/tx/cancelPair`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function postBuildCancelManyTx(
  orderHashes: string[],
): Promise<{ ok: true; txList: TxData[] }> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  const r = await fetch(`${base}/tx/cancelMany`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderHashes }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Build base URL from validated env */
const baseUrl = (): string => env().NEXT_PUBLIC_API_BASE_URL;

/** Basic HTTP wrapper: avoids preflight on GET (no content-type) and returns parsed JSON */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const method = (init?.method ?? "GET").toUpperCase();

  const headers: HeadersInit = { ...(init?.headers ?? {}) };
  if (method !== "GET") {
    // Only set content-type if caller didn't set it and it's not a GET
    const hasCT = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
    if (!hasCT) (headers as Record<string, string>)["content-type"] = "application/json";
  }

  const res = await fetch(url, { ...init, method, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");

    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === "object" && "message" in parsed) {
        const rawMsg = (parsed as any).message;
        const msg = Array.isArray(rawMsg)
          ? rawMsg.join(" | ")
          : typeof rawMsg === "string"
            ? rawMsg
            : String(rawMsg);
        throw new Error(msg);
      }
    } catch {
      // si no es JSON, seguimos con el formato antiguo
    }

    throw new Error(`[api] ${res.status} ${res.statusText} → ${text}`);
  }
  // Parse to unknown first; per-call functions will validate/normalize
  return (await res.json()) as unknown as T;
}

/* =========================
 * Public read: /markets
 * ========================= */

export type TokenInfo = { address: string; symbol: string; decimals: number };

export type Market = {
  id: string;
  symbol: string; // e.g., WETH-USDC
  base: TokenInfo;
  quote: TokenInfo;
  rules: {
    minNotionalQ: string;
    minSizeB: string;
    priceTickQ: string;
  };
};

export async function getMarkets(): Promise<Market[]> {
  // Back-end already returns the correct shape; let it type as Market[]
  return http<Market[]>("/markets");
}

/* =========================
 * Public read: /orderbook
 * ========================= */

export type OrderbookLevel = { priceTicks: string; sizeBase: string; ts?: string };
export type OrderbookResponse = {
  symbol: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  ts?: string;
};

/* ---- Type guards & helpers ---- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function hasProp<T extends string>(v: unknown, prop: T): v is Record<T, unknown> {
  return isRecord(v) && prop in v;
}

function toStringSafe(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  return "";
}

function normalizeLevels(arr: unknown): OrderbookLevel[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((v) => ({
    priceTicks: String((v as any).priceTicks),
    sizeBase: String((v as any).sizeBase),
    ts: (v as any).ts ? String((v as any).ts) : undefined,
  }));
}

/*function normalizeLevels(arr: unknown): OrderbookLevel[] {
  if (!Array.isArray(arr)) return [];
  const out: OrderbookLevel[] = [];
  for (const item of arr) {
    const lvl = normalizeLevel(item);
    if (lvl) out.push(lvl);
  }
  return out;
}*/

export async function getOrderbook(params: {
  symbol: string;
  source?: "live" | "snapshot";
  depth?: number;
}): Promise<OrderbookResponse> {
  const q = new URLSearchParams({ symbol: params.symbol });
  if (params.source) q.set("source", params.source);
  if (params.depth) q.set("depth", String(params.depth));

  // Unknown raw response; normalize safely
  const raw = await http<unknown>(`/orderbook?${q.toString()}`);

  // Form A: { symbol, bids, asks, ts? }
  if (isRecord(raw) && (hasProp(raw, "bids") || hasProp(raw, "asks"))) {
    const bids = hasProp(raw, "bids") ? normalizeLevels(raw["bids"]) : [];
    const asks = hasProp(raw, "asks") ? normalizeLevels(raw["asks"]) : [];
    const symbol = hasProp(raw, "symbol") ? toStringSafe(raw["symbol"]) : params.symbol;
    const ts = hasProp(raw, "ts") ? toStringSafe(raw["ts"]) : undefined;
    return { symbol, bids, asks, ts };
  }

  // Form B: { symbol, l2: { bids, asks }, ts? }
  if (isRecord(raw) && hasProp(raw, "l2") && isRecord(raw["l2"])) {
    const l2 = raw["l2"] as Record<string, unknown>;
    const bids = hasProp(l2, "bids") ? normalizeLevels(l2["bids"]) : [];
    const asks = hasProp(l2, "asks") ? normalizeLevels(l2["asks"]) : [];
    const symbol = hasProp(raw, "symbol") ? toStringSafe(raw["symbol"]) : params.symbol;
    const ts = hasProp(raw, "ts") ? toStringSafe(raw["ts"]) : undefined;
    return { symbol, bids, asks, ts };
  }

  // Fallback: empty book with given symbol
  return { symbol: params.symbol, bids: [], asks: [] };
}

/* =========================
 * Public read: /trades
 * ========================= */

export type TradeItem = { priceTicks: string; sizeBase: string; ts: string };

export async function getTrades(params: {
  symbol: string;
  limit?: number;
}): Promise<{ items: TradeItem[] }> {
  const q = new URLSearchParams({ symbol: params.symbol });
  if (params.limit) q.set("limit", String(params.limit));

  const raw = await http<unknown>(`/trades?${q.toString()}`);

  // Form A: { items: [...] }
  if (isRecord(raw) && hasProp(raw, "items") && Array.isArray(raw["items"])) {
    return {
      items: (raw["items"] as unknown[]).map((t) => ({
        priceTicks: toStringSafe(isRecord(t) ? t["priceTicks"] : undefined),
        sizeBase: toStringSafe(isRecord(t) ? t["sizeBase"] : undefined),
        ts: toStringSafe(isRecord(t) ? t["ts"] : undefined),
      })),
    };
  }

  // Form B: array directo
  if (Array.isArray(raw)) {
    return {
      items: (raw as unknown[]).map((t) => ({
        priceTicks: toStringSafe(isRecord(t) ? t["priceTicks"] : undefined),
        sizeBase: toStringSafe(isRecord(t) ? t["sizeBase"] : undefined),
        ts: toStringSafe(isRecord(t) ? t["ts"] : undefined),
      })),
    };
  }

  // Fallback
  return { items: [] };
}

/* =========================
 * Intake / Cancel / Quote
 * ========================= */

export async function postOrder(
  body: unknown,
): Promise<{ orderHash: string; status?: string; ok?: true }> {
  return http<{ orderHash: string; status?: string; ok?: true }>(`/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function postCancel(body: {
  marketId: string;
  orderHash: string;
  maker: string;
  signature: string;
}): Promise<{ ok: true }> {
  return http<{ ok: true }>(`/cancel`, { method: "POST", body: JSON.stringify(body) });
}

export async function postBuildCancelTx(body: {
  marketId: string;
  orderHash: string;
}): Promise<{ ok: true; txData: { to: `0x${string}`; data: `0x${string}`; value: string } }> {
  return http<{ ok: true; txData: { to: `0x${string}`; data: `0x${string}`; value: string } }>(
    `/tx/cancel`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

// ⬇️ Tipos “antiguos” de quote (los dejo tal cual para no romper nada existente)
export type QuoteRequest = { marketId: string; side: "BUY" | "SELL"; sizeBase: string };
export type QuoteResponse = {
  fills: Array<{
    orderHash: string;
    sizeBase: string;
    priceTicks: string;
    raw?: { order: unknown; signature: string };
    takerToken?: `0x${string}`;
    takerAmount?: string;
    takerFeeAmount?: string;
    takerTotalAmount?: string;
  }>;
  txData?: { to: `0x${string}`; data: `0x${string}`; value: string };
  txlist?: Array<{ to: `0x${string}`; data: `0x${string}`; value: string }>;
  strategy?: "single" | "secuential_fill";
};

export async function postQuote(body: QuoteRequest): Promise<QuoteResponse> {
  return http<QuoteResponse>(`/match/quote`, { method: "POST", body: JSON.stringify(body) });
}

// ⬇️ NUEVO: ruta “moderna” para taker con TIF (IOC / FOK) usando tipos de ./types
export async function postMatchQuote(
  req: MatchQuoteRequest,
): Promise<MatchQuoteResponse & { txData?: TxData }> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  const r = await fetch(`${base}/match/quote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!r.ok) {
    // Propaga el texto tal cual para que el front lo ponga en un toast
    throw new Error(await r.text());
  }
  return (await r.json()) as MatchQuoteResponse & { txData?: TxData };
}

export type OrdersListItem = {
  id: string;
  symbol: string;
  maker: string;
  status: string;
  priceTicks: string;
  sizeBase: string;
  remainingBase: string;
  ts: string;
};
export async function getOrders(params: {
  address: string;
  status?: string;
  symbol?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ items: OrdersListItem[]; nextCursor?: { id: string } }> {
  const q = new URLSearchParams({ address: params.address });
  if (params.status) q.set("status", params.status);
  if (params.symbol) q.set("symbol", params.symbol);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  return http<{ items: OrdersListItem[]; nextCursor?: { id: string } }>(`/orders?${q.toString()}`);
}
