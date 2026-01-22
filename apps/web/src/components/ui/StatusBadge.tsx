import React from "react";

/**
 * Small semantic badge for order status.
 * Usage: <StatusBadge status="partial" />
 */
type OrderStatus = "placed" | "partial" | "filled" | "cancelled" | "expired";

const colorMap: Record<OrderStatus, string> = {
  placed: "bg-neutral-800 text-neutral-100 ring-1 ring-neutral-700",
  partial: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30",
  filled: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30",
  cancelled: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/30",
  expired: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/20",
};

export default function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium";
  return (
    <span className={[base, colorMap[status], className].filter(Boolean).join(" ")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.toUpperCase()}
    </span>
  );
}
