// apps/api/src/sea/ai/ai-draft.schema.ts
// SEA AI Assist (Phase 1A) — restricted request + model-output schemas, plus
// the response union types.
//
// Hard rule: the LLM is a structured EXTRACTOR. Its output is constrained to
// `rawModelDraftSchema` and is NEVER authoritative. Execution-critical fields
// (reference, triggerType, ticks, executionAuthority, tif, enforcement, expiry)
// and all user-facing prose are produced by deterministic code, not the model.
// Unknown keys the model may emit (e.g. a `reference` it was told not to send)
// are stripped by Zod's default object behavior.
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Request                                                                    */
/* -------------------------------------------------------------------------- */

export const aiSeaParseRequestSchema = z.object({
  // Market symbol or id, e.g. "WETH-USDC". Resolved server-side.
  marketId: z.string().min(1).max(64),
  // Fixed by the active Conditional tab. The parser does not switch submodes.
  subMode: z.enum(['CMR', 'CL']),
  text: z.string().min(1).max(2000),
  // UI hint only; never trusted for execution.
  sideHint: z.enum(['BUY', 'SELL']).optional(),
});

export type AiSeaParseRequest = z.infer<typeof aiSeaParseRequestSchema>;

/* -------------------------------------------------------------------------- */
/* Raw model output (restricted extraction)                                   */
/* -------------------------------------------------------------------------- */

export const MISSING_FIELDS = [
  'side',
  'sizeHuman',
  'triggerPriceHuman',
  'limitPriceHuman',
] as const;

// Genuinely-unsupported, non-price categories. A vague/missing PRICE is NOT
// here — that path is `needsClarification` for the number, never unsupported.
export const UNSUPPORTED_CATEGORIES = [
  'indicator',
  'news',
  'forecast',
  'portfolio_advice',
  'other',
] as const;

export const rawModelDraftSchema = z.object({
  classification: z.enum(['draft', 'needsClarification', 'unsupported']),
  side: z.enum(['BUY', 'SELL']).optional(),
  sizeHuman: z.string().max(64).optional(),
  triggerPriceHuman: z.string().max(64).optional(),
  limitPriceHuman: z.string().max(64).optional(),
  missingFields: z.array(z.enum(MISSING_FIELDS)).optional(),
  unsupportedCategory: z.enum(UNSUPPORTED_CATEGORIES).optional(),
  detectedOtherSubmode: z.boolean().optional(),
});

export type RawModelDraft = z.infer<typeof rawModelDraftSchema>;

/* -------------------------------------------------------------------------- */
/* Response union (built entirely by deterministic code)                      */
/* -------------------------------------------------------------------------- */

export type IntentSide = 'BUY' | 'SELL';
export type TriggerType = 'PRICE_BELOW' | 'PRICE_ABOVE';
export type ReferencePriceKind = 'BEST_BID' | 'BEST_ASK';

export type DraftExplain = {
  meaning: string;
  notGuaranteed: string;
  confirmationRequired: string;
};

export type AiProvenance = { model: string; requestId: string };

export type CmrAiDraft = {
  status: 'validDraft';
  subMode: 'CMR';
  draft: {
    side: IntentSide;
    sizeHuman: string;
    triggerPriceHuman: string;
  };
  derived: {
    reference: ReferencePriceKind;
    triggerType: TriggerType;
    tif: 'FOK';
    executionAuthority: 'USER_CONFIRMATION_REQUIRED';
  };
  summary: string;
  explain: DraftExplain;
  notes: string[];
  provenance: AiProvenance;
};

export type ClAiDraft = {
  status: 'validDraft';
  subMode: 'CL';
  draft: {
    side: IntentSide;
    sizeHuman: string;
    triggerPriceHuman: string;
    limitPriceHuman: string;
  };
  derived: {
    reference: ReferencePriceKind;
    triggerType: TriggerType;
    enforcement: 'PASSIVE_ONLY';
    executionAuthority: 'PRE_SIGNED_LIMIT_ORDER';
  };
  summary: string;
  explain: DraftExplain;
  notes: string[];
  provenance: AiProvenance;
};

export type ClarificationResponse = {
  status: 'needsClarification';
  subMode: 'CMR' | 'CL';
  // "correction" = a value was given but is invalid (tick, min size/notional);
  // "missingFields" = a required value is absent/vague.
  kind: 'missingFields' | 'correction';
  question: string; // exactly one, code-templated
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
  status: 'unsupportedIntent';
  subMode: 'CMR' | 'CL';
  reason: string;
  supportedHint: string;
};

export type AiUnavailableResponse = {
  status: 'aiUnavailable';
  message: string;
};

export type AiSeaParseResponse =
  | CmrAiDraft
  | ClAiDraft
  | ClarificationResponse
  | UnsupportedIntentResponse
  | AiUnavailableResponse;
