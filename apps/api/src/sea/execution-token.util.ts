// apps/api/src/sea/execution-token.util.ts
//
// Phase 4.x-b: stateless HMAC helpers for the CMR execution-lifecycle flow.
//
//   lockNonce      — issued by GET /sea/intents/:id/fresh-quote when READY.
//                    Bound to (intentId, owner, preparedQuoteAt, chainId).
//                    No DB column; monitor's `preparedQuoteAt` changes
//                    naturally invalidate outstanding nonces.
//
//   executionToken — issued by POST /sea/intents/:id/wallet-lock after the
//                    one EIP-191 popup verifies. Bound to (purpose,
//                    intentId, owner, chainId, walletLockUntilAt, lockNonce).
//                    Consumed by POST /sea/intents/:id/executing with
//                    constant-time comparison.
//
// Secrets live in env. In non-dev they are mandatory at module boot; see
// `requireSecret`. Token payloads are version-tagged so a future secret
// rotation can also rotate the version prefix.
import { createHmac, timingSafeEqual } from 'node:crypto';

const NONCE_VERSION_TAG = 'sea-lock-nonce-v1';
const TOKEN_VERSION_TAG = 'sea-execution-token-v1';

/**
 * Read a required HMAC secret from env. In dev (PROFILE=dev or unset profile
 * AND DEV_SKIP_SIGS=1), missing secrets fall back to the same string so
 * tests/dev can run without configuring vault entries. Outside dev the
 * secret is mandatory — the caller (boot-time validation in
 * `intent.service.ts` / `sea.module.ts`) is expected to fail loudly if
 * `readSecret('SEA_X')` returns `null`.
 */
export function readSecret(envKey: string): string | null {
  const v = process.env[envKey];
  if (v && v.length >= 16) return v;
  const profile = process.env.PROFILE ?? '';
  const devSkip = process.env.DEV_SKIP_SIGS === '1';
  if (profile === 'dev' || (profile === '' && devSkip)) {
    // Deterministic dev fallback. NOT used in any non-dev profile.
    return `dev-only-fallback-secret-for-${envKey}`;
  }
  return null;
}

function hmacB64Url(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function constantTimeEqStr(a: string, b: string): boolean {
  // crypto.timingSafeEqual requires equal-length buffers; pre-check is OK
  // because length is not secret.
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/* ---------------------------------------------------------------------------
 * lockNonce
 * ------------------------------------------------------------------------ */

export type LockNonceContext = {
  intentId: string;
  owner: string;
  preparedQuoteAt: Date;
  chainId: number;
};

function lockNoncePayload(ctx: LockNonceContext): string {
  return [
    NONCE_VERSION_TAG,
    ctx.intentId,
    ctx.owner.toLowerCase(),
    ctx.preparedQuoteAt.toISOString(),
    String(ctx.chainId),
  ].join('|');
}

export function issueLockNonce(secret: string, ctx: LockNonceContext): string {
  return hmacB64Url(secret, lockNoncePayload(ctx));
}

export function verifyLockNonce(
  secret: string,
  supplied: string,
  ctx: LockNonceContext,
): boolean {
  const expected = issueLockNonce(secret, ctx);
  return constantTimeEqStr(supplied, expected);
}

/* ---------------------------------------------------------------------------
 * executionToken
 * ------------------------------------------------------------------------ */

export type ExecutionTokenContext = {
  intentId: string;
  owner: string;
  chainId: number;
  walletLockUntilAt: Date;
  lockNonce: string;
};

function executionTokenPayload(ctx: ExecutionTokenContext): string {
  return [
    TOKEN_VERSION_TAG,
    ctx.intentId,
    ctx.owner.toLowerCase(),
    String(ctx.chainId),
    ctx.walletLockUntilAt.toISOString(),
    ctx.lockNonce,
  ].join('|');
}

export function issueExecutionToken(
  secret: string,
  ctx: ExecutionTokenContext,
): string {
  return hmacB64Url(secret, executionTokenPayload(ctx));
}

export function verifyExecutionToken(
  secret: string,
  supplied: string,
  ctx: ExecutionTokenContext,
): boolean {
  const expected = issueExecutionToken(secret, ctx);
  return constantTimeEqStr(supplied, expected);
}
