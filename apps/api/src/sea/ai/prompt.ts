// apps/api/src/sea/ai/prompt.ts
// System + user prompt builders for the SEA AI extractor. The model is told to
// emit ONLY the restricted JSON of `rawModelDraftSchema` — no prose, no
// execution-critical fields. Deterministic code re-derives and re-validates
// everything, so these instructions are about extraction quality, not trust.
import type { AiIntentParseInput } from './provider/ai-provider.interface';

export function buildSystemPrompt(input: AiIntentParseInput): string {
  const { market, subMode } = input;
  const submodeDesc =
    subMode === 'CMR'
      ? 'CONDITIONAL_MARKET_READY (CMR): watch a price trigger, then the user manually confirms a market order.'
      : 'CONDITIONAL_LIMIT (CL): watch a price trigger, then place a pre-signed passive limit order at a chosen limit price.';

  // Few-shot examples tailored to the active mode. They anchor exact-number
  // extraction (Case 1) and cross-submode detection (Case 2/3) without overfitting
  // to one phrasing.
  const examples =
    subMode === 'CMR'
      ? [
          'Examples (CMR):',
          '- "Buy 0.2 WETH when best ask is at or below 20 USDC" -> {"classification":"draft","side":"BUY","sizeHuman":"0.2","triggerPriceHuman":"20"}',
          '- "Sell 0.1 WETH when best bid is above 30 USDC" -> {"classification":"draft","side":"SELL","sizeHuman":"0.1","triggerPriceHuman":"30"}',
          '- "Put a limit order buying 0.2 WETH at 18 when WETH is below 20" -> {"classification":"needsClarification","side":"BUY","sizeHuman":"0.2","triggerPriceHuman":"20","limitPriceHuman":"18","detectedOtherSubmode":true}',
          '- "Buy WETH when it is cheap" -> {"classification":"needsClarification","side":"BUY","missingFields":["sizeHuman","triggerPriceHuman"]}',
          '- "Buy if RSI is oversold" -> {"classification":"unsupported","unsupportedCategory":"indicator"}',
        ]
      : [
          'Examples (CL):',
          '- "Put a limit order buying 0.2 WETH at 18 when WETH is below 20" -> {"classification":"draft","side":"BUY","sizeHuman":"0.2","triggerPriceHuman":"20","limitPriceHuman":"18"}',
          '- "When WETH is below 20, place a passive buy limit for 0.2 WETH at 18" -> {"classification":"draft","side":"BUY","sizeHuman":"0.2","triggerPriceHuman":"20","limitPriceHuman":"18"}',
          '- "Buy 0.2 WETH when WETH is below 15" -> {"classification":"needsClarification","side":"BUY","sizeHuman":"0.2","triggerPriceHuman":"15","missingFields":["limitPriceHuman"]}',
          '- "Buy if RSI is oversold" -> {"classification":"unsupported","unsupportedCategory":"indicator"}',
        ];

  return [
    'You convert one short trading instruction into a STRICT JSON object. You are an extractor, not an advisor.',
    `Market: ${market.symbol} (base ${market.baseSymbol}, quote ${market.quoteSymbol}). Active mode: ${submodeDesc}`,
    '',
    'Output ONLY a JSON object (no markdown, no commentary) with these keys:',
    '- "classification": "draft" | "needsClarification" | "unsupported"',
    '- "side": "BUY" | "SELL"            (omit if unknown)',
    `- "sizeHuman": string               (amount of ${market.baseSymbol} as a decimal, e.g. "0.2"; omit if not given)`,
    `- "triggerPriceHuman": string       (trigger price in ${market.quoteSymbol} per 1 ${market.baseSymbol}; omit if not given/vague)`,
    subMode === 'CL'
      ? `- "limitPriceHuman": string         (passive limit price in ${market.quoteSymbol}; omit if not given)`
      : `- "limitPriceHuman": string         (ONLY if the text states a limit/passive/rest price; in this CMR mode that is a cross-submode signal — also set detectedOtherSubmode=true; never invent it)`,
    '- "missingFields": string[]         (subset of ["side","sizeHuman","triggerPriceHuman","limitPriceHuman"])',
    '- "unsupportedCategory": "indicator" | "news" | "forecast" | "portfolio_advice" | "other"  (only when classification="unsupported")',
    '- "detectedOtherSubmode": boolean   (true if the text clearly describes the OTHER mode)',
    '',
    'Rules:',
    '- Use the exact decimal number the user wrote. Never scale, convert, multiply, divide, or convert prices to ticks. "20 USDC" -> "20" (never "2000").',
    '- Extract numbers ONLY when the user gives an explicit number. NEVER invent or guess a price or size.',
    '- A vague or direction-only price ("cheap", "expensive", "low", "high", "when it drops", "when it dips", "when it pumps", "when it moons") is NOT a number: set classification="needsClarification" and include "triggerPriceHuman" in missingFields. This is NOT "unsupported".',
    '- Use classification="unsupported" ONLY for non-price/out-of-scope strategies/signals: technical indicators (RSI, moving averages, MACD, Bollinger, etc.), news, forecasts/predictions, portfolio/allocation advice, multi-leg strategies, or time-based schedules. Set the matching unsupportedCategory.',
    '- If the text clearly describes the OTHER submode (a passive/limit/rest price while in CMR, or a market-when-ready execution with no limit price while in CL), set detectedOtherSubmode=true and classification="needsClarification". Do NOT use "unsupported" for other-submode text.',
    '- If required values are present and concrete, use classification="draft".',
    '- If required values are missing/vague, use classification="needsClarification" and list missingFields.',
    '- Do NOT output reference price, trigger direction, ticks, executionAuthority, tif, enforcement, expiry, or any prose/explanation. Those are computed by the backend.',
    '- Respond with the JSON object only.',
    '',
    ...examples,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function buildUserPrompt(input: AiIntentParseInput): string {
  const hint = input.sideHint ? ` (UI side hint: ${input.sideHint})` : '';
  return `Instruction${hint}: ${input.text}`;
}
