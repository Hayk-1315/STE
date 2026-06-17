// apps/api/test/sea/ai/ai-parser.service.spec.ts
// SEA AI Assist (Phase 1A) — parser service / provider-boundary coverage.
// Uses a MOCK provider only; no network or live AI calls. Confirms the flag
// gate, safe degradation to aiUnavailable on every failure mode, and that a
// well-formed extraction flows through the deterministic validator.
import { AiParserService } from '../../../src/sea/ai/ai-parser.service';
import type { AiIntentProvider } from '../../../src/sea/ai/provider/ai-provider.interface';

const CTX = {
  id: 'm1',
  symbol: 'WETH-USDC',
  baseDecimals: 18,
  quoteDecimals: 6,
  minNotionalQ: 500_000n,
  minSizeB: 1_000_000_000_000_000n,
  priceTickQ: 10_000n,
  baseAddress: '0x1111111111111111111111111111111111111111',
  quoteAddress: '0x2222222222222222222222222222222222222222',
};

type MockProvider = AiIntentProvider & { parse: jest.Mock };

function makeService(providerParse: jest.Mock, getCtx?: jest.Mock) {
  const provider: MockProvider = { name: 'mock', parse: providerParse };
  const persistence = {
    getTradingContext: getCtx ?? jest.fn().mockResolvedValue(CTX),
  };
  const ob = { snapshot: jest.fn().mockReturnValue({ bids: [], asks: [] }) };
  const svc = new AiParserService(
    provider as unknown as AiIntentProvider,
    persistence as never,
    ob as never,
  );
  return { svc, provider, persistence, ob };
}

const REQ = {
  marketId: 'WETH-USDC',
  subMode: 'CMR' as const,
  text: 'Buy 0.2 WETH when best ask is at or below 20 USDC',
};

describe('AiParserService', () => {
  const original = process.env.SEA_AI_ENABLED;
  beforeEach(() => {
    process.env.SEA_AI_ENABLED = '1';
  });
  afterAll(() => {
    if (original === undefined) delete process.env.SEA_AI_ENABLED;
    else process.env.SEA_AI_ENABLED = original;
  });

  it('returns aiUnavailable and does not call the provider when disabled', async () => {
    delete process.env.SEA_AI_ENABLED;
    const parse = jest.fn();
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('aiUnavailable');
    expect(parse).not.toHaveBeenCalled();
  });

  it('returns aiUnavailable when the market cannot be resolved', async () => {
    const parse = jest.fn();
    const getCtx = jest.fn().mockRejectedValue(new Error('market_not_found'));
    const { svc } = makeService(parse, getCtx);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('aiUnavailable');
    expect(parse).not.toHaveBeenCalled();
  });

  it('returns aiUnavailable when the provider throws (e.g. missing key)', async () => {
    const parse = jest
      .fn()
      .mockRejectedValue(new Error('anthropic_api_key_missing'));
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('aiUnavailable');
  });

  it('returns aiUnavailable on malformed model output (missing classification)', async () => {
    const parse = jest.fn().mockResolvedValue({ side: 'BUY' });
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('aiUnavailable');
  });

  it('returns aiUnavailable when the provider returns a non-object', async () => {
    const parse = jest.fn().mockResolvedValue('not json');
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('aiUnavailable');
  });

  it('flows a well-formed extraction through to a validDraft', async () => {
    const parse = jest.fn().mockResolvedValue({
      classification: 'draft',
      side: 'BUY',
      sizeHuman: '0.2',
      triggerPriceHuman: '20',
    });
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('validDraft');
    if (res.status === 'validDraft') {
      expect(res.derived.reference).toBe('BEST_ASK');
      expect(res.provenance.model).toBeDefined();
      expect(res.provenance.requestId.length).toBeGreaterThan(0);
    }
  });

  it('routes an unsupported extraction to unsupportedIntent', async () => {
    const parse = jest.fn().mockResolvedValue({
      classification: 'unsupported',
      unsupportedCategory: 'indicator',
    });
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('unsupportedIntent');
  });

  it('routes a missing-trigger extraction to needsClarification', async () => {
    const parse = jest.fn().mockResolvedValue({
      classification: 'needsClarification',
      side: 'BUY',
      sizeHuman: '0.2',
      missingFields: ['triggerPriceHuman'],
    });
    const { svc } = makeService(parse);
    const res = await svc.parse(REQ);
    expect(res.status).toBe('needsClarification');
    if (res.status === 'needsClarification') {
      expect(res.missingFields).toContain('triggerPriceHuman');
    }
  });
});
