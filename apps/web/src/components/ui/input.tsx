// apps/web/src/components/ui/input.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn("w-full border rounded p-2 bg-white dark:bg-black", className)}
    {...props}
  />
));
Input.displayName = "Input";

export default Input;
