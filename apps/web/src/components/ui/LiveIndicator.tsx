// apps/web/src/components/ui/LiveIndicator.tsx
"use client";
import React from "react";
import { cn } from "@/lib/cn";

/**
 * Live indicator with connection status.
 * status: "connected" | "connecting" | "disconnected"
 */
export default function LiveIndicator({
  status,
  className,
}: {
  status: "connected" | "connecting" | "disconnected";
  className?: string;
}) {
  const label =
    status === "connected"
      ? "Live updating"
      : status === "connecting"
        ? "Connecting…"
        : "Disconnected";
  const color =
    status === "connected"
      ? "text-emerald-400"
      : status === "connecting"
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div className={cn("inline-flex items-center gap-2 text-xs", className)} title={label}>
      <span className={cn("relative inline-flex h-2.5 w-2.5", color)}>
        {/* Ping only when connected */}
        {status === "connected" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30" />
        )}
        <span
          className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color, "bg-current")}
        />
      </span>
      <span className="text-neutral-300">{label}</span>
    </div>
  );
}
