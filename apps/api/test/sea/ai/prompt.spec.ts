// apps/api/test/sea/ai/prompt.spec.ts
// SEA AI Assist (Phase 1A) — prompt anchors. Loose substring checks only (no
// exact long-wording assertions) so we catch accidental removal of the key
// guardrails without overfitting.
import { buildSystemPrompt } from '../../../src/sea/ai/prompt';

const INPUT = {
  subMode: 'CMR' as const,
  text: 'irrelevant',
  market: { symbol: 'WETH-USDC', baseSymbol: 'WETH', quoteSymbol: 'USDC' },
};

describe('buildSystemPrompt', () => {
  it('CMR prompt anchors exact-number + cross-submode + unsupported rules + examples', () => {
    const p = buildSystemPrompt(INPUT);
    expect(p.toLowerCase()).toContain('never scale');
    expect(p).toContain('detectedOtherSubmode');
    expect(p.toLowerCase()).toContain('unsupported');
    expect(p).toContain('Examples');
  });

  it('CL prompt references the passive limit price field', () => {
    const p = buildSystemPrompt({ ...INPUT, subMode: 'CL' });
    expect(p.toLowerCase()).toContain('limitpricehuman');
    expect(p).toContain('Examples');
  });
});
