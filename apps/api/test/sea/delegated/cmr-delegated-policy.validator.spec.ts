// apps/api/test/sea/delegated/cmr-delegated-policy.validator.spec.ts
import { validateFreshQuoteAgainstPolicy } from '../../../src/sea/delegated/cmr-delegated-policy.validator';
import type {
  CmrDelegationPolicy,
  DelegatedFreshQuote,
} from '../../../src/sea/delegated/delegated.types';

const policy: CmrDelegationPolicy = {
  chainId: 11155111,
  profile: 'ethereum-sepolia',
  target: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  functionSelector: '0xf6274f66',
  usageLimit: 1,
  validUntil: 2_000_000_000,
  spendToken: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  spendCapQ: 2_020_000n,
  maxTakerFillAmountQ: 2_000_000n,
  accountModel: 'EIP7702',
};

const goodQuote: DelegatedFreshQuote = {
  marketId: 'm1',
  side: 'BUY',
  fillsCount: 1,
  remainingBaseB: 0n,
  takerToken: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  takerFillAmountQ: 2_000_000n,
  takerTotalAmountQ: 2_020_000n,
};
const NOW = 1_900_000_000;

describe('validateFreshQuoteAgainstPolicy', () => {
  it('passes a full-size single-fill quote within cap and not expired', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: goodQuote,
        nowUnix: NOW,
      }),
    ).toEqual({ ok: true });
  });

  it('rejects when past validUntil', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: goodQuote,
        nowUnix: policy.validUntil + 1,
      }),
    ).toEqual({ ok: false, reason: 'grant_expired' });
  });

  it('rejects a partial (not full size)', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: { ...goodQuote, remainingBaseB: 1n },
        nowUnix: NOW,
      }),
    ).toEqual({ ok: false, reason: 'not_full_size' });
  });

  it('rejects a multi-fill quote', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: { ...goodQuote, fillsCount: 2 },
        nowUnix: NOW,
      }),
    ).toEqual({ ok: false, reason: 'requires_single_fill' });
  });

  it('rejects a wrong taker token', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: { ...goodQuote, takerToken: '0x' + '1'.repeat(40) },
        nowUnix: NOW,
      }),
    ).toEqual({ ok: false, reason: 'wrong_taker_token' });
  });

  it('rejects when over the fill bound', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: {
          ...goodQuote,
          takerFillAmountQ: policy.maxTakerFillAmountQ + 1n,
        },
        nowUnix: NOW,
      }),
    ).toEqual({ ok: false, reason: 'exceeds_fill_bound' });
  });

  it('rejects when total (amount+fee) exceeds the spend cap', () => {
    expect(
      validateFreshQuoteAgainstPolicy({
        policy,
        quote: { ...goodQuote, takerTotalAmountQ: policy.spendCapQ + 1n },
        nowUnix: NOW,
      }),
    ).toEqual({ ok: false, reason: 'exceeds_spend_cap' });
  });
});
