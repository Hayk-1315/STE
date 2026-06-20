// apps/api/test/onchain/rpc-transient.util.spec.ts
//
// Phase RPC-1: unit coverage for the transient-error classifier, the backoff,
// and the backward-compatible watcher gate resolver. No live RPC.
import {
  Backoff,
  isTransientRpcError,
  resolveWatcherEnabled,
} from '../../src/onchain/rpc-transient.util';

describe('isTransientRpcError', () => {
  it('treats HTTP 429 / rate-limit / quota / compute-unit phrasing as transient', () => {
    expect(isTransientRpcError(new Error('429 Too Many Requests'))).toBe(true);
    expect(
      isTransientRpcError({
        code: 'SERVER_ERROR',
        info: { responseStatus: '429 Too Many Requests' },
      }),
    ).toBe(true);
    expect(isTransientRpcError({ status: 429 })).toBe(true);
    expect(
      isTransientRpcError(
        new Error('your app has exceeded its compute units capacity'),
      ),
    ).toBe(true);
    expect(isTransientRpcError(new Error('rate limit exceeded'))).toBe(true);
    expect(isTransientRpcError(new Error('request throttled'))).toBe(true);
    expect(isTransientRpcError(new Error('monthly quota reached'))).toBe(true);
  });

  it('treats 5xx provider/server failures as transient', () => {
    expect(isTransientRpcError({ statusCode: 503 })).toBe(true);
    expect(
      isTransientRpcError({
        code: 'SERVER_ERROR',
        info: { responseStatus: 502 },
      }),
    ).toBe(true);
  });

  it('treats network plumbing codes (TIMEOUT / NETWORK_ERROR) as transient', () => {
    expect(isTransientRpcError({ code: 'TIMEOUT' })).toBe(true);
    expect(isTransientRpcError({ code: 'NETWORK_ERROR' })).toBe(true);
  });

  it('finds transient signals nested in cause / error / info', () => {
    expect(
      isTransientRpcError({
        code: 'SERVER_ERROR',
        error: { status: 429 },
      }),
    ).toBe(true);
    expect(
      isTransientRpcError({ message: 'boom', cause: { code: 'TIMEOUT' } }),
    ).toBe(true);
  });

  it('does NOT treat ABI/decode/config/revert errors as transient', () => {
    expect(isTransientRpcError({ code: 'CALL_EXCEPTION' })).toBe(false); // revert
    expect(
      isTransientRpcError({
        code: 'BAD_DATA',
        message: 'could not decode result data',
      }),
    ).toBe(false);
    expect(
      isTransientRpcError({
        code: 'INVALID_ARGUMENT',
        message: 'invalid address',
      }),
    ).toBe(false);
    expect(isTransientRpcError(new Error('execution reverted'))).toBe(false);
    expect(isTransientRpcError(new Error('market_not_found_for_tokens'))).toBe(
      false,
    );
  });

  it('is conservative: unknown / empty errors are non-transient', () => {
    expect(isTransientRpcError(null)).toBe(false);
    expect(isTransientRpcError(undefined)).toBe(false);
    expect(isTransientRpcError('something went wrong')).toBe(false);
    // SERVER_ERROR without any 429/5xx/rate-limit signal → unsure → non-transient.
    expect(isTransientRpcError({ code: 'SERVER_ERROR' })).toBe(false);
  });

  it('non-transient code wins even if a transient status is also present', () => {
    expect(isTransientRpcError({ code: 'CALL_EXCEPTION', status: 429 })).toBe(
      false,
    );
  });
});

describe('Backoff', () => {
  it('grows exponentially from base, capped at max, and resets', () => {
    const b = new Backoff(15000, 120000);
    expect(b.nextDelay()).toBe(15000);
    expect(b.nextDelay()).toBe(30000);
    expect(b.nextDelay()).toBe(60000);
    expect(b.nextDelay()).toBe(120000);
    expect(b.nextDelay()).toBe(120000); // capped
    b.reset();
    expect(b.nextDelay()).toBe(15000);
  });

  it('falls back to sane defaults for invalid inputs and floors max at base', () => {
    const b = new Backoff(Number.NaN, -1);
    expect(b.nextDelay()).toBe(15000); // base default
    const c = new Backoff(20000, 5000); // max < base → clamped up to base
    expect(c.nextDelay()).toBe(20000);
    expect(c.nextDelay()).toBe(20000);
  });
});

describe('resolveWatcherEnabled', () => {
  it('honors the specific gate when set to "1" or "0"', () => {
    expect(resolveWatcherEnabled('1', undefined)).toBe(true);
    expect(resolveWatcherEnabled('1', '0')).toBe(true);
    expect(resolveWatcherEnabled('0', '1')).toBe(false);
  });

  it('falls back to the legacy gate when the specific gate is unset/blank', () => {
    expect(resolveWatcherEnabled(undefined, '1')).toBe(true);
    expect(resolveWatcherEnabled('', '1')).toBe(true);
    expect(resolveWatcherEnabled(undefined, '0')).toBe(false);
    expect(resolveWatcherEnabled(undefined, undefined)).toBe(false);
  });
});
