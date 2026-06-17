// apps/web/src/components/ConditionalAiAssist.tsx
"use client";

// Phase 6 (AI Assist): natural-language helper inside the Conditional tab, per
// submode (CMR / CL). The user types an intent; the backend returns a
// deterministically-validated draft (or a clarification / unsupported /
// unavailable status). "Apply to form" only fills the existing manual fields —
// it never creates an intent. The existing Create button remains the only
// create path. The manual form is always usable, including when AI is
// unavailable.

import { useState } from "react";
import { toast } from "sonner";
import type { Market } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { IntentSide } from "@/lib/sea";
import {
  parseSeaIntent,
  type AiProvenance,
  type AiSeaParseResponse,
  type AiSubMode,
} from "@/lib/seaAi";

export type AppliedDraft = {
  /** Submode the draft was applied under; create must still match this. */
  subMode: AiSubMode;
  /** Market symbol the draft was applied under; create must still match this. */
  marketSymbol: string;
  side: IntentSide;
  sizeHuman: string;
  triggerPriceHuman: string;
  limitPriceHuman?: string;
  /** The exact user text, for provenance on create. */
  rawText: string;
  provenance: AiProvenance;
};

type Props = {
  market: Market | null;
  subMode: AiSubMode;
  readOnly: boolean;
  onApplyDraft: (draft: AppliedDraft) => void;
};

const PLACEHOLDER: Record<AiSubMode, string> = {
  CMR: "e.g. Buy 0.2 WETH when best ask is at or below 20 USDC",
  CL: "e.g. When WETH is below 20, place a passive buy limit for 0.2 WETH at 19.8",
};

export default function ConditionalAiAssist({ market, subMode, readOnly, onApplyDraft }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiSeaParseResponse | null>(null);

  // Read-only profiles (Base mainnet) show the card as a product preview but
  // every AI action is disabled and no request is ever sent to /sea/ai/parse.
  const canPreview = Boolean(market && text.trim() && !busy && !readOnly);

  const onPreview = async () => {
    if (!market || !text.trim() || readOnly) return; // never call the API in read-only
    setBusy(true);
    setResult(null);
    try {
      const res = await parseSeaIntent({
        marketId: market.symbol,
        subMode,
        text: text.trim(),
      });
      setResult(res);
    } catch {
      setResult({
        status: "aiUnavailable",
        message: "AI assist is unavailable right now. Use the form below.",
      });
    } finally {
      setBusy(false);
    }
  };

  const onApply = () => {
    if (!result || result.status !== "validDraft") return;
    if (readOnly || !market) return; // read-only: display-only; market always set when rendered
    const base = {
      subMode,
      marketSymbol: market.symbol,
      side: result.draft.side,
      sizeHuman: result.draft.sizeHuman,
      triggerPriceHuman: result.draft.triggerPriceHuman,
      rawText: text.trim(),
      provenance: result.provenance,
    };
    if (result.subMode === "CL") {
      onApplyDraft({ ...base, limitPriceHuman: result.draft.limitPriceHuman });
    } else {
      onApplyDraft(base);
    }
    toast.success("Applied to form", {
      description: "Review the fields and create your intent below.",
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sky-100">AI Assist</span>
        <span className="text-[10px] uppercase tracking-wide text-sky-300/70">beta</span>
      </div>

      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER[subMode]}
        disabled={readOnly}
        className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-900/70 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-400/70 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-neutral-500">
          {readOnly
            ? "Read-only preview — AI Assist is display-only on this profile."
            : "Preview fills the form only. The engine validates everything; you still sign every transaction."}
        </p>
        <Button type="button" size="sm" onClick={() => void onPreview()} disabled={!canPreview}>
          {busy ? "Thinking…" : "Preview intent"}
        </Button>
      </div>

      {result && <AiResultCard result={result} readOnly={readOnly} onApply={onApply} />}
    </div>
  );
}

function AiResultCard({
  result,
  readOnly,
  onApply,
}: {
  result: AiSeaParseResponse;
  readOnly: boolean;
  onApply: () => void;
}) {
  if (result.status === "validDraft") {
    return (
      <div className="space-y-2 rounded-md border border-neutral-700/70 bg-neutral-900/60 p-2.5">
        <p className="text-xs text-neutral-100">{result.summary}</p>

        <dl className="space-y-1 text-[11px] leading-relaxed">
          <ExplainRow label="What this means" value={result.explain.meaning} />
          <ExplainRow label="Not guaranteed" value={result.explain.notGuaranteed} />
          <ExplainRow label="Your confirmation" value={result.explain.confirmationRequired} />
        </dl>

        {result.notes.length > 0 && (
          <ul className="space-y-1">
            {result.notes.map((n, i) => (
              <li
                key={i}
                className="rounded border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[11px] text-amber-100"
              >
                {n}
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={onApply}
          disabled={readOnly}
          title={readOnly ? "Read-only mode: AI Assist is display-only" : undefined}
        >
          Apply to form
        </Button>
      </div>
    );
  }

  if (result.status === "needsClarification") {
    return (
      <div className="space-y-1 rounded-md border border-sky-500/40 bg-sky-500/5 p-2.5">
        <p className="text-xs text-sky-100">{result.question}</p>
        {result.hint && <p className="text-[11px] text-sky-300/80">{result.hint}</p>}
      </div>
    );
  }

  if (result.status === "unsupportedIntent") {
    return (
      <div className="space-y-1 rounded-md border border-neutral-700/70 bg-neutral-900/60 p-2.5">
        <p className="text-xs text-neutral-200">{result.reason}</p>
        <p className="text-[11px] text-neutral-400">{result.supportedHint}</p>
      </div>
    );
  }

  // aiUnavailable
  return (
    <div className="rounded-md border border-neutral-700/70 bg-neutral-900/60 p-2.5">
      <p className="text-xs text-neutral-300">{result.message}</p>
    </div>
  );
}

function ExplainRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex flex-col")}>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-300">{value}</dd>
    </div>
  );
}
