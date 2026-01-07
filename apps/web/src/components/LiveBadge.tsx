// apps/web/src/components/LiveBadge.tsx
"use client";
import React from "react";
import { subscribeWsStatus, type WsStatus } from "@/lib/ws";
import { toast } from "sonner";

export default function LiveBadge() {
  const [st, setSt] = React.useState<WsStatus>("connecting");

  React.useEffect(() => {
    return subscribeWsStatus((s) => {
      setSt(s);
      if (s === "disconnected") toast.warning("WS disconnected");
      if (s === "connected") toast.success("WS connected", { duration: 1500 });
    });
  }, []);

  const dot =
    st === "connected" ? "bg-green-500" : st === "connecting" ? "bg-amber-500" : "bg-red-500";

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
      <span className="text-gray-600">{st}</span>
    </span>
  );
}
