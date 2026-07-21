// apps/api/test/sea/delegated/cmr-delegation-policy.builder.spec.ts
import {
  buildCmrDelegationPolicy,
  FILL_LIMIT_ORDER_SELECTOR,
} from '../../../src/sea/delegated/cmr-delegation-policy.builder';

const base = {
  chainId: 11155111,
  profile: 'ethereum-sepolia' as const,
  exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  spendToken: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  takerFillAmountQ: 2_000_000n,
  takerFeeAmountQ: 20_000n,
  validUntilUnix: 1_900_000_000,
  accountModel: 'EIP7702' as const,
};

describe('buildCmrDelegationPolicy', () => {
  it('builds the coarse session policy with usageLimit fixed to 1', () => {
    const p = buildCmrDelegationPolicy(base);
    expect(p.target).toBe(base.exchangeProxy);
    expect(p.functionSelector).toBe(FILL_LIMIT_ORDER_SELECTOR);
    expect(p.usageLimit).toBe(1);
    expect(p.validUntil).toBe(base.validUntilUnix);
    expect(p.spendToken).toBe(base.spendToken);
    // Spend cap covers takerAmount + fee; fill bound is the amount alone.
    expect(p.spendCapQ).toBe(2_020_000n);
    expect(p.maxTakerFillAmountQ).toBe(2_000_000n);
    expect(p.accountModel).toBe('EIP7702');
    expect(p.chainId).toBe(11155111);
  });

  it('rejects an invalid exchangeProxy address', () => {
    expect(() =>
      buildCmrDelegationPolicy({ ...base, exchangeProxy: '0xnope' }),
    ).toThrow(/exchangeProxy/);
  });

  it('rejects a non-positive fill amount', () => {
    expect(() =>
      buildCmrDelegationPolicy({ ...base, takerFillAmountQ: 0n }),
    ).toThrow(/takerFillAmountQ/);
  });

  it('rejects a negative fee amount', () => {
    expect(() =>
      buildCmrDelegationPolicy({ ...base, takerFeeAmountQ: -1n }),
    ).toThrow(/takerFeeAmountQ/);
  });

  it('rejects an invalid validUntil', () => {
    expect(() =>
      buildCmrDelegationPolicy({ ...base, validUntilUnix: 0 }),
    ).toThrow(/validUntil/);
  });
});
