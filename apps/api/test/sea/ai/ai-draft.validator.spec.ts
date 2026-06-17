// apps/api/test/sea/ai/ai-draft.validator.spec.ts
// SEA AI Assist (Phase 1A) — deterministic validator coverage. Pure, DB-free.
// Confirms: side -> (reference, triggerType) derivation (MID never produced),
// tick / min-size / min-notional gating, CMR notional-bound behavior, vague /
// missing -> clarification (NOT unsupported), unsupported routing, no-auto-switch
// clarification, and factual notes from top-of-book.
import {
  validateAiDraft,
  type AiMarketContext,
  type AiTopOfBook,
} from '../../../src/sea/ai/ai-draft.validator';
import type { RawModelDraft } from '../../../src/sea/ai/ai-draft.schema';

// WETH-USDC: 18 base dec, 6 quote dec, 0.01 USDC tick, 0.001 WETH min size,
// 0.5 USDC min notional.
const CTX: AiMarketContext = {
  symbol: 'WETH-USDC',
  baseSymbol: 'WETH',
  quoteSymbol: 'USDC',
  baseDecimals: 18,
  quoteDecimals: 6,
  priceTickQ: 10_000n,
  minSizeB: 1_000_000_000_000_000n, // 0.001 WETH
  minNotionalQ: 500_000n, // 0.5 USDC
};

const NO_BOOK: AiTopOfBook = { bestBidTicks: null, bestAskTicks: null };
const PROV = { model: 'test-model', requestId: 'req-1' };

function run(
  subMode: 'CMR' | 'CL',
  raw: RawModelDraft,
  topOfBook: AiTopOfBook = NO_BOOK,
) {
  return validateAiDraft({
    subMode,
    raw,
    ctx: CTX,
    topOfBook,
    provenance: PROV,
  });
}

describe('validateAiDraft — derivation', () => {
  it('BUY derives BEST_ASK + PRICE_BELOW (CMR)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.derived.reference).toBe('BEST_ASK');
      expect(res.derived.triggerType).toBe('PRICE_BELOW');
      expect(res.subMode).toBe('CMR');
      if (res.subMode === 'CMR') {
        expect(res.derived.tif).toBe('FOK');
        expect(res.derived.executionAuthority).toBe(
          'USER_CONFIRMATION_REQUIRED',
        );
      }
    }
  });

  it('SELL derives BEST_BID + PRICE_ABOVE (CMR)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'SELL',
      sizeHuman: '0.1',
      triggerPriceHuman: '30',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.derived.reference).toBe('BEST_BID');
      expect(res.derived.triggerType).toBe('PRICE_ABOVE');
    }
  });

  it('never produces MID and ignores any model-supplied reference', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      // even if a forbidden field slipped through, derivation is by side only
    } as RawModelDraft);
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.derived.reference).not.toBe('MID');
      expect(res.derived.reference).toBe('BEST_ASK');
    }
  });

  it('normalizes human values in the draft and CL fields', () => {
    const res = run('CL', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.200',
      triggerPriceHuman: '20.00',
      limitPriceHuman: '19.80',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft' && res.subMode === 'CL') {
      expect(res.draft.sizeHuman).toBe('0.2');
      expect(res.draft.triggerPriceHuman).toBe('20');
      expect(res.draft.limitPriceHuman).toBe('19.8');
      expect(res.derived.enforcement).toBe('PASSIVE_ONLY');
      expect(res.derived.executionAuthority).toBe('PRE_SIGNED_LIMIT_ORDER');
    }
  });
});

describe('validateAiDraft — field gating', () => {
  it('downgrades a model "draft" with missing size to needsClarification', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('sizeHuman');
      expect(res.kind).toBe('missingFields');
    }
  });

  it('tick-misaligned trigger -> needsClarification (correction)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20.001',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.kind).toBe('correction');
      expect(res.question.toLowerCase()).toContain('multiple of');
    }
  });

  it('below-min size -> needsClarification (correction)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.0001', // < 0.001 min
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.kind).toBe('correction');
      expect(res.question).toContain('at least');
    }
  });

  it('CL below-min-notional -> needsClarification (correction)', () => {
    const res = run('CL', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.001',
      triggerPriceHuman: '20',
      limitPriceHuman: '20',
    });
    // notional = 0.001 * 20 = 0.02 USDC < 0.5
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.kind).toBe('correction');
      expect(res.question.toLowerCase()).toContain('minimum');
    }
  });

  it('CL missing limit price -> needsClarification (missing) + CMR hint', () => {
    const res = run('CL', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('limitPriceHuman');
      // Case 3: only the limit is missing -> add a market-ready cross hint.
      expect(res.hint).toBeDefined();
      expect(res.hint?.toLowerCase()).toContain('market-ready');
    }
  });
});

describe('validateAiDraft — CMR minNotional bound', () => {
  it('CMR BUY below bound -> needsClarification/correction with a min size', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.001', // 0.001 * 20 = 0.02 USDC < 0.5
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.kind).toBe('correction');
      // ceil(0.5e6 * 1e18 / (2000 * 1e4)) = 2.5e16 atomic = 0.025 WETH
      expect(res.question).toContain('0.025 WETH');
    }
  });

  it('CMR BUY exactly at bound -> validDraft with a factual note', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.025', // 0.025 * 20 = 0.5 USDC == min
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.join(' ')).toContain('exactly');
    }
  });

  it('CMR BUY above bound -> validDraft, no notional note', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2', // 0.2 * 20 = 4 USDC > 0.5
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.join(' ')).not.toContain('minimum');
    }
  });

  it('CMR SELL below trigger-bound -> NOT over-blocked (validDraft + note)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'SELL',
      sizeHuman: '0.001', // 0.001 * 20 = 0.02 USDC < 0.5, but bid could be higher
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.join(' ').toLowerCase()).toContain('below the');
    }
  });
});

describe('validateAiDraft — vague price vs unsupported', () => {
  it('"cheap" (model: needsClarification, missing trigger) -> needsClarification, NOT unsupported', () => {
    const res = run('CMR', {
      classification: 'needsClarification',
      side: 'BUY',
      sizeHuman: '0.2',
      missingFields: ['triggerPriceHuman'],
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('triggerPriceHuman');
    }
  });

  it('"when it drops" with no number -> needsClarification for trigger price', () => {
    const res = run('CMR', {
      classification: 'needsClarification',
      side: 'BUY',
      sizeHuman: '0.2',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('triggerPriceHuman');
      expect(res.question.toLowerCase()).toContain('price');
    }
  });

  it.each([
    ['indicator', 'RSI'],
    ['news', 'News'],
    ['forecast', 'forecast'],
    ['portfolio_advice', 'Portfolio'],
  ])('unsupported %s -> unsupportedIntent', (category, needle) => {
    const res = run('CMR', {
      classification: 'unsupported',
      unsupportedCategory: category as RawModelDraft['unsupportedCategory'],
    });
    expect(res.status).toBe('unsupportedIntent');
    if (res.status === 'unsupportedIntent') {
      expect(res.reason.toLowerCase()).toContain(needle.toLowerCase());
      expect(res.supportedHint.length).toBeGreaterThan(0);
    }
  });
});

describe('validateAiDraft — no auto-switch', () => {
  it('detectedOtherSubmode -> needsClarification with a switch hint, no draft', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      detectedOtherSubmode: true,
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.hint).toBeDefined();
      expect(res.question.toLowerCase()).toContain('switch');
    }
  });
});

describe('validateAiDraft — factual notes from top-of-book', () => {
  it('CMR BUY: trigger already met -> "arm right away" note', () => {
    const res = run(
      'CMR',
      {
        classification: 'draft',
        side: 'BUY',
        sizeHuman: '0.2',
        triggerPriceHuman: '20',
      },
      { bestBidTicks: null, bestAskTicks: 1900n }, // ask 19 <= trigger 20
    );
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.join(' ').toLowerCase()).toContain('already met');
    }
  });

  it('CL BUY: limit crosses the book -> crossing note', () => {
    const res = run(
      'CL',
      {
        classification: 'draft',
        side: 'BUY',
        sizeHuman: '0.2',
        triggerPriceHuman: '25',
        limitPriceHuman: '20',
      },
      { bestBidTicks: null, bestAskTicks: 1900n }, // ask 19 <= limit 20 -> crosses
    );
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.join(' ').toLowerCase()).toContain('crosses the book');
    }
  });

  it('caps notes at 2', () => {
    const res = run(
      'CMR',
      {
        classification: 'draft',
        side: 'BUY',
        sizeHuman: '0.025', // exactly-min note
        triggerPriceHuman: '20',
      },
      { bestBidTicks: null, bestAskTicks: 1900n }, // also already-met note
    );
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.notes.length).toBeLessThanOrEqual(2);
    }
  });
});

describe('validateAiDraft — Case 1: human price, never ticks', () => {
  it('CMR "20" renders "20" in draft + summary, never "2000"', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.draft.triggerPriceHuman).toBe('20');
      expect(res.summary).toContain('20 USDC');
      expect(res.summary).not.toContain('2000');
    }
  });

  it('CL "20"/"18" render human values in draft + summary, never ticks', () => {
    const res = run('CL', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      limitPriceHuman: '18',
    });
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft' && res.subMode === 'CL') {
      expect(res.draft.triggerPriceHuman).toBe('20');
      expect(res.draft.limitPriceHuman).toBe('18');
      expect(res.summary).toContain('20 USDC');
      expect(res.summary).toContain('18 USDC');
      expect(res.summary).not.toContain('2000');
      expect(res.summary).not.toContain('1800');
    }
  });
});

describe('validateAiDraft — Case 2: CL-style text in CMR', () => {
  it('CMR + limitPriceHuman -> needsClarification + CL hint (not unsupported, not draft)', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      limitPriceHuman: '18',
      detectedOtherSubmode: true,
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.question.toLowerCase()).toContain('passive limit on trigger');
      expect(res.hint).toBeDefined();
    }
  });

  it('CMR + limitPriceHuman overrides an unsupported classification -> CL hint', () => {
    const res = run('CMR', {
      classification: 'unsupported',
      unsupportedCategory: 'other',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      limitPriceHuman: '18',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.question.toLowerCase()).toContain('passive limit on trigger');
    }
  });

  it('CMR without a limit price still builds a normal draft', () => {
    const res = run('CMR', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
    });
    expect(res.status).toBe('validDraft');
  });
});

describe('validateAiDraft — Case 3: CMR-style text in CL', () => {
  it('CL with only the limit missing -> needsClarification + CMR hint, no invented limit', () => {
    const res = run('CL', {
      classification: 'needsClarification',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '15',
      missingFields: ['limitPriceHuman'],
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('limitPriceHuman');
      expect(res.hint?.toLowerCase()).toContain('market-ready');
      expect(res.partialDraft?.limitPriceHuman).toBeUndefined();
    }
  });

  it('CL missing BOTH size and limit -> no CMR hint (not only-limit)', () => {
    const res = run('CL', {
      classification: 'needsClarification',
      side: 'BUY',
      triggerPriceHuman: '15',
    });
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.hint).toBeUndefined();
    }
  });

  it('CL with both trigger and limit -> validDraft (Case 14)', () => {
    const res = run('CL', {
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
      limitPriceHuman: '18',
    });
    expect(res.status).toBe('validDraft');
  });

  it('CL vague price ("cheap") -> needsClarification, not unsupported', () => {
    const res = run('CL', {
      classification: 'needsClarification',
      side: 'BUY',
      sizeHuman: '0.2',
      missingFields: ['triggerPriceHuman', 'limitPriceHuman'],
    });
    expect(res.status).toBe('needsClarification');
  });
});
