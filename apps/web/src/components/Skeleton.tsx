// apps/web/src/components/Skeleton.tsx
"use client";
import React from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      role="status"
      aria-label="loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity={0.25}
      />
      <path
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-4 w-full rounded bg-gray-200/60 dark:bg-white/10 ${className}`} />;
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-3 items-center">
          <SkeletonLine className="w-24" />
          <SkeletonLine className="w-20" />
          <SkeletonLine className="w-16" />
        </li>
      ))}
    </ul>
  );
}
