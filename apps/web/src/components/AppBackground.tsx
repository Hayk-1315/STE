"use client";

import React from "react";

export default function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-950 to-indigo-950 text-neutral-50 relative overflow-hidden">
      {/* Glows de fondo equilibrados */}
      <div className="pointer-events-none absolute inset-0">
        {/* Arriba-izquierda: un poco más grande y un pelín más intenso */}
        <div className="absolute -top-24 -left-24 h-100 w-100 rounded-full bg-sky-500/10 blur-3xl" />
        {/* Abajo-derecha: algo más pequeño / suave */}
        <div className="absolute bottom-[-140px] right-[-120px] h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Contenido por encima del fondo */}
      <div className="relative">{children}</div>
    </div>
  );
}
