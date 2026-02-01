"use client";

import React from "react";

export default function AppBackground({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-800 text-neutral-50">{children}</div>;
}
