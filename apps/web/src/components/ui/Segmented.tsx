// apps/web/src/components/ui/Segmented.tsx
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
      className={cn("inline-flex rounded-full border bg-white overflow-hidden", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1 text-sm",
              active
                ? "bg-neutral-900 text-white"
                : "bg-white hover:bg-neutral-50 text-neutral-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
