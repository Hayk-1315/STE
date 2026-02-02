// apps/web/src/components/OrdersPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { subscribeOrders, type OrderEvent } from "@/lib/ws";
import { useWallet } from "@/providers/wallet";
import { getOrders, type OrdersListItem } from "@/lib/api";
import { SkeletonList } from "./Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

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
    return (
      <div
        className={cn(
          "rounded-2xl p-4 border text-sm text-neutral-300",
          "border-neutral-800/80 bg-neutral-900/85",
          "backdrop-blur supports-backdrop-filter:bg-neutral-900/70",
          "shadow-sm",
        )}
      >
        Connect wallet to see your order events.
      </div>
    );
  }

  return (
    <Card className="bg-neutral-950 border-neutral-800/80 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-neutral-100">
            My Orders
          </CardTitle>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-emerald-300">
            live
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-500">Latest order events from on-chain watcher.</p>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {loading && <SkeletonList rows={10} />}

        <ul className="space-y-1.5">
          {events.length === 0 && !loading ? (
            <li className="text-xs text-neutral-500">No events yet.</li>
          ) : (
            events.map((e, i) => {
              const ts = (e.ts ?? "").replace("T", " ").replace("Z", "");
              const label = e.label ?? e.type; // "expired", "partial_fill", etc

              const labelClass =
                label === "placed"
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                  : label === "cancelled"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : label === "expired"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"; // filled / partial_fill

              return (
                <li
                  key={`${e.type}:${e.orderHash}:${e.ts ?? i}`}
                  className="grid grid-cols-12 gap-2 rounded-md border border-neutral-800/70 bg-neutral-950/40 px-2 py-1 hover:border-neutral-600/70 transition-colors"
                >
                  <span className="col-span-4 font-mono text-[11px] text-neutral-500">
                    {ts || "—"}
                  </span>

                  <span className="col-span-3 flex items-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${labelClass}`}
                    >
                      {label}
                    </span>
                  </span>

                  <span className="col-span-5 truncate font-mono text-xs text-neutral-200">
                    {e.orderHash}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
