// apps/api/src/sea/delegated/session-signer.provider.ts
//
// Backend-held, policy-scoped SESSION signer. This is NOT the user's key and it
// cannot move funds outside the session policy (single target + selector +
// usage=1 + expiry + spend cap). It is the delegation "redeemer": its ADDRESS is
// embedded in the grant the user signs, and it signs the execution userOp hash
// with RAW ECDSA (the OwnableValidator recovers over the raw hash, per Phase 0).
//
// Secret handling: `DELEGATION_SESSION_SIGNER_PK` is server-only, loaded ONLY
// when delegated CMR is enabled on a writable profile (never on base-mainnet /
// READ_ONLY / flag-off), NEVER logged, NEVER returned to callers, and viem is
// dynamically imported so it stays off the default load path.
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { DelegationConfig } from './delegation.config';
import { DELEGATION_CONFIG } from './delegation-provider.interface';

@Injectable()
export class SessionSignerProvider {
  private readonly log = new Logger('DelegationSessionSigner');
  // Held in memory only; never logged, never serialized.
  private readonly pk?: string;

  constructor(@Inject(DELEGATION_CONFIG) cfg: DelegationConfig) {
    if (cfg.enabled) {
      const raw = (process.env.DELEGATION_SESSION_SIGNER_PK ?? '').trim();
      this.pk = raw.length > 0 ? raw : undefined;
      this.log.log(
        this.pk
          ? 'session signer configured'
          : 'session signer NOT configured (DELEGATION_SESSION_SIGNER_PK empty)',
      );
    } else {
      // Inert: base-mainnet / READ_ONLY / flag-off never load the key.
      this.pk = undefined;
    }
  }

  isAvailable(): boolean {
    return !!this.pk;
  }

  /** Public redeemer address (safe to expose). Null when unconfigured. */
  async getAddress(): Promise<string | null> {
    if (!this.pk) return null;
    const { privateKeyToAccount } = await import('viem/accounts');
    return privateKeyToAccount(this.norm()).address;
  }

  /** Raw-ECDSA sign of a userOp hash (no EIP-191 prefix). */
  async signUserOpHash(hash: `0x${string}`): Promise<`0x${string}`> {
    if (!this.pk) throw new Error('session signer unavailable');
    const { privateKeyToAccount } = await import('viem/accounts');
    return privateKeyToAccount(this.norm()).sign({ hash });
  }

  /**
   * A viem LocalAccount for the session key. The account holds the key in a
   * closure and never exposes the raw hex, so the provider can sign without the
   * secret leaving this module. Null when unconfigured.
   */
  async toLocalAccount(): Promise<unknown> {
    if (!this.pk) return null;
    const { privateKeyToAccount } = await import('viem/accounts');
    return privateKeyToAccount(this.norm());
  }

  private norm(): `0x${string}` {
    const p = this.pk as string;
    return (p.startsWith('0x') ? p : `0x${p}`) as `0x${string}`;
  }
}
