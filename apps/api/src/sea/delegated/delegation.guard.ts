// apps/api/src/sea/delegated/delegation.guard.ts
//
// Central profile/flag guards for EVERY delegated write/execution path.
// Defense-in-depth: re-checks base-mainnet + READ_ONLY + PROFILE=mainnet
// directly (belt-and-braces) in addition to the resolved config, matching the
// existing SEA sweeper gates. Any delegated write/exec must pass `writeGate`.
import type { DelegationConfig } from './delegation.config';

export interface DelegationGate {
  allowed: boolean;
  reason?: string;
}

/**
 * Gate for grant creation, session install, revoke, and any API write path.
 * Returns `allowed: false` (never throws) so callers choose 403 vs no-op.
 */
export function delegationWriteGate(cfg: DelegationConfig): DelegationGate {
  // Base Mainnet / any non-writable profile is hard-disabled/read-only.
  if (cfg.profile === 'base-mainnet' || !cfg.writable) {
    return { allowed: false, reason: `profile ${cfg.profile} is read-only` };
  }
  // Belt-and-braces env re-checks (independent of cfg computation).
  if ((process.env.READ_ONLY ?? '').trim() === 'true') {
    return { allowed: false, reason: 'READ_ONLY=true' };
  }
  if ((process.env.PROFILE ?? '').trim() === 'mainnet') {
    return { allowed: false, reason: 'PROFILE=mainnet' };
  }
  if (!cfg.enabled) {
    return {
      allowed: false,
      reason: cfg.disabledReason ?? 'delegated CMR disabled',
    };
  }
  return { allowed: true };
}

/**
 * Stricter gate for the delegated executor worker: everything writeGate
 * requires PLUS the explicit executor flag. Phase 1 keeps this closed.
 */
export function delegationExecGate(cfg: DelegationConfig): DelegationGate {
  const w = delegationWriteGate(cfg);
  if (!w.allowed) return w;
  if (!cfg.execEnabled) {
    return { allowed: false, reason: 'SEA_DELEGATED_EXEC_ENABLED!=1' };
  }
  return { allowed: true };
}
