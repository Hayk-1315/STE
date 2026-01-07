// apps/web/src/components/TokenLogo.tsx
"use client";
import React from "react";

export default function TokenLogo({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const initials = (symbol || "?").slice(0, 3).toUpperCase();
  return (
    <div
      className="rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label={symbol}
      title={symbol}
    >
      {initials}
    </div>
  );
}
