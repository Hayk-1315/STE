// apps/api/test/sea/ai/ai-draft.schema.spec.ts
// SEA AI Assist (Phase 1A) — request + model-output schema coverage.
import {
  aiSeaParseRequestSchema,
  rawModelDraftSchema,
} from '../../../src/sea/ai/ai-draft.schema';

describe('aiSeaParseRequestSchema', () => {
  it('accepts a valid CMR request', () => {
    const r = aiSeaParseRequestSchema.safeParse({
      marketId: 'WETH-USDC',
      subMode: 'CMR',
      text: 'Buy 0.2 WETH when best ask is at or below 20 USDC',
    });
    expect(r.success).toBe(true);
  });

  it('accepts an optional sideHint', () => {
    const r = aiSeaParseRequestSchema.safeParse({
      marketId: 'WETH-USDC',
      subMode: 'CL',
      text: 'passive buy',
      sideHint: 'BUY',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a missing text', () => {
    const r = aiSeaParseRequestSchema.safeParse({
      marketId: 'WETH-USDC',
      subMode: 'CMR',
    });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown subMode', () => {
    const r = aiSeaParseRequestSchema.safeParse({
      marketId: 'WETH-USDC',
      subMode: 'MARKET',
      text: 'x',
    });
    expect(r.success).toBe(false);
  });

  it('rejects text over the 2000-char cap', () => {
    const r = aiSeaParseRequestSchema.safeParse({
      marketId: 'WETH-USDC',
      subMode: 'CMR',
      text: 'a'.repeat(2001),
    });
    expect(r.success).toBe(false);
  });
});

describe('rawModelDraftSchema', () => {
  it('accepts a minimal draft', () => {
    const r = rawModelDraftSchema.safeParse({ classification: 'draft' });
    expect(r.success).toBe(true);
  });

  it('accepts a full extraction', () => {
    const r = rawModelDraftSchema.safeParse({
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      limitPriceHuman: '19.8',
      missingFields: [],
      detectedOtherSubmode: false,
    });
    expect(r.success).toBe(true);
  });

  it('STRIPS forbidden execution-critical / prose fields the model must not send', () => {
    const r = rawModelDraftSchema.safeParse({
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      // none of the following may survive parsing:
      reference: 'BEST_ASK',
      triggerType: 'PRICE_BELOW',
      triggerPriceTicks: '2000',
      executionAuthority: 'USER_CONFIRMATION_REQUIRED',
      tif: 'FOK',
      enforcement: 'PASSIVE_ONLY',
      expiry: { atUnix: 123 },
      summary: 'some prose',
      reasoning: 'chain of thought',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      const keys = Object.keys(r.data);
      for (const forbidden of [
        'reference',
        'triggerType',
        'triggerPriceTicks',
        'executionAuthority',
        'tif',
        'enforcement',
        'expiry',
        'summary',
        'reasoning',
      ]) {
        expect(keys).not.toContain(forbidden);
      }
      expect(r.data.classification).toBe('draft');
      expect(r.data.side).toBe('BUY');
    }
  });

  it('rejects a missing classification', () => {
    const r = rawModelDraftSchema.safeParse({ side: 'BUY' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid classification value', () => {
    const r = rawModelDraftSchema.safeParse({ classification: 'maybe' });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown missingFields entry', () => {
    const r = rawModelDraftSchema.safeParse({
      classification: 'needsClarification',
      missingFields: ['rsi'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown unsupportedCategory', () => {
    const r = rawModelDraftSchema.safeParse({
      classification: 'unsupported',
      unsupportedCategory: 'vague_price',
    });
    expect(r.success).toBe(false);
  });
});
