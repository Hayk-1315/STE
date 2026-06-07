// apps/web/src/components/LimitHints.tsx
"use client";

import React from "react";
import type { Market } from "@/lib/api";
import { ethers } from "ethers";
import { cn } from "@/lib/cn";

// Tipo local (ligero) compatible con tu validateLimitInput()
// Evita depender de un export que no existe ahora en "@/lib/validation"
type LimitValidationLite = {
  ok: boolean;
  errors: string[];
  derived?: {
    baseWei?: string | bigint;
    priceTicks?: string | bigint;
  };
};

function toBig(v: unknown): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string" && v.length) return BigInt(v);
  return BigInt(0);
}

export default function LimitHints({
  market,
  validation,
  tickHuman,
  crossing,
}: {
  market: Market;
  validation: LimitValidationLite;
  tickHuman: string;
  // Optional advisory: whether the entered price crosses the current top-of-book
  // and whether post-only is on. Drives a small chip so the user knows up front
  // that a post-only order will be rejected, or that a non-post-only one will
  // be routed as taker.
  crossing?: { wouldCross: boolean; postOnly: boolean };
}) {
  if (!market) return null;

  const qDec = market.quote.decimals;
  const bDec = market.base.decimals;

  const minSizeHuman = ethers.formatUnits(BigInt(market.rules.minSizeB), bDec);
  const minNotionalHuman = ethers.formatUnits(BigInt(market.rules.minNotionalQ), qDec);

  // Derivados → calcula notional en quote si hay datos
  const baseWei = toBig(validation?.derived?.baseWei);
  const priceTicks = toBig(validation?.derived?.priceTicks);
  const tickQ = BigInt(market.rules.priceTickQ);
  const priceScaled = priceTicks * (tickQ || BigInt(1));

  const notionalHuman =
    baseWei > BigInt(0) && priceScaled > BigInt(0)
      ? ethers.formatUnits((baseWei * priceScaled) / BigInt(10) ** BigInt(bDec), qDec)
      : null;

  // Errores para color de chips
  const errs: string[] = Array.isArray(validation?.errors) ? validation.errors : [];
  const tickBad = errs.some((e) => /tick/i.test(e));
  const minSizeBad = errs.some((e) => /min size/i.test(e));
  const minNotionalBad = errs.some((e) => /notional/i.test(e));

  const Badge = ({ label, bad }: { label: string; bad: boolean }) => (
    <span
      className={cn(
        "inline-block text-[11px] px-2 py-0.5 rounded-full border",
        bad
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700",
      )}
    >
      {label}
    </span>
  );

  return (
    <div className="mt-3 space-y-1 text-[11px]">
      <div className="flex flex-wrap gap-1.5">
        <Badge label={`Tick ${tickHuman} ${market.quote.symbol}`} bad={tickBad} />
        <Badge label={`Min size ≥ ${minSizeHuman} ${market.base.symbol}`} bad={minSizeBad} />
        <Badge
          label={`Min notional ≥ ${minNotionalHuman} ${market.quote.symbol}`}
          bad={minNotionalBad}
        />
        {crossing?.wouldCross && (
          <span
            className={cn(
              "inline-block text-[11px] px-2 py-0.5 rounded-full border",
              crossing.postOnly
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-amber-50 border-amber-200 text-amber-700",
            )}
          >
            {crossing.postOnly
              ? "Crosses book · post-only will reject"
              : "Crosses book · will execute as taker"}
          </span>
        )}
        {!tickBad && !minSizeBad && !minNotionalBad && (
          <span className="flex items-center gap-1 text-emerald-300">
            <span>✓</span>
            <span>Input válido</span>
          </span>
        )}
      </div>

      {notionalHuman && (
        <div className="text-neutral-400">
          Notional ≈ <span className="font-mono">{notionalHuman}</span> {market.quote.symbol}
        </div>
      )}

      {!validation.ok && errs.length > 0 && (
        <ul className="ml-4 list-disc space-y-0.5 text-rose-300">
          {errs.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
