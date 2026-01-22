// apps/web/src/components/ui/Skeleton.tsx
"use client";
import React from "react";
import { cn } from "@/lib/cn";

/** Base skeleton block */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-800/60", className)} />;
}

/** Panel skeleton (card-like) */
export function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4">
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === 0 ? "w-2/5" : i === lines - 1 ? "w-3/5" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

/** Simple table skeleton for orderbook/trades */
export function TableSkeleton({ rows = 8, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {[...Array(rows * cols)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
