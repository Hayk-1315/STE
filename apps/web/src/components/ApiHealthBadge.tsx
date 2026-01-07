// apps/web/src/components/ApiHealthBadge.tsx
"use client";

import React from "react";
import { subscribeWsStatus, type WsStatus } from "@/lib/ws";

export default function ApiHealthBadge() {
  // SSR y primer render en el cliente comparten este valor
  const [status, setStatus] = React.useState<WsStatus>("connecting");

  React.useEffect(() => {
    // actualizamos después del mount → no hay mismatch
    return subscribeWsStatus(setStatus);
  }, []);

  const color =
    status === "connected"
      ? "bg-green-500"
      : status === "disconnected"
        ? "bg-red-500"
        : "bg-yellow-500";

  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} suppressHydrationWarning />;
}
