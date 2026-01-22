// apps/web/src/components/ui/card.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        // Softer card on dark background + subtle blur; works fine on light too
        "rounded-2xl p-4 border border-neutral-800/60 bg-neutral-900/40",
        "backdrop-blur supports-[backdrop-filter]:bg-neutral-900/30",
        "shadow-sm",
        props.className,
      )}
    />
  );
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mb-2", props.className)} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={cn("font-medium", props.className)} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("", props.className)} />;
}
