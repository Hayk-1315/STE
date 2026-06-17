// apps/api/src/sea/ai/provider/ai-provider.interface.ts
// Provider boundary for SEA AI Assist. The provider is a structured extractor:
// it turns the user's text into raw JSON, which the parser service then
// validates with `rawModelDraftSchema`. Implementations must never execute,
// sign, or persist anything, and must throw on any failure (missing key,
// network, malformed) so the service can return a safe `aiUnavailable`.

export type AiIntentParseInput = {
  subMode: 'CMR' | 'CL';
  text: string;
  market: { symbol: string; baseSymbol: string; quoteSymbol: string };
  sideHint?: 'BUY' | 'SELL';
};

export interface AiIntentProvider {
  /** Stable provider name for logging (no secrets). */
  readonly name: string;
  /**
   * Returns the model's raw JSON output (unknown — validated by the caller).
   * MUST throw on any error; MUST NOT return prose or partial strings.
   */
  parse(input: AiIntentParseInput): Promise<unknown>;
}

/** Nest DI token for the active provider implementation. */
export const AI_INTENT_PROVIDER = 'AI_INTENT_PROVIDER';
