"use client";

import React from "react";

export default function AppBackground({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#27374b] text-neutral-50">{children}</div>;
}
