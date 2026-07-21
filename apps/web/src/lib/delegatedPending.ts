// apps/web/src/lib/delegatedPending.ts
// Phase 3b: a PERSISTED marker for intents whose delegated create flow has
// started but whose DelegationGrant is not yet ACTIVE/visible from
// GET /sea/delegated/grants.
//
// Why persisted (localStorage, not just in-memory): the grant round-trip
// (prepare -> owner signs -> finalize) can be interrupted — the user closes the
// tab, reloads, or the API goes down before finalize. An in-memory marker would
// be lost, and IntentsPanel would then see an intent with no grant and render the
// manual "Execute now" (ReadyIntentRowActions) — silently turning an
// authorization-incomplete delegated intent into a manual one. That is the bug
// this fixes: the marker survives reloads, so a pending delegated intent keeps
// rendering delegated/pending UI (Resume authorization / Return to manual) until
// the user explicitly returns to manual, or the grant finalizes ACTIVE.
//
// Keyed by owner + intentId + market. Cleared only when the grant becomes ACTIVE
// (grant map takes over) or the user explicitly returns to manual.

import { useSyncExternalStore } from "react";

export type DelegatedPendingStatus = "pending" | "error";

export type DelegatedPendingEntry = {
  intentId: string;
  /** Owner EOA, lowercased. */
  owner: string;
  marketId: string;
  status: DelegatedPendingStatus;
  createdAt: number;
};

const STORAGE_KEY = "ste:delegated-pending:v1";
const listeners = new Set<() => void>();

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function isEntry(v: unknown): v is DelegatedPendingEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.intentId === "string" &&
    typeof e.owner === "string" &&
    typeof e.marketId === "string" &&
    (e.status === "pending" || e.status === "error") &&
    typeof e.createdAt === "number"
  );
}

function readAll(): DelegatedPendingEntry[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: DelegatedPendingEntry[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota / privacy mode — the marker is best-effort */
  }
}

function emit(): void {
  for (const l of listeners) l();
}

// Cached immutable snapshot (Map<intentId, entry>) so useSyncExternalStore does
// not loop and consumers get a stable reference between changes.
let snapshot: ReadonlyMap<string, DelegatedPendingEntry> = new Map();
function rebuildSnapshot(): void {
  snapshot = new Map(readAll().map((e) => [e.intentId, e]));
}
rebuildSnapshot(); // client: hydrate from storage on module load; server: empty

/** Mark an intent as delegated-pending (grant not yet ACTIVE). Idempotent. */
export function markDelegatedPending(input: {
  intentId: string;
  owner: string;
  marketId: string;
}): void {
  if (!input.intentId || !input.owner || !input.marketId) return;
  const all = readAll();
  const idx = all.findIndex((e) => e.intentId === input.intentId);
  const entry: DelegatedPendingEntry = {
    intentId: input.intentId,
    owner: input.owner.toLowerCase(),
    marketId: input.marketId,
    status: "pending",
    createdAt: idx >= 0 ? all[idx].createdAt : Date.now(),
  };
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  writeAll(all);
  rebuildSnapshot();
  emit();
}

/** Flag a pending entry as errored (authorization failed) — kept, recoverable. */
export function setDelegatedPendingError(intentId: string): void {
  const all = readAll();
  const idx = all.findIndex((e) => e.intentId === intentId);
  if (idx < 0 || all[idx].status === "error") return;
  all[idx] = { ...all[idx], status: "error" };
  writeAll(all);
  rebuildSnapshot();
  emit();
}

/** Clear the marker (grant ACTIVE, or the user explicitly returned to manual). */
export function clearDelegatedPending(intentId: string): void {
  const all = readAll();
  const next = all.filter((e) => e.intentId !== intentId);
  if (next.length === all.length) return;
  writeAll(next);
  rebuildSnapshot();
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Cross-tab sync: another tab changing the marker should update this one.
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === STORAGE_KEY) {
      rebuildSnapshot();
      cb();
    }
  };
  if (hasWindow()) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (hasWindow()) window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: ReadonlyMap<string, DelegatedPendingEntry> = new Map();
function getSnapshot(): ReadonlyMap<string, DelegatedPendingEntry> {
  return snapshot;
}
function getServerSnapshot(): ReadonlyMap<string, DelegatedPendingEntry> {
  return EMPTY;
}

/** Reactive: intentId -> pending entry for all persisted delegated-pending intents. */
export function usePendingDelegatedEntries(): ReadonlyMap<string, DelegatedPendingEntry> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
