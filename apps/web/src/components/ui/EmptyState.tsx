// apps/web/src/components/ui/EmptyState.tsx
"use client";
import React from "react";
import { cn } from "@/lib/cn";

/**
 * Generic empty state for lists/panels.
 * Usage: <EmptyState title="No orders" subtitle="Place your first order to see it here." />
 */
export default function EmptyState({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800/60 p-8 text-center",
        "bg-neutral-900/30",
        className,
      )}
    >
      <div className="text-sm font-medium text-neutral-200">{title}</div>
      {subtitle && <div className="mt-1 text-xs text-neutral-400">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
