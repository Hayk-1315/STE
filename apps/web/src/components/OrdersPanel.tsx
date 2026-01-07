// apps/web/src/components/OrdersPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { subscribeOrders, type OrderEvent } from "@/lib/ws";
import { useWallet } from "@/providers/wallet";
import { getOrders, type OrdersListItem } from "@/lib/api";
import { SkeletonList } from "./Skeleton";

type Evt =
  | OrderEvent
  | { type: "expired"; orderHash: string; symbol?: string; remainingBase?: string; ts?: string };

// type Evt = OrderEvent;

/** Extensión sólo-UI: nos permite mostrar "expired" sin cambiar el tipo del WS */
type UIEvt = Evt & { label?: "expired" | "cancelled" };

// Mapea el status de la API a los tipos del WS
function mapStatusToEventType(status?: string): Evt["type"] {
  switch ((status ?? "").toUpperCase()) {
    case "PLACED":
      return "placed";
    case "PARTIALLY_FILLED":
    case "PARTIAL_FILL":
    case "PARTIAL":
      return "partial_fill";
    case "FILLED":
      return "filled";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return "placed";
  }
}

export default function OrdersPanel() {
  const { address } = useWallet();
  const [events, setEvents] = useState<UIEvt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    // dedupe por combinación (type, hash, ts) para no repetir
    const dedupe = new Set<string>();
    const keyOf = (e: UIEvt) => `${e.type}:${e.orderHash}`;

    const pushLive = (e: UIEvt) => {
      const k = keyOf(e);
      if (dedupe.has(k)) return;
      dedupe.add(k);
      setEvents((prev) => [e, ...prev].slice(0, 10));
    };

    setLoading(true);

    // 1) hidrata historial desde la API usando el status real
    (async () => {
      try {
        const res = await getOrders({ address, limit: 10 });
        if (cancelled) return;

        const initial: UIEvt[] = (res.items ?? []).map((it: OrdersListItem) => {
          const t = mapStatusToEventType(it.status);
          const isExpired = (it.status ?? "").toUpperCase() === "EXPIRED";
          return {
            type: t,
            orderHash: it.id,
            symbol: it.symbol,
            remainingBase: it.remainingBase,
            ts: it.ts, // viene ISO desde la API
            label: isExpired ? "expired" : t === "cancelled" ? "cancelled" : undefined,
          };
        });

        // seed del dedupe con lo que ya está en pantalla
        initial.forEach((e) => dedupe.add(keyOf(e)));

        // pinta directamente la hidratación (no usamos push en bucle)
        setEvents(initial);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // 2) suscripción live (añade por delante, dedupe activo)
    const unsub = subscribeOrders(address as `0x${string}`, async (evt) => {
      // asegúrate de que tenga un ts para la clave
      const withTs: UIEvt = { ...evt, ts: evt.ts ?? new Date().toISOString() };

      // Si el WS dice "cancelled", comprobamos si en la API ya figura como EXPIRED
      if (withTs.type === "cancelled") {
        try {
          const res = await getOrders({ address, limit: 10 });
          const hit = (res.items ?? []).find(
            (it) => it.id.toLowerCase() === withTs.orderHash.toLowerCase(),
          );
          if (hit && (hit.status ?? "").toUpperCase() === "EXPIRED") {
            withTs.label = "expired";
          } else {
            withTs.label = "cancelled";
          }
        } catch {
          // si falla la consulta, seguimos mostrando "cancelled"
          withTs.label = "cancelled";
        }
      }

      pushLive(withTs);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [address]);

  if (!address) {
    return <div className="rounded-2xl p-4 border">Connect wallet to see your order events.</div>;
  }

  return (
    <div className="rounded-2xl p-4 border space-y-2">
      <h3 className="font-medium">My Orders (live)</h3>
      {loading && <SkeletonList rows={10} />}
      <ul className="text-sm space-y-1">
        {events.length === 0 && !loading ? (
          <li>—</li>
        ) : (
          events.map((e, i) => {
            const ts = (e.ts ?? "").replace("T", " ").replace("Z", "");
            const label = e.label ?? e.type; // mostrará "expired" si lo detectamos
            const color =
              label === "placed"
                ? "text-blue-700"
                : label === "cancelled"
                  ? "text-red-700"
                  : label === "expired"
                    ? "text-amber-700"
                    : "text-green-700"; // partial_fill / filled
            return (
              <li key={`${e.type}:${e.orderHash}:${e.ts ?? i}`} className="grid grid-cols-12 gap-2">
                <span className="col-span-4 font-mono text-xs text-gray-500">{ts || "—"}</span>
                <b className={`col-span-2 ${color}`}>{label}</b>
                <span className="col-span-6 truncate font-mono">{e.orderHash}</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
