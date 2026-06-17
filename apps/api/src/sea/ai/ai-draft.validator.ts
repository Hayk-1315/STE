// apps/api/src/sea/ai/ai-draft.validator.ts
// SEA AI Assist (Phase 1A) — deterministic validation of the model's structured
// extraction. This is the source of truth: it derives execution-critical fields,
// re-checks every value against canonical market rules, generates ALL
// user-facing copy, and can only make the model's classification STRICTER.
//
// It never creates or executes anything. A `validDraft` result is only a set of
// human form values + explanatory copy; the user still creates the intent
// through the unchanged signed flow, where the authoritative validator runs.
import type {
  AiProvenance,
  AiSeaParseResponse,
  ClarificationResponse,
  IntentSide,
  RawModelDraft,
  UnsupportedIntentResponse,
} from './ai-draft.schema';
import {
  compareNotionalToMin,
  deriveRefAndType,
  formatAtomic,
  minSizeForNotional,
  normalizeHuman,
  parseHumanAtomic,
  priceScaledToTicks,
} from './intent-rules.util';

export type AiMarketContext = {
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  priceTickQ: bigint;
  minSizeB: bigint;
  minNotionalQ: bigint;
};

export type AiTopOfBook = {
  bestBidTicks: bigint | null;
  bestAskTicks: bigint | null;
};

export type ValidateAiDraftInput = {
  subMode: 'CMR' | 'CL';
  raw: RawModelDraft;
  ctx: AiMarketContext;
  topOfBook: AiTopOfBook;
  provenance: AiProvenance;
};

const SUPPORTED_HINT =
  'Try a price threshold, e.g. "Buy 0.2 WETH when best ask is at or below 20 USDC."';

const UNSUPPORTED_REASON: Record<string, string> = {
  indicator:
    'Technical indicators (RSI, moving averages, and similar) are not supported. I can only trigger on a price threshold against the best bid/ask.',
  news: 'News-driven triggers are not supported. I can only trigger on a price threshold against the best bid/ask.',
  forecast:
    'Price predictions/forecasts are not supported. I can only trigger on a price threshold against the best bid/ask.',
  portfolio_advice:
    'Portfolio or allocation advice is not supported. I can only set a single conditional order on a price threshold.',
  other:
    'That request is outside what I can set up. I can only trigger on a price threshold against the best bid/ask.',
};

function submodeLabel(subMode: 'CMR' | 'CL'): string {
  return subMode === 'CMR'
    ? 'market-when-ready order'
    : 'passive limit on trigger';
}

/* -------------------------------------------------------------------------- */
/* Copy builders (deterministic)                                              */
/* -------------------------------------------------------------------------- */

function refWord(side: IntentSide): string {
  return side === 'BUY' ? 'ask' : 'bid';
}
function dirVerb(side: IntentSide): string {
  return side === 'BUY' ? 'falls to' : 'rises to';
}
function orWord(side: IntentSide): string {
  return side === 'BUY' ? 'or lower' : 'or higher';
}
function verb(side: IntentSide): string {
  return side === 'BUY' ? 'buy' : 'sell';
}

function buildCmrSummary(
  side: IntentSide,
  sizeHuman: string,
  triggerHuman: string,
  ctx: AiMarketContext,
): string {
  return (
    `When the best ${refWord(side)} ${dirVerb(side)} ${triggerHuman} ${ctx.quoteSymbol} ` +
    `${orWord(side)}, prepare a market ${verb(side)} of ${sizeHuman} ${ctx.baseSymbol}. ` +
    `You confirm and sign the transaction yourself when it's ready.`
  );
}

function buildClSummary(
  side: IntentSide,
  sizeHuman: string,
  triggerHuman: string,
  limitHuman: string,
  ctx: AiMarketContext,
): string {
  return (
    `When the best ${refWord(side)} ${dirVerb(side)} ${triggerHuman} ${ctx.quoteSymbol} ` +
    `${orWord(side)}, place your pre-signed passive ${verb(side)} limit of ${sizeHuman} ` +
    `${ctx.baseSymbol} at ${limitHuman} ${ctx.quoteSymbol}. Passive-only: it never crosses ` +
    `and only fills at ${limitHuman} ${ctx.quoteSymbol} or better.`
  );
}

function cmrExplain() {
  return {
    meaning:
      'A conditional market order: the engine watches the price and arms when your trigger is met.',
    notGuaranteed:
      "Hitting the trigger doesn't guarantee execution — enough liquidity must exist at your price when you execute, and the price can move first.",
    confirmationRequired:
      'Yes — you review and sign the transaction in your wallet. Nothing executes automatically.',
  };
}

function clExplain() {
  return {
    meaning:
      'A conditional passive limit: the engine rests your pre-signed limit order only after the trigger is met.',
    notGuaranteed:
      "Placement doesn't guarantee a fill — a passive limit only fills if the market trades into it.",
    confirmationRequired:
      'You pre-sign the limit now; the engine only places it when the trigger fires. No market order is ever sent on your behalf.',
  };
}

/* -------------------------------------------------------------------------- */
/* Issue tracking for clarification                                           */
/* -------------------------------------------------------------------------- */

type FieldName = 'side' | 'sizeHuman' | 'triggerPriceHuman' | 'limitPriceHuman';
type Issue = { field: FieldName; kind: 'missing' | 'invalid'; clause: string };

function clarification(
  subMode: 'CMR' | 'CL',
  issues: Issue[],
  partialDraft: ClarificationResponse['partialDraft'],
  hint?: string,
): ClarificationResponse {
  const invalid = issues.filter((i) => i.kind === 'invalid');
  const missing = issues.filter((i) => i.kind === 'missing');

  const parts: string[] = [];
  if (invalid.length > 0) {
    const joined = joinClauses(invalid.map((i) => i.clause));
    parts.push(`${capitalize(joined)}.`);
  }
  if (missing.length > 0) {
    parts.push(
      `Could you tell me ${joinClauses(missing.map((i) => i.clause))}?`,
    );
  }
  if (parts.length === 0 && hint) {
    parts.push(hint);
  }

  return {
    status: 'needsClarification',
    subMode,
    kind: invalid.length > 0 ? 'correction' : 'missingFields',
    question: parts.join(' ').trim(),
    missingFields: missing.map((i) => i.field),
    ...(partialDraft && Object.keys(partialDraft).length > 0
      ? { partialDraft }
      : {}),
    ...(hint ? { hint } : {}),
  };
}

function joinClauses(clauses: string[]): string {
  if (clauses.length <= 1) return clauses.join('');
  if (clauses.length === 2) return `${clauses[0]} and ${clauses[1]}`;
  return `${clauses.slice(0, -1).join(', ')}, and ${clauses[clauses.length - 1]}`;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/**
 * Cross-submode guidance: the text describes the OTHER submode. We never
 * auto-switch and never change fields — just point the user at the right tab.
 */
function crossSubmodeClarification(
  subMode: 'CMR' | 'CL',
): ClarificationResponse {
  const otherTab =
    subMode === 'CMR' ? 'Passive limit on trigger' : 'Market when ready';
  const otherKind = submodeLabel(subMode === 'CMR' ? 'CL' : 'CMR');
  return {
    status: 'needsClarification',
    subMode,
    kind: 'missingFields',
    question: `This sounds like a ${otherKind}. Switch to the "${otherTab}" tab, or rephrase it as a ${submodeLabel(subMode)}.`,
    missingFields: [],
    hint: `Switch to the "${otherTab}" tab to set this up.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Main validator                                                             */
/* -------------------------------------------------------------------------- */

export function validateAiDraft(
  input: ValidateAiDraftInput,
): AiSeaParseResponse {
  const { subMode, raw, ctx, topOfBook, provenance } = input;

  // (1) Deterministic cross-submode signal: a limit/passive/rest price in CMR
  //     means the text describes a Conditional Limit (CMR has no limit price).
  //     Guide to the CL tab — never accept/apply a limit here. Runs BEFORE the
  //     unsupported branch so other-submode text is guided, not rejected (Case 2).
  if (subMode === 'CMR') {
    const clLimitScaled = parseHumanAtomic(
      raw.limitPriceHuman,
      ctx.quoteDecimals,
    );
    if (clLimitScaled !== null && clLimitScaled > 0n) {
      return crossSubmodeClarification('CMR');
    }
  }

  // (2) Genuinely-unsupported, non-price strategy/signal. Trust the model's
  //     classification only for this narrow, non-price set.
  if (raw.classification === 'unsupported') {
    const category = raw.unsupportedCategory ?? 'other';
    const res: UnsupportedIntentResponse = {
      status: 'unsupportedIntent',
      subMode,
      reason: UNSUPPORTED_REASON[category] ?? UNSUPPORTED_REASON.other,
      supportedHint: SUPPORTED_HINT,
    };
    return res;
  }

  // (3) The model flagged the OTHER submode. We never auto-switch; we ask.
  if (raw.detectedOtherSubmode === true) {
    return crossSubmodeClarification(subMode);
  }

  // (3) Build a draft from extracted fields; re-validate everything.
  const issues: Issue[] = [];
  const partialDraft: ClarificationResponse['partialDraft'] = {};

  // side
  const side = raw.side;
  if (side !== 'BUY' && side !== 'SELL') {
    issues.push({
      field: 'side',
      kind: 'missing',
      clause: 'which side — buy or sell',
    });
  } else {
    partialDraft.side = side;
  }

  // size
  let sizeBase: bigint | null = null;
  let sizeHumanNorm: string | null = null;
  const sizeAtomic = parseHumanAtomic(raw.sizeHuman, ctx.baseDecimals);
  if (sizeAtomic === null || sizeAtomic <= 0n) {
    issues.push({
      field: 'sizeHuman',
      kind: 'missing',
      clause: side
        ? `how much ${ctx.baseSymbol} you want to ${verb(side)}`
        : `how much ${ctx.baseSymbol}`,
    });
  } else if (sizeAtomic < ctx.minSizeB) {
    issues.push({
      field: 'sizeHuman',
      kind: 'invalid',
      clause: `the size must be at least ${formatAtomic(ctx.minSizeB, ctx.baseDecimals)} ${ctx.baseSymbol}`,
    });
  } else {
    sizeBase = sizeAtomic;
    sizeHumanNorm = normalizeHuman(raw.sizeHuman as string, ctx.baseDecimals);
    partialDraft.sizeHuman = sizeHumanNorm;
  }

  // trigger price
  let triggerTicks: bigint | null = null;
  let triggerHumanNorm: string | null = null;
  const triggerScaled = parseHumanAtomic(
    raw.triggerPriceHuman,
    ctx.quoteDecimals,
  );
  if (triggerScaled === null || triggerScaled <= 0n) {
    issues.push({
      field: 'triggerPriceHuman',
      kind: 'missing',
      clause: side
        ? `what best-${refWord(side)} price in ${ctx.quoteSymbol} should trigger the ${verb(side)}`
        : `what trigger price in ${ctx.quoteSymbol} to use`,
    });
  } else {
    const ticks = priceScaledToTicks(triggerScaled, ctx.priceTickQ);
    if (ticks === null) {
      issues.push({
        field: 'triggerPriceHuman',
        kind: 'invalid',
        clause: `the trigger price must be a multiple of ${formatAtomic(ctx.priceTickQ, ctx.quoteDecimals)} ${ctx.quoteSymbol}`,
      });
    } else {
      triggerTicks = ticks;
      triggerHumanNorm = normalizeHuman(
        raw.triggerPriceHuman as string,
        ctx.quoteDecimals,
      );
      partialDraft.triggerPriceHuman = triggerHumanNorm;
    }
  }

  // CL-only: limit price
  let limitTicks: bigint | null = null;
  let limitHumanNorm: string | null = null;
  if (subMode === 'CL') {
    const limitScaled = parseHumanAtomic(
      raw.limitPriceHuman,
      ctx.quoteDecimals,
    );
    if (limitScaled === null || limitScaled <= 0n) {
      issues.push({
        field: 'limitPriceHuman',
        kind: 'missing',
        clause: `what passive limit price in ${ctx.quoteSymbol} to rest at`,
      });
    } else {
      const ticks = priceScaledToTicks(limitScaled, ctx.priceTickQ);
      if (ticks === null) {
        issues.push({
          field: 'limitPriceHuman',
          kind: 'invalid',
          clause: `the limit price must be a multiple of ${formatAtomic(ctx.priceTickQ, ctx.quoteDecimals)} ${ctx.quoteSymbol}`,
        });
      } else {
        limitTicks = ticks;
        limitHumanNorm = normalizeHuman(
          raw.limitPriceHuman as string,
          ctx.quoteDecimals,
        );
        partialDraft.limitPriceHuman = limitHumanNorm;
      }
    }
  }

  // Notional checks (only when the relevant prices + size parsed cleanly).
  const notes: string[] = [];
  if (
    subMode === 'CL' &&
    sizeBase !== null &&
    limitTicks !== null &&
    side !== undefined
  ) {
    const cmp = compareNotionalToMin({
      priceTicks: limitTicks,
      priceTickQ: ctx.priceTickQ,
      sizeBase,
      baseDecimals: ctx.baseDecimals,
      minNotionalQ: ctx.minNotionalQ,
    });
    if (cmp < 0) {
      issues.push({
        field: 'limitPriceHuman',
        kind: 'invalid',
        clause: `this order's value is below the ${formatAtomic(ctx.minNotionalQ, ctx.quoteDecimals)} ${ctx.quoteSymbol} minimum — increase the size or the limit price`,
      });
    }
  }

  if (
    subMode === 'CMR' &&
    sizeBase !== null &&
    triggerTicks !== null &&
    (side === 'BUY' || side === 'SELL')
  ) {
    const cmp = compareNotionalToMin({
      priceTicks: triggerTicks,
      priceTickQ: ctx.priceTickQ,
      sizeBase,
      baseDecimals: ctx.baseDecimals,
      minNotionalQ: ctx.minNotionalQ,
    });
    if (side === 'BUY') {
      // Trigger price is a hard upper bound on the executable notional.
      if (cmp < 0) {
        const minSize = minSizeForNotional({
          priceTicks: triggerTicks,
          priceTickQ: ctx.priceTickQ,
          baseDecimals: ctx.baseDecimals,
          minNotionalQ: ctx.minNotionalQ,
        });
        issues.push({
          field: 'sizeHuman',
          kind: 'invalid',
          clause:
            `at ${triggerHumanNorm} ${ctx.quoteSymbol}, ${sizeHumanNorm} ${ctx.baseSymbol} is below the ` +
            `${formatAtomic(ctx.minNotionalQ, ctx.quoteDecimals)} ${ctx.quoteSymbol} minimum order value — ` +
            `increase the size to at least ${formatAtomic(minSize, ctx.baseDecimals)} ${ctx.baseSymbol} or raise the trigger price`,
        });
      } else if (cmp === 0) {
        notes.push(
          `At the trigger price this is exactly the ${formatAtomic(ctx.minNotionalQ, ctx.quoteDecimals)} ${ctx.quoteSymbol} ` +
            `minimum order value; if the executable price is any lower, the intent may keep waiting.`,
        );
      }
    } else if (cmp < 0) {
      // SELL: trigger price is a lower bound — never provably impossible.
      notes.push(
        `At the trigger price this is below the ${formatAtomic(ctx.minNotionalQ, ctx.quoteDecimals)} ${ctx.quoteSymbol} ` +
          `minimum; it becomes ready only if the bid is high enough to meet the minimum.`,
      );
    }
  }

  if (issues.length > 0) {
    // Case 3: CL text whose ONLY gap is the passive limit price often reads like
    // a market-ready alert. Keep the clarification but add a CMR hint — no fields
    // invented, no auto-switch, CL still requires the limit.
    const clMissingLimitOnly =
      subMode === 'CL' &&
      issues.length === 1 &&
      issues[0].field === 'limitPriceHuman' &&
      issues[0].kind === 'missing';
    const hint = clMissingLimitOnly
      ? 'This sounds like a market-ready alert. Give me the passive limit price to rest at, or switch to "Market when ready".'
      : undefined;
    return clarification(subMode, issues, partialDraft, hint);
  }

  // All required fields present and valid -> validDraft.
  // (Guarded by the checks above; assert the non-null locals.)
  const finalSide = side as IntentSide;
  const { reference, triggerType } = deriveRefAndType(finalSide);
  const sHuman = sizeHumanNorm as string;
  const tHuman = triggerHumanNorm as string;

  // Factual notes from live top-of-book (best-effort; omitted if unavailable).
  addTopOfBookNotes({
    subMode,
    side: finalSide,
    triggerTicks: triggerTicks as bigint,
    limitTicks,
    topOfBook,
    ctx,
    notes,
  });

  if (subMode === 'CMR') {
    return {
      status: 'validDraft',
      subMode: 'CMR',
      draft: { side: finalSide, sizeHuman: sHuman, triggerPriceHuman: tHuman },
      derived: {
        reference,
        triggerType,
        tif: 'FOK',
        executionAuthority: 'USER_CONFIRMATION_REQUIRED',
      },
      summary: buildCmrSummary(finalSide, sHuman, tHuman, ctx),
      explain: cmrExplain(),
      notes: notes.slice(0, 2),
      provenance,
    };
  }

  const lHuman = limitHumanNorm as string;
  return {
    status: 'validDraft',
    subMode: 'CL',
    draft: {
      side: finalSide,
      sizeHuman: sHuman,
      triggerPriceHuman: tHuman,
      limitPriceHuman: lHuman,
    },
    derived: {
      reference,
      triggerType,
      enforcement: 'PASSIVE_ONLY',
      executionAuthority: 'PRE_SIGNED_LIMIT_ORDER',
    },
    summary: buildClSummary(finalSide, sHuman, tHuman, lHuman, ctx),
    explain: clExplain(),
    notes: notes.slice(0, 2),
    provenance,
  };
}

function addTopOfBookNotes(opts: {
  subMode: 'CMR' | 'CL';
  side: IntentSide;
  triggerTicks: bigint;
  limitTicks: bigint | null;
  topOfBook: AiTopOfBook;
  ctx: AiMarketContext;
  notes: string[];
}): void {
  const { subMode, side, triggerTicks, limitTicks, topOfBook, ctx, notes } =
    opts;
  const refTicks =
    side === 'BUY' ? topOfBook.bestAskTicks : topOfBook.bestBidTicks;
  if (refTicks === null) return;

  const refHuman = formatAtomic(refTicks * ctx.priceTickQ, ctx.quoteDecimals);

  // Trigger already satisfied -> would arm immediately.
  const alreadyMet =
    side === 'BUY' ? refTicks <= triggerTicks : refTicks >= triggerTicks;
  if (alreadyMet) {
    notes.push(
      `The trigger is already met (best ${refWord(side)} is ${refHuman} ${ctx.quoteSymbol}); this would arm right away.`,
    );
  }

  // CL crossing: a passive limit that crosses the book would be rejected.
  if (subMode === 'CL' && limitTicks !== null) {
    const crosses =
      side === 'BUY' ? limitTicks >= refTicks : limitTicks <= refTicks;
    if (crosses) {
      notes.push(
        `Your limit currently crosses the book (best ${refWord(side)} ${refHuman} ${ctx.quoteSymbol}), so on fire it would be rejected as passive-only. ` +
          `Use a price ${side === 'BUY' ? 'at or below the best ask' : 'at or above the best bid'} to rest passively.`,
      );
    }
  }
}
