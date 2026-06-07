// apps/api/test/sea/intent.dto.spec.ts
// Phase 1 schema + invariants coverage. No DB, no Nest container.
import {
  computeExpiresAt,
  createIntentBodySchema,
  structuredIntentSchema,
  validateCreateIntentBodyInvariants,
} from '../../src/sea/dto/intent.dto';

const validClBody = {
  owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  structuredIntent: {
    version: 1,
    type: 'CONDITIONAL_LIMIT',
    marketId: 'WETH-USDC',
    side: 'BUY',
    sizeBase: '1000000000000000000',
    limitPriceTicks: '2950000',
    trigger: {
      type: 'PRICE_BELOW',
      reference: 'BEST_ASK',
      priceTicks: '3000000',
    },
    expiry: { secsFromActivation: 86400 },
    executionAuthority: 'PRE_SIGNED_LIMIT_ORDER',
    enforcement: 'PASSIVE_ONLY',
  },
  zeroExOrder: { foo: 'bar' },
  signature: '0x' + 'a'.repeat(130),
  preSignedOrderHash: '0x' + 'b'.repeat(64),
};

// Phase 2 update: CMR requires ownerAuth.signature, and expiry must be the
// {atUnix} form so the canonical signed message is deterministic. The
// signature value here is a structurally-valid hex string used only for
// schema/invariant tests — verifyMessage is exercised in the validator spec.
const validCmrBody = {
  owner: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  structuredIntent: {
    version: 1,
    type: 'CONDITIONAL_MARKET_READY',
    marketId: 'WETH-USDC',
    side: 'BUY',
    sizeBase: '500000000000000000',
    tif: 'IOC',
    trigger: {
      type: 'PRICE_ABOVE',
      reference: 'BEST_ASK',
      priceTicks: '3500000',
    },
    expiry: { atUnix: 2_000_000_000 },
    executionAuthority: 'USER_CONFIRMATION_REQUIRED',
  },
  ownerAuth: { signature: '0x' + 'a'.repeat(130) },
};

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

describe('createIntentBodySchema', () => {
  it('accepts a well-formed CONDITIONAL_LIMIT body', () => {
    const r = createIntentBodySchema.safeParse(validClBody);
    expect(r.success).toBe(true);
  });

  it('accepts a well-formed CONDITIONAL_MARKET_READY body', () => {
    const r = createIntentBodySchema.safeParse(validCmrBody);
    expect(r.success).toBe(true);
  });

  it('rejects an invalid owner address', () => {
    const body = clone(validClBody);
    body.owner = '0xnothex';
    const r = createIntentBodySchema.safeParse(body);
    expect(r.success).toBe(false);
  });

  it('rejects a negative sizeBase', () => {
    const body = clone(validClBody);
    body.structuredIntent.sizeBase = '-1';
    const r = createIntentBodySchema.safeParse(body);
    expect(r.success).toBe(false);
  });

  it('rejects a signature without 0x prefix', () => {
    const body = clone(validClBody);
    body.signature = 'aabbcc';
    const r = createIntentBodySchema.safeParse(body);
    expect(r.success).toBe(false);
  });
});

describe('structuredIntentSchema', () => {
  it('rejects MID reference (not supported in v1)', () => {
    const intent = clone(validClBody.structuredIntent);
    (intent.trigger as { reference: string }).reference = 'MID';
    const r = structuredIntentSchema.safeParse(intent);
    expect(r.success).toBe(false);
  });

  it('rejects CONDITIONAL_LIMIT without enforcement=PASSIVE_ONLY', () => {
    const intent = clone(validClBody.structuredIntent);
    (intent as { enforcement: string }).enforcement = 'IGNORE';
    const r = structuredIntentSchema.safeParse(intent);
    expect(r.success).toBe(false);
  });

  it('rejects CONDITIONAL_LIMIT with the wrong executionAuthority', () => {
    const intent = clone(validClBody.structuredIntent);
    (intent as { executionAuthority: string }).executionAuthority =
      'USER_CONFIRMATION_REQUIRED';
    const r = structuredIntentSchema.safeParse(intent);
    expect(r.success).toBe(false);
  });

  it('rejects expiry shorter than 60 seconds (CL — CMR is restricted to atUnix)', () => {
    const intent = clone(validClBody.structuredIntent);
    (intent.expiry as { secsFromActivation: number }).secsFromActivation = 30;
    const r = structuredIntentSchema.safeParse(intent);
    expect(r.success).toBe(false);
  });
});

describe('validateCreateIntentBodyInvariants', () => {
  it('passes for well-formed CL/CMR bodies', () => {
    const cl = createIntentBodySchema.parse(validClBody);
    const cmr = createIntentBodySchema.parse(validCmrBody);
    expect(validateCreateIntentBodyInvariants(cl)).toEqual([]);
    expect(validateCreateIntentBodyInvariants(cmr)).toEqual([]);
  });

  it('flags BUY intents that do not reference BEST_ASK', () => {
    const body = clone(validClBody);
    body.structuredIntent.trigger.reference = 'BEST_BID';
    const parsed = createIntentBodySchema.parse(body);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.length).toBeGreaterThan(0);
    expect(v[0].path).toContain('trigger.reference');
  });

  it('flags SELL intents that do not reference BEST_BID', () => {
    const body = clone(validClBody);
    body.structuredIntent.side = 'SELL';
    // BEST_ASK is wrong for SELL; expect a violation.
    const parsed = createIntentBodySchema.parse(body);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.length).toBeGreaterThan(0);
  });

  it('flags CONDITIONAL_LIMIT missing zeroExOrder/signature/preSignedOrderHash', () => {
    const body = clone(validClBody);
    delete (body as Partial<typeof body>).zeroExOrder;
    delete (body as Partial<typeof body>).signature;
    delete (body as Partial<typeof body>).preSignedOrderHash;
    const parsed = createIntentBodySchema.parse(body);
    const v = validateCreateIntentBodyInvariants(parsed);
    const paths = v.map((x) => x.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        'zeroExOrder',
        'signature',
        'preSignedOrderHash',
      ]),
    );
  });

  it('flags CONDITIONAL_MARKET_READY that includes a pre-signed payload', () => {
    const body = clone(validCmrBody) as typeof validCmrBody & {
      zeroExOrder?: unknown;
      signature?: string;
      preSignedOrderHash?: string;
    };
    body.zeroExOrder = { foo: 'bar' };
    body.signature = '0x' + 'a'.repeat(130);
    body.preSignedOrderHash = '0x' + 'b'.repeat(64);
    const parsed = createIntentBodySchema.parse(body);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.length).toBeGreaterThan(0);
  });

  it('flags CONDITIONAL_MARKET_READY missing ownerAuth.signature', () => {
    const { ownerAuth: _omit, ...rest } = clone(validCmrBody);
    const parsed = createIntentBodySchema.parse(rest as unknown);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.map((x) => x.path)).toEqual(
      expect.arrayContaining(['ownerAuth.signature']),
    );
  });

  it('flags CONDITIONAL_MARKET_READY using expiry.secsFromActivation', () => {
    const base = clone(validCmrBody);
    const body = {
      ...base,
      structuredIntent: {
        ...base.structuredIntent,
        expiry: { secsFromActivation: 3600 },
      },
    };
    const parsed = createIntentBodySchema.parse(body as unknown);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.map((x) => x.path)).toEqual(
      expect.arrayContaining(['structuredIntent.expiry']),
    );
  });

  it('flags CONDITIONAL_LIMIT that includes ownerAuth (must not)', () => {
    const body = {
      ...clone(validClBody),
      ownerAuth: { signature: '0x' + 'a'.repeat(130) },
    };
    const parsed = createIntentBodySchema.parse(body as unknown);
    const v = validateCreateIntentBodyInvariants(parsed);
    expect(v.map((x) => x.path)).toEqual(expect.arrayContaining(['ownerAuth']));
  });
});

describe('computeExpiresAt', () => {
  it('resolves secsFromActivation relative to the supplied "now"', () => {
    const now = new Date('2026-05-05T00:00:00.000Z');
    const out = computeExpiresAt({ secsFromActivation: 60 }, now);
    expect(out.toISOString()).toBe('2026-05-05T00:01:00.000Z');
  });

  it('resolves atUnix as an absolute timestamp', () => {
    const out = computeExpiresAt({ atUnix: 1_700_000_000 });
    expect(out.getTime()).toBe(1_700_000_000 * 1000);
  });
});
