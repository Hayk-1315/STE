// apps/web/src/components/ui/card.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        // Card más oscuro por defecto, manteniendo el mismo estilo general
        "rounded-2xl p-4 border border-neutral-700/60 bg-neutral-900/85",
        "backdrop-blur supports-backdrop-filter:bg-neutral-900/70",
        "shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
        props.className,
      )}
    />
  );
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mb-2", props.className)} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={cn("text-sm font-medium tracking-tight text-neutral-100", props.className)}
    />
  );
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("", props.className)} />;
}
