// apps/api/src/observability/zeroex-health.service.ts
import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ZeroExAddressesService } from '../zeroex/addresses.service';
import type { ZeroExConfig } from '../zeroex/zeroex.config';

const OFFICIAL: Record<number, { ep: `0x${string}`; spender: `0x${string}` }> =
  {
    // Base mainnet
    8453: {
      ep: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      spender: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    },
    // Ethereum mainnet (por si lo usas)
    1: {
      ep: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      spender: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    },
    // añade otras chains si te interesan
  };

@Injectable()
export class ZeroexHealthService implements OnModuleInit {
  private readonly log = new Logger('ZeroExHealth');

  constructor(
    private readonly addrs: ZeroExAddressesService,
    @Inject('ZEROEX_CONFIG') private readonly cfg: ZeroExConfig,
  ) {}

  onModuleInit() {
    const chainId = Number(process.env.CHAIN_ID ?? 0);
    const resolved = this.addrs.resolve();
    const configuredEp = (resolved.exchangeProxy || '').toLowerCase();
    const configuredSpender = (
      process.env.ZEROEX_ALLOWANCE_SPENDER || configuredEp
    ).toLowerCase();

    const official = OFFICIAL[chainId];
    if (!official) {
      this.log.warn(
        `No allow-list oficial para chainId=${chainId}. EP=${configuredEp} spender=${configuredSpender}`,
      );
      return;
    }

    const okEp = configuredEp === official.ep.toLowerCase();
    const okSp = configuredSpender === official.spender.toLowerCase();

    if (okEp && okSp) {
      this.log.log(`0x addresses OK (chainId=${chainId}). EP=${configuredEp}`);
    } else {
      if (!okEp)
        this.log.warn(
          `EP mismatch: configured=${configuredEp} expected=${official.ep}`,
        );
      if (!okSp)
        this.log.warn(
          `Spender mismatch: configured=${configuredSpender} expected=${official.spender}`,
        );
    }
  }
}
