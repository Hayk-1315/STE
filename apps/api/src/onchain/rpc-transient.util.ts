// apps/api/src/onchain/rpc-transient.util.ts
//
// Phase RPC-1: shared classification of transient RPC/provider failures so the
// watchers (FillWatcher / CancelWatcher) and the order-placement balance guard
// can react consistently to Alchemy 429 / quota / capacity errors without a
// shared provider pool or any change to the polling/cursor model.
//
// Design rule: be CONSERVATIVE. A transient error means "the chain state is fine,
// the provider just refused us right now — retry later". Anything that smells like
// a bug (ABI/decode, bad address/config, revert/CALL_EXCEPTION, programmer error)
// is NOT transient and must surface as before. When unsure, return false.

// ethers v6 error codes that are definitively NOT transient — they indicate a
// programming/config/contract error, not a throttled provider. If any error level
// carries one of these codes we short-circuit to non-transient.
const NON_TRANSIENT_CODES = new Set<string>([
  'CALL_EXCEPTION', // on-chain revert
  'BAD_DATA', // ABI/decode failure
  'INVALID_ARGUMENT', // bad address / argument / config
  'UNCONFIGURED_NAME', // ENS / name resolution
  'NUMERIC_FAULT',
  'UNSUPPORTED_OPERATION',
  'NONCE_EXPIRED',
  'REPLACEMENT_UNDERPRICED',
  'INSUFFICIENT_FUNDS',
  'ACTION_REJECTED',
]);

// ethers v6 error codes that are inherently transient (network plumbing).
const TRANSIENT_CODES = new Set<string>(['TIMEOUT', 'NETWORK_ERROR']);

// Phrases seen in provider rate-limit / capacity / quota responses (Alchemy,
// Infura, generic gateways). Matched case-insensitively against the collected
// message text.
const TRANSIENT_MESSAGE = new RegExp(
  [
    'too many requests',
    'rate.?limit',
    'compute unit',
    'quota',
    'capacity',
    'over.?rate',
    'throttl', // throttle / throttled / throttling
    'temporarily unavailable',
    'service unavailable',
    'request limit',
  ].join('|'),
  'i',
);

type Walkable = Record<string, unknown>;

function asObject(v: unknown): Walkable | null {
  return v && typeof v === 'object' ? (v as Walkable) : null;
}

// Collect codes, numeric statuses and message text from an error and a bounded
// set of nested levels (ethers wraps the underlying cause in `.info`, `.error`
// and `.cause`). Bounded walk — no unbounded recursion.
function collect(err: unknown): {
  codes: string[];
  statuses: number[];
  message: string;
} {
  const codes: string[] = [];
  const statuses: number[] = [];
  const messages: string[] = [];

  const seen = new Set<unknown>();
  const stack: unknown[] = [err];

  while (stack.length > 0) {
    const cur = stack.pop();
    const obj = asObject(cur);
    if (!obj || seen.has(obj)) continue;
    seen.add(obj);
    if (seen.size > 12) break; // hard bound

    if (typeof obj.code === 'string') codes.push(obj.code);

    for (const key of ['status', 'statusCode', 'responseStatus']) {
      const raw = obj[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        statuses.push(raw);
      } else if (typeof raw === 'string') {
        // e.g. "429 Too Many Requests"
        const n = Number.parseInt(raw, 10);
        if (Number.isFinite(n)) statuses.push(n);
        messages.push(raw);
      }
    }

    for (const key of ['message', 'shortMessage', 'reason', 'body']) {
      const raw = obj[key];
      if (typeof raw === 'string') messages.push(raw);
    }

    for (const key of ['info', 'error', 'cause']) {
      if (obj[key]) stack.push(obj[key]);
    }
  }

  if (typeof err === 'string') messages.push(err);

  return { codes, statuses, message: messages.join(' | ') };
}

/**
 * True only for failures that are safe to retry later (provider throttling /
 * capacity / network blips). Returns false for ABI/decode, config, revert and
 * unknown errors so real bugs are never masked.
 */
export function isTransientRpcError(e: unknown): boolean {
  if (e === null || e === undefined) return false;

  const { codes, statuses, message } = collect(e);

  // Definitive bug/config/revert → not transient (short-circuit).
  if (codes.some((c) => NON_TRANSIENT_CODES.has(c))) return false;

  // HTTP 429 or any 5xx (provider server/capacity failure) → transient.
  if (statuses.some((s) => s === 429 || (s >= 500 && s <= 599))) return true;

  // Network plumbing codes → transient.
  if (codes.some((c) => TRANSIENT_CODES.has(c))) return true;

  // Rate-limit / quota / capacity phrasing (covers ethers SERVER_ERROR that
  // wraps a 429 without a parsed status) → transient.
  if (TRANSIENT_MESSAGE.test(message)) return true;

  // Unsure → non-transient.
  return false;
}

/**
 * Exponential backoff with a hard ceiling. Pure and self-contained so each
 * watcher can own an instance (no shared mutable state across services).
 *
 * nextDelay(): baseMs, 2*baseMs, 4*baseMs, … capped at maxMs.
 * reset(): call after a successful RPC tick so the next degradation starts low.
 */
export class Backoff {
  private attempt = 0;
  private readonly baseMs: number;
  private readonly maxMs: number;

  constructor(baseMs: number, maxMs: number) {
    this.baseMs =
      Number.isFinite(baseMs) && baseMs > 0 ? Math.floor(baseMs) : 15000;
    const cap =
      Number.isFinite(maxMs) && maxMs > 0 ? Math.floor(maxMs) : 120000;
    this.maxMs = Math.max(this.baseMs, cap);
  }

  nextDelay(): number {
    const factor = 2 ** Math.min(this.attempt, 30);
    const delay = Math.min(this.maxMs, this.baseMs * factor);
    this.attempt += 1;
    return delay;
  }

  reset(): void {
    this.attempt = 0;
  }
}

/**
 * Resolve a watcher's enabled flag with backward compatibility:
 *   - specific "1" → enabled
 *   - specific "0" → disabled
 *   - specific unset/other → fall back to the legacy DEV_ONCHAIN_WATCHER gate.
 * Default behavior (only DEV_ONCHAIN_WATCHER set) is therefore unchanged.
 */
export function resolveWatcherEnabled(
  specific: string | undefined,
  legacy: string | undefined,
): boolean {
  const s = (specific ?? '').trim();
  if (s === '1') return true;
  if (s === '0') return false;
  return (legacy ?? '') === '1';
}
