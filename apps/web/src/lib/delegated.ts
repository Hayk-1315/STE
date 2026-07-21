// apps/web/src/lib/delegated.ts
// Typed client for the backend delegated-CMR REST surface (Phase 2/3b). Read
// endpoints (capabilities, sa-status) are always safe; write endpoints (grant
// prepare/finalize, revoke) 403 when the feature is disabled. Mirrors
// lib/sea.ts's fetch style. Milestone 3C wires grant/prepare + grant/finalize +
// revoke/prepare into the real delegated-grant flow (hooks/useDelegatedGrant.ts).
import { env } from "./env";

/** Frontend gate for the delegated-CMR UI. Default OFF. */
export function isDelegatedEnabled(): boolean {
  return env().NEXT_PUBLIC_SEA_DELEGATED_ENABLED === "true";
}

export type DelegationAccountModel = "EIP7702" | "NEXUS_SA";

export type DelegationCapabilities = {
  supported: boolean;
  accountModels: DelegationAccountModel[];
  reason?: string;
};

export type DelegationStatusResponse = {
  enabled: boolean;
  writable: boolean;
  profile: string;
  chainId: number;
  provider: string;
  signerConfigured: boolean;
  reason?: string;
  capabilities: DelegationCapabilities;
};

export type SaStatus = {
  ok: boolean;
  reason?: string;
  smartAccountAddress?: string;
  sessionKeyAddress?: string;
  factory?: string;
  needsDeployment?: boolean;
  needsModuleInstall?: boolean;
  needsFunding?: boolean;
  needsApproval?: boolean;
  ethBalanceWei?: string;
  requiredEthWei?: string;
  tokenBalanceQ?: string;
  requiredTokenQ?: string;
  allowanceQ?: string;
};

export type PrepareGrantResponse = {
  ok: boolean;
  reason?: string;
  accountAddress?: string;
  needsDelegation?: boolean;
  delegationImplementation?: string;
  enableDigest?: string;
  sessionBlob?: string;
};

export type FinalizeGrantResponse = {
  ok: boolean;
  reason?: string;
  grantId?: string;
  permissionId?: string;
};

export type RevokeResponse = {
  ok: boolean;
  reason?: string;
  to?: string;
  data?: string;
};

function baseUrl(): string {
  return env().NEXT_PUBLIC_API_BASE_URL;
}

async function readErr(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return `HTTP ${r.status}`;
  }
}

// ---- reads (safe) ----

export async function getDelegationCapabilities(): Promise<DelegationStatusResponse> {
  const r = await fetch(`${baseUrl()}/sea/delegated/capabilities`, {
    method: "GET",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as DelegationStatusResponse;
}

export async function getSaStatus(params: {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
}): Promise<SaStatus> {
  const q = new URLSearchParams({
    intentId: params.intentId,
    owner: params.owner,
  });
  if (params.accountModel) q.set("accountModel", params.accountModel);
  const r = await fetch(`${baseUrl()}/sea/delegated/sa-status?${q.toString()}`, {
    method: "GET",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as SaStatus;
}

export type DelegatedGrantSummary = {
  intentId: string;
  status: string; // ACTIVE | REVOKED | USED | FAILED | EXPIRED | PENDING
  accountModel: string;
  accountAddress: string | null;
  permissionId: string | null;
  validUntil: string;
};

export type DelegatedAttemptSummary = {
  decision: string; // VALIDATED | REJECTED | SUBMITTED | CONFIRMED | FAILED
  reason: string | null;
  txHash: string | null;
  providerRef: string | null;
  createdAt: string;
};

/** All of an owner's delegated grants — the FE row-branching source. */
export async function getDelegatedGrants(owner: string): Promise<DelegatedGrantSummary[]> {
  const q = new URLSearchParams({ owner });
  const r = await fetch(`${baseUrl()}/sea/delegated/grants?${q.toString()}`, {
    method: "GET",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as DelegatedGrantSummary[];
}

/** Delegated execution attempts for one intent (owner-scoped). */
export async function getDelegatedAttempts(
  owner: string,
  intentId: string,
): Promise<DelegatedAttemptSummary[]> {
  const q = new URLSearchParams({ owner, intentId });
  const r = await fetch(`${baseUrl()}/sea/delegated/attempts?${q.toString()}`, {
    method: "GET",
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as DelegatedAttemptSummary[];
}

// ---- writes (wired into hooks/useDelegatedGrant.ts) ----

export async function prepareDelegatedGrant(body: {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
}): Promise<PrepareGrantResponse> {
  const r = await fetch(`${baseUrl()}/sea/delegated/grant/prepare`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as PrepareGrantResponse;
}

export async function finalizeDelegatedGrant(body: {
  intentId: string;
  owner: string;
  accountModel?: DelegationAccountModel;
  accountAddress: string;
  sessionBlob: string;
  ownerSignature: string;
}): Promise<FinalizeGrantResponse> {
  const r = await fetch(`${baseUrl()}/sea/delegated/grant/finalize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as FinalizeGrantResponse;
}

export async function revokeDelegatedGrant(body: {
  intentId: string;
  owner: string;
}): Promise<RevokeResponse> {
  const r = await fetch(`${baseUrl()}/sea/delegated/revoke/prepare`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readErr(r));
  return (await r.json()) as RevokeResponse;
}
