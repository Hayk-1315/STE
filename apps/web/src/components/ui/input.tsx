"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          // Base: tema oscuro, texto siempre visible
          "flex h-9 w-full rounded-md border border-neutral-700 bg-neutral-950/80",
          "px-3 py-2 text-sm text-neutral-100 font-normal",
          "ring-offset-neutral-950 placeholder:text-neutral-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
