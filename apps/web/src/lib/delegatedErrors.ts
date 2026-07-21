// apps/web/src/lib/delegatedErrors.ts
// Phase 3b (delegated CMR manual-QA fixes): map raw fetch/backend errors from
// the delegated surface to user-friendly, recoverable copy. The most common
// case in manual QA is a transient API restart/outage surfacing the browser's
// raw "Failed to fetch" (a TypeError from fetch) with no context. Turn that into
// an actionable message; pass through anything already meaningful unchanged.

/** True when the raw error looks like a network/unreachable-API failure. */
export function isNetworkError(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const s = raw.toLowerCase();
  return (
    s.includes("failed to fetch") ||
    s.includes("networkerror") ||
    s.includes("network error") ||
    s.includes("load failed") || // Safari's fetch-failure text
    s.includes("err_connection") ||
    s.includes("fetch failed")
  );
}

const NETWORK_MESSAGE =
  "Could not reach the delegated API. Check that the API is running and retry.";

/**
 * Friendly, recoverable message for a delegated-flow error. Network failures get
 * a clear "API unreachable, retry" message; everything else is returned as-is so
 * real backend reasons stay visible for debugging.
 */
export function friendlyDelegatedError(raw: unknown): string {
  const msg = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : String(raw);
  if (isNetworkError(msg)) return NETWORK_MESSAGE;
  return msg;
}
