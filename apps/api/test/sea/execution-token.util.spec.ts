// apps/api/test/sea/execution-token.util.spec.ts
//
// Phase 4.x-b: HMAC binding tests for lockNonce + executionToken.
// Each tamper case (wrong owner / chainId / intentId / nonce / lockUntil
// / secret) MUST cause verification to fail.
import {
  issueExecutionToken,
  issueLockNonce,
  verifyExecutionToken,
  verifyLockNonce,
} from '../../src/sea/execution-token.util';

const NONCE_SECRET = 'a'.repeat(32);
const TOKEN_SECRET = 'b'.repeat(32);

const baseLockCtx = {
  intentId: 'intent_1',
  owner: '0xAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAaa',
  preparedQuoteAt: new Date('2026-05-31T00:00:00.000Z'),
  chainId: 84532,
} as const;

const baseTokenCtx = {
  intentId: 'intent_1',
  owner: '0xAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAaa',
  chainId: 84532,
  walletLockUntilAt: new Date('2026-05-31T00:05:00.000Z'),
  lockNonce: 'a-stable-nonce',
} as const;

describe('lockNonce', () => {
  it('round-trips: issue/verify with identical context returns true', () => {
    const n = issueLockNonce(NONCE_SECRET, baseLockCtx);
    expect(verifyLockNonce(NONCE_SECRET, n, baseLockCtx)).toBe(true);
  });

  it('owner case-insensitive (lowercased in payload)', () => {
    const n = issueLockNonce(NONCE_SECRET, baseLockCtx);
    expect(
      verifyLockNonce(NONCE_SECRET, n, {
        ...baseLockCtx,
        owner: baseLockCtx.owner.toUpperCase(),
      }),
    ).toBe(true);
  });

  it.each([
    ['wrong intentId', { intentId: 'intent_2' }],
    ['wrong owner', { owner: '0xBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBbb' }],
    [
      'wrong preparedQuoteAt',
      { preparedQuoteAt: new Date('2026-05-31T00:00:01.000Z') },
    ],
    ['wrong chainId', { chainId: 1 }],
  ])('rejects %s', (_label, override) => {
    const n = issueLockNonce(NONCE_SECRET, baseLockCtx);
    expect(
      verifyLockNonce(NONCE_SECRET, n, {
        ...baseLockCtx,
        ...(override as Partial<typeof baseLockCtx>),
      }),
    ).toBe(false);
  });

  it('rejects nonce minted under a different secret', () => {
    const n = issueLockNonce('different-secret-' + 'x'.repeat(32), baseLockCtx);
    expect(verifyLockNonce(NONCE_SECRET, n, baseLockCtx)).toBe(false);
  });
});

describe('executionToken', () => {
  it('round-trips: issue/verify with identical context returns true', () => {
    const t = issueExecutionToken(TOKEN_SECRET, baseTokenCtx);
    expect(verifyExecutionToken(TOKEN_SECRET, t, baseTokenCtx)).toBe(true);
  });

  it.each([
    ['wrong intentId', { intentId: 'intent_2' }],
    ['wrong owner', { owner: '0xBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBbb' }],
    ['wrong chainId', { chainId: 1 }],
    [
      'wrong walletLockUntilAt',
      { walletLockUntilAt: new Date('2026-05-31T00:05:01.000Z') },
    ],
    ['wrong lockNonce', { lockNonce: 'tampered-nonce' }],
  ])('rejects token tamper: %s', (_label, override) => {
    const t = issueExecutionToken(TOKEN_SECRET, baseTokenCtx);
    expect(
      verifyExecutionToken(TOKEN_SECRET, t, {
        ...baseTokenCtx,
        ...(override as Partial<typeof baseTokenCtx>),
      }),
    ).toBe(false);
  });

  it('rejects token minted under a different secret', () => {
    const t = issueExecutionToken(
      'different-token-secret-' + 'x'.repeat(32),
      baseTokenCtx,
    );
    expect(verifyExecutionToken(TOKEN_SECRET, t, baseTokenCtx)).toBe(false);
  });

  it('tokens for different lock-until values are independent', () => {
    const tA = issueExecutionToken(TOKEN_SECRET, baseTokenCtx);
    const tB = issueExecutionToken(TOKEN_SECRET, {
      ...baseTokenCtx,
      walletLockUntilAt: new Date('2026-05-31T00:06:00.000Z'),
    });
    expect(tA).not.toEqual(tB);
    expect(verifyExecutionToken(TOKEN_SECRET, tA, baseTokenCtx)).toBe(true);
    expect(verifyExecutionToken(TOKEN_SECRET, tB, baseTokenCtx)).toBe(false);
  });
});
