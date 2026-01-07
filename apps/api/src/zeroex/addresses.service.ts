// apps/api/src/zeroex/addresses.service.ts
// imports (asegúrate de tener el type-only import)
import { Injectable } from '@nestjs/common';
import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
import type { ZeroExConfig } from './zeroex.config';

/**
 * Known Permit2/AllowanceHolder spender for Cancun chains (incl. Base).
 * Source: 0x cheat sheet / contracts docs.
 */
const PERMIT2_ALLOWANCE_HOLDER = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';

@Injectable()
export class ZeroExAddressesService {
  constructor(private readonly cfg: ZeroExConfig) {}

  /** Resolve Exchange Proxy and allowance spender for current chain. */
  resolve(): { exchangeProxy: string; allowanceSpender: string } {
    // 1) Prefer explicit config
    let exchangeProxy = this.cfg.exchangeProxy;
    let allowanceSpender = this.cfg.allowanceSpender;

    // 2) Try official package for EP (typed, sin `any`)
    if (!exchangeProxy) {
      try {
        const chainParam = this.cfg.chainId as Parameters<
          typeof getContractAddressesForChainOrThrow
        >[0];

        // Tipamos el retorno a lo que nos interesa leer
        const set = getContractAddressesForChainOrThrow(
          chainParam,
        ) as unknown as {
          exchangeProxy?: string;
        };

        if (set.exchangeProxy) {
          exchangeProxy = set.exchangeProxy;
        }
      } catch {
        // ignore; will require env
      }
    }

    // 3) Allowance spender: prefer env; else assume Permit2/AllowanceHolder (modern flows)
    if (!allowanceSpender) {
      allowanceSpender = PERMIT2_ALLOWANCE_HOLDER;
    }

    if (!exchangeProxy) {
      throw new Error(
        `Missing 0x Exchange Proxy for chainId=${this.cfg.chainId}. ` +
          `Set ZEROEX_EXCHANGE_PROXY or use a supported chain in @0x/contract-addresses.`,
      );
    }

    return { exchangeProxy, allowanceSpender };
  }
}
