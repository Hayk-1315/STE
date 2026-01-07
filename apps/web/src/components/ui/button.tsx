// apps/web/src/components/ui/button.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({ className, variant = "default", size = "md", ...props }: Props) {
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    default: "bg-neutral-900 text-white hover:bg-neutral-800",
    outline: "border hover:bg-black/5",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-black/5",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-8 px-2 rounded-md",
    md: "h-9 px-3 rounded-md",
    lg: "h-10 px-4 rounded-lg",
    icon: "h-9 w-9 rounded-full",
  };

  return (
    <button
      className={cn(
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
