"use client";

import React from "react";
import { cn } from "@/lib/cn";

type Option<T extends string> = { label: string; value: T };

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const val = String(opt.value).toUpperCase();
        const isBuy = val === "BUY";
        const isSell = val === "SELL";

        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1 text-sm outline-none transition-colors rounded-full",
              "focus-visible:ring-2 focus-visible:ring-sky-300/40 focus-visible:ring-offset-0",
              active
                ? cn(
                    // base activo
                    "border shadow-sm",
                    // según tipo
                    isBuy &&
                      "bg-emerald-600/25 text-emerald-100 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.45)]",
                    isSell &&
                      "bg-rose-600/25 text-rose-100 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.45)]",
                    !isBuy && !isSell && "bg-neutral-800 text-neutral-100 border-neutral-700",
                  )
                : "text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
