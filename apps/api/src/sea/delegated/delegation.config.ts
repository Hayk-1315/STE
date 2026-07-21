// apps/api/src/sea/delegated/delegation.config.ts
//
// Profile-keyed delegation config, resolved from env. Multi-profile from the
// first commit: `ethereum-sepolia` (writable) and `base-mainnet` (implementation
// -ready but HARD-DISABLED / read-only at runtime). Never Sepolia-only.
//
// Secure-by-default: an unknown/unset profile resolves to `base-mainnet`
// (non-writable), and the feature is disabled unless every gate opens.
import { z } from 'zod';
import type {
  DelegationProfile,
  DelegationAccountModel,
  DelegationProviderKind,
} from './delegated.types';

export const DelegationEnvSchema = z.object({
  PROFILE: z.string().optional().nullable(),
  CHAIN_ID: z.coerce.number().int().positive().optional(),
  READ_ONLY: z.string().optional().nullable(),
  // Master feature flag for delegated CMR. Default OFF.
  SEA_DELEGATED_ENABLED: z.string().optional().nullable(),
  // Executor worker gate (Phase 2+). Default OFF; never boots in Phase 1.
  SEA_DELEGATED_EXEC_ENABLED: z.string().optional().nullable(),
  // Provider selection. Phase 1 only ships the mock/noop provider.
  SEA_DELEGATED_PROVIDER: z.string().optional().nullable(),
  ZEROEX_EXCHANGE_PROXY: z.string().optional().nullable(),
  ZEROEX_ALLOWANCE_SPENDER: z.string().optional().nullable(),
  // Reference-only addresses/URLs (inert until a later phase). Never secrets.
  DELEGATION_NEXUS_IMPLEMENTATION: z.string().optional().nullable(),
  // Nexus account factory (NEXUS_SA account model). Deterministic CREATE2
  // deployer; used to derive the counterfactual SA from the owner ADDRESS and to
  // report deploy state. Non-secret.
  DELEGATION_NEXUS_FACTORY: z.string().optional().nullable(),
  DELEGATION_SMART_SESSIONS_MODULE: z.string().optional().nullable(),
  DELEGATION_BUNDLER_URL: z.string().optional().nullable(),
  // NON-SECRET label pointing at the backend-held session signer. Never a key.
  DELEGATION_EXECUTOR_KEY_REF: z.string().optional().nullable(),
});

export type DelegationEnv = z.infer<typeof DelegationEnvSchema>;

/** Static per-profile facts. `base-mainnet.writable` is ALWAYS false. */
export const DELEGATION_PROFILE_DEFAULTS: Record<
  DelegationProfile,
  { chainId: number; writable: boolean }
> = {
  'ethereum-sepolia': { chainId: 11155111, writable: true },
  // Implementation-ready but hard-disabled/read-only at runtime.
  'base-mainnet': { chainId: 8453, writable: false },
};

export interface DelegationConfig {
  profile: DelegationProfile;
  chainId: number;
  /** false for base-mainnet ALWAYS (hard-disabled/read-only). */
  writable: boolean;
  /** Feature usable at runtime: writable && flag && !READ_ONLY && provider ok. */
  enabled: boolean;
  /** Executor worker allowed to boot: enabled && SEA_DELEGATED_EXEC_ENABLED. */
  execEnabled: boolean;
  provider: DelegationProviderKind;
  accountModelDefault: DelegationAccountModel;
  exchangeProxy?: string;
  allowanceSpender?: string;
  nexusImplementation?: string;
  /** Nexus account factory for the NEXUS_SA model (counterfactual SA + deploy). */
  nexusFactory?: string;
  smartSessionsModule?: string;
  bundlerUrl?: string;
  executorKeyRef?: string;
  /** v1 gas model: user/account-funded, no paymaster/sponsorship. */
  gas: { model: 'account-funded'; paymaster: false };
  /** Human-readable reason when disabled (for logs + tests). */
  disabledReason?: string;
}

function clean(v: string | null | undefined): string | undefined {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Map the repo's PROFILE (`sepolia` | `mainnet` | `dev` | …) + CHAIN_ID onto a
 * delegation profile. Unknown → `base-mainnet` (non-writable) as the safe default.
 */
export function resolveDelegationProfile(
  env: DelegationEnv,
): DelegationProfile {
  const p = (env.PROFILE ?? '').trim().toLowerCase();
  if (p === 'sepolia' || p === 'ethereum-sepolia') return 'ethereum-sepolia';
  if (p === 'mainnet' || p === 'base-mainnet' || p === 'base')
    return 'base-mainnet';
  if (env.CHAIN_ID === 11155111) return 'ethereum-sepolia';
  if (env.CHAIN_ID === 8453) return 'base-mainnet';
  return 'base-mainnet';
}

export function resolveDelegationProviderKind(
  env: DelegationEnv,
): DelegationProviderKind {
  const raw = (env.SEA_DELEGATED_PROVIDER ?? 'mock').trim().toLowerCase();
  // Phase 1 only ships the mock provider; `biconomy` is recorded but not wired.
  return raw === 'biconomy' ? 'BICONOMY' : 'MOCK';
}

export function resolveDelegationConfig(
  rawEnv: NodeJS.ProcessEnv | DelegationEnv,
): DelegationConfig {
  const env = DelegationEnvSchema.parse(rawEnv);
  const profile = resolveDelegationProfile(env);
  const facts = DELEGATION_PROFILE_DEFAULTS[profile];
  const provider = resolveDelegationProviderKind(env);

  const readOnly = (env.READ_ONLY ?? '').trim() === 'true';
  const flagOn = (env.SEA_DELEGATED_ENABLED ?? '').trim() === '1';
  const execFlagOn = (env.SEA_DELEGATED_EXEC_ENABLED ?? '').trim() === '1';

  let disabledReason: string | undefined;
  if (!facts.writable) disabledReason = `profile ${profile} is read-only`;
  else if (readOnly) disabledReason = 'READ_ONLY=true';
  else if (!flagOn) disabledReason = 'SEA_DELEGATED_ENABLED!=1';

  const enabled = facts.writable && !readOnly && flagOn;
  const execEnabled = enabled && execFlagOn;

  return {
    profile,
    chainId: env.CHAIN_ID ?? facts.chainId,
    writable: facts.writable,
    enabled,
    execEnabled,
    provider,
    accountModelDefault: 'EIP7702',
    exchangeProxy: clean(env.ZEROEX_EXCHANGE_PROXY),
    allowanceSpender: clean(env.ZEROEX_ALLOWANCE_SPENDER),
    nexusImplementation: clean(env.DELEGATION_NEXUS_IMPLEMENTATION),
    nexusFactory: clean(env.DELEGATION_NEXUS_FACTORY),
    smartSessionsModule: clean(env.DELEGATION_SMART_SESSIONS_MODULE),
    bundlerUrl: clean(env.DELEGATION_BUNDLER_URL),
    executorKeyRef: clean(env.DELEGATION_EXECUTOR_KEY_REF),
    gas: { model: 'account-funded', paymaster: false },
    disabledReason,
  };
}
