// apps/web/src/lib/seaAi.ts
// Typed client for the SEA AI Assist parse endpoint (POST /sea/ai/parse).
// The backend is the source of truth: it returns an in-band discriminated
// status. This module only transports + types the response. Applying a draft
// fills the existing manual form; it never creates an intent.
import { env } from "./env";
import type { IntentSide, TriggerType, ReferencePriceKind } from "./sea";

export type AiSubMode = "CMR" | "CL";

export type AiSeaParseRequest = {
  marketId: string;
  subMode: AiSubMode;
  text: string;
  sideHint?: IntentSide;
};

export type AiProvenance = { model: string; requestId: string };

export type DraftExplain = {
  meaning: string;
  notGuaranteed: string;
  confirmationRequired: string;
};

export type CmrAiDraft = {
  status: "validDraft";
  subMode: "CMR";
  draft: { side: IntentSide; sizeHuman: string; triggerPriceHuman: string };
  derived: {
    reference: ReferencePriceKind;
    triggerType: TriggerType;
    tif: "FOK";
    executionAuthority: "USER_CONFIRMATION_REQUIRED";
  };
  summary: string;
  explain: DraftExplain;
  notes: string[];
  provenance: AiProvenance;
};

export type ClAiDraft = {
  status: "validDraft";
  subMode: "CL";
  draft: {
    side: IntentSide;
    sizeHuman: string;
    triggerPriceHuman: string;
    limitPriceHuman: string;
  };
  derived: {
    reference: ReferencePriceKind;
    triggerType: TriggerType;
    enforcement: "PASSIVE_ONLY";
    executionAuthority: "PRE_SIGNED_LIMIT_ORDER";
  };
  summary: string;
  explain: DraftExplain;
  notes: string[];
  provenance: AiProvenance;
};

export type ClarificationResponse = {
  status: "needsClarification";
  subMode: AiSubMode;
  kind: "missingFields" | "correction";
  question: string;
  missingFields: string[];
  partialDraft?: Partial<{
    side: IntentSide;
    sizeHuman: string;
    triggerPriceHuman: string;
    limitPriceHuman: string;
  }>;
  hint?: string;
};

export type UnsupportedIntentResponse = {
  status: "unsupportedIntent";
  subMode: AiSubMode;
  reason: string;
  supportedHint: string;
};

export type AiUnavailableResponse = {
  status: "aiUnavailable";
  message: string;
};

export type AiSeaParseResponse =
  | CmrAiDraft
  | ClAiDraft
  | ClarificationResponse
  | UnsupportedIntentResponse
  | AiUnavailableResponse;

export type ValidDraftResponse = CmrAiDraft | ClAiDraft;

/** True when the FE AI Assist flag is on. Build-time inlined NEXT_PUBLIC_*. */
export function isAiAssistEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SEA_AI_ENABLED === "true";
}

export async function parseSeaIntent(req: AiSeaParseRequest): Promise<AiSeaParseResponse> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  const r = await fetch(`${base}/sea/ai/parse`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });
  if (!r.ok) {
    // 400 invalid_payload or a 5xx — surface as a safe unavailable state so the
    // manual form keeps working.
    return {
      status: "aiUnavailable",
      message: "AI assist is unavailable right now. Use the form below.",
    };
  }
  return (await r.json()) as AiSeaParseResponse;
}
