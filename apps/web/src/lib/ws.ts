// apps/web/src/lib/ws.ts
// Purpose: Minimal Socket.IO client + subscriptions for book and orders feeds.

"use client";

import { io, type Socket } from "socket.io-client";
import { env } from "@/lib/env";
import type { OrderbookResponse, OrderbookLevel } from "@/lib/api";

// ---- singleton socket ----
let _socket: Socket | null = null;

function socket(): Socket {
  if (_socket) return _socket;
  const base = env().NEXT_PUBLIC_API_BASE_URL; // e.g., http://localhost:3001
  _socket = io(base, {
    transports: ["websocket"], // prefer ws
    autoConnect: true,
  });
  return _socket;
}

// ---- helpers ----
type Unsubscribe = () => void;

type UnknownRecord = Record<string, unknown>;

export function isOrderEvent(v: unknown): v is { type: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "type" in (v as UnknownRecord) &&
    typeof (v as UnknownRecord).type === "string"
  );
}

function isLevelObject(v: unknown): v is { priceTicks: unknown; sizeBase: unknown } {
  return (
    typeof v === "object" &&
    v !== null &&
    "priceTicks" in (v as UnknownRecord) &&
    "sizeBase" in (v as UnknownRecord)
  );
}

function toStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  return "";
}

function normLevel(v: unknown): OrderbookLevel | null {
  if (Array.isArray(v) && v.length >= 2) {
    return { priceTicks: toStr(v[0]), sizeBase: toStr(v[1]) };
  }
  if (isLevelObject(v)) {
    const o = v;
    return { priceTicks: toStr(o.priceTicks), sizeBase: toStr(o.sizeBase) };
  }
  return null;
}

function normLevels(arr: unknown): OrderbookLevel[] {
  if (!Array.isArray(arr)) return [];
  const out: OrderbookLevel[] = [];
  for (const it of arr) {
    const l = normLevel(it);
    if (l) out.push(l);
  }
  return out;
}

// ---- trades helpers ----
export type TradeWsItem = {
  makerOrderHash: string;
  taker: string;
  priceTicks: string;
  sizeBase: string;
  ts: string;
};

function normTradeItem(v: unknown): TradeWsItem | null {
  if (!v || typeof v !== "object") return null;
  const r = v as UnknownRecord;

  const makerOrderHash = typeof r["makerOrderHash"] === "string" ? r["makerOrderHash"] : "";
  const taker = typeof r["taker"] === "string" ? r["taker"] : "";
  const priceTicks = toStr(r["priceTicks"]);
  const sizeBase = toStr(r["sizeBase"]);

  // normalizamos ts
  const rawTs = r["ts"];
  let ts: string;
  if (typeof rawTs === "string") {
    ts = rawTs;
  } else if (typeof rawTs === "number") {
    ts = new Date(rawTs).toISOString();
  } else if (rawTs && typeof rawTs === "object") {
    const d = rawTs as Date;
    const iso = typeof d.toISOString === "function" ? d.toISOString() : undefined;
    ts = iso ?? new Date().toISOString();
  } else {
    ts = new Date().toISOString();
  }

  if (!makerOrderHash || !priceTicks || !sizeBase) return null;

  return {
    makerOrderHash,
    taker,
    priceTicks,
    sizeBase,
    ts,
  };
}

export function subscribeBook(
  symbol: string,
  onSnapshot: (b: OrderbookResponse) => void,
): Unsubscribe {
  const s = socket();

  // payload fijo para (un)subscribe
  const payload = { symbol };

  // emitir subscribe ahora (si hay socket) y en cada reconexión
  const emitSubscribe = () => s.emit("book:subscribe", payload);
  if (s.connected) emitSubscribe();
  else s.once("connect", emitSubscribe);

  // mantener suscripción cuando el socket se reconecta
  const onReconnect = () => emitSubscribe();
  s.on("connect", onReconnect);

  // normalizador del snapshot
  const handler = (payloadRaw: unknown) => {
    let bids: OrderbookLevel[] = [];
    let asks: OrderbookLevel[] = [];
    let sym = symbol;
    let ts: string | undefined;

    if (payloadRaw && typeof payloadRaw === "object") {
      const r = payloadRaw as Record<string, unknown>;
      if (typeof r["symbol"] === "string") sym = r["symbol"] as string;
      // normaliza ts a ISO string (puede venir como string, number o Date)
      const rawTs = r["ts"];
      if (typeof rawTs === "string") {
        ts = rawTs;
      } else if (typeof rawTs === "number") {
        ts = new Date(rawTs).toISOString();
      } else if (rawTs && typeof rawTs === "object") {
        const d = rawTs as Date;
        const iso = typeof d.toISOString === "function" ? d.toISOString() : undefined;
        if (iso) ts = iso;
      }

      if (Array.isArray(r["bids"]) || Array.isArray(r["asks"])) {
        bids = normLevels(r["bids"]);
        asks = normLevels(r["asks"]);
      } else if (r["l2"] && typeof r["l2"] === "object") {
        const l2 = r["l2"] as Record<string, unknown>;
        bids = normLevels(l2["bids"]);
        asks = normLevels(l2["asks"]);
      }
    }

    onSnapshot({ symbol: sym, bids, asks, ts });
  };

  s.on("book", handler);

  return () => {
    s.off("book", handler);
    s.off("connect", onReconnect);
    s.emit("book:unsubscribe", payload);
  };
}

export function subscribeTrades(
  symbol: string,
  handlers: {
    onInit?: (payload: { symbol: string; items: TradeWsItem[] }) => void;
    onTrade?: (trade: TradeWsItem) => void;
  },
): Unsubscribe {
  const s = socket();
  const payload = { symbol };

  const emitSubscribe = () => {
    s.emit("trades:subscribe", payload);
    console.debug("[WS] trades:subscribe", payload);
  };

  if (s.connected) emitSubscribe();
  else s.once("connect", emitSubscribe);

  const onReconnect = () => emitSubscribe();
  s.on("connect", onReconnect);

  const handleInit = (msg: unknown) => {
    if (!handlers.onInit) return;
    if (!msg || typeof msg !== "object") return;

    const r = msg as UnknownRecord;
    const sym =
      typeof r["symbol"] === "string" && r["symbol"].length > 0 ? (r["symbol"] as string) : symbol;

    const rawItems = Array.isArray(r["items"]) ? (r["items"] as unknown[]) : [];
    const items: TradeWsItem[] = [];
    for (const it of rawItems) {
      const t = normTradeItem(it);
      if (t) items.push(t);
    }

    handlers.onInit({ symbol: sym, items });
  };

  const handleTrade = (msg: unknown) => {
    if (!handlers.onTrade) return;
    const t = normTradeItem(msg);
    if (!t) return;
    handlers.onTrade(t);
  };

  s.on("trades:init", handleInit);
  s.on("trades", handleTrade);

  return () => {
    s.off("trades:init", handleInit);
    s.off("trades", handleTrade);
    s.off("connect", onReconnect);
    s.emit("trades:unsubscribe", payload);
    console.debug("[WS] trades:unsubscribe", payload);
  };
}

// (reservado para la siguiente tanda si quieres eventos de órdenes)
export type OrderEvent =
  | { type: "placed"; orderHash: string; symbol?: string; remainingBase?: string; ts?: string }
  | {
      type: "partial_fill";
      orderHash: string;
      symbol?: string;
      remainingBase?: string;
      ts?: string;
    }
  | { type: "filled"; orderHash: string; symbol?: string; remainingBase?: string; ts?: string }
  | { type: "cancelled"; orderHash: string; symbol?: string; remainingBase?: string; ts?: string }
  | { type: "expired"; orderHash: string; symbol?: string; remainingBase?: string; ts?: string };

export function subscribeOrders(
  address: `0x${string}`,
  onEvt: (e: OrderEvent) => void,
): () => void {
  const s = socket();
  const addrLower = address.toLowerCase() as `0x${string}`;
  const room = `orders:${addrLower}`;

  const handler = (evt: unknown) => {
    const o = evt as Record<string, unknown>;
    if (o && typeof o === "object" && "type" in o && "orderHash" in o) {
      onEvt(o as OrderEvent);
    }
  };

  const join = () => {
    s.emit("orders:subscribe", { address: addrLower });
    // 👇 escuchar SOLO el canal genérico "orders"
    s.on("orders", handler);
    console.debug("[WS] subscribed", room);
  };

  if (s.connected) {
    join();
  } else {
    s.once("connect", join);
  }

  return () => {
    s.emit("orders:unsubscribe", { address: addrLower });
    // 👇 desuscribirse SOLO de "orders"
    s.off("orders", handler);
    console.debug("[WS] unsubscribed", room);
  };
}
// añade al final del archivo (no rompas lo existente)
export type WsStatus = "connecting" | "connected" | "disconnected";

let wsStatus: WsStatus = "connecting";
const statusListeners = new Set<(s: WsStatus) => void>();

function setWsStatus(next: WsStatus) {
  wsStatus = next;
  statusListeners.forEach((fn) => fn(next));
}

export function getWsStatus(): WsStatus {
  return wsStatus;
}

export function subscribeWsStatus(cb: (s: WsStatus) => void): () => void {
  statusListeners.add(cb);
  // emite el estado actual al suscribirse
  cb(wsStatus);
  return () => statusListeners.delete(cb);
}

// engánchate a los eventos del socket (llámalo después de crear socket)
(() => {
  const s = socket();
  s.on("connect", () => setWsStatus("connected"));
  s.on("disconnect", () => setWsStatus("disconnected"));
  if (!s.connected) setWsStatus("connecting");
})();
