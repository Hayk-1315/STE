// imports (añade Inject y el type-only import)
import { Controller, Get, Inject } from '@nestjs/common';
import { ZeroExAddressesService } from '../zeroex/addresses.service';
import type { ZeroExConfig } from '../zeroex/zeroex.config';

@Controller('dev/zeroex')
export class DevZeroExController {
  constructor(
    private readonly addr: ZeroExAddressesService,
    @Inject('ZEROEX_CONFIG') private readonly cfg: ZeroExConfig,
  ) {}

  @Get('sanity')
  sanity() {
    const { exchangeProxy, allowanceSpender } = this.addr.resolve();
    return {
      chainId: this.cfg.chainId,
      exchangeProxy,
      allowanceSpender,
    };
  }
}
