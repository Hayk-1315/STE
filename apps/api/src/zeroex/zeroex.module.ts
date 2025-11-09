// apps/api/src/zeroex/zeroex.module.ts
import { Module, Global } from '@nestjs/common';
import { ZeroExAddressesService } from './addresses.service';
import { ZeroExSigningService } from './signing.service';
import { ZeroExTxBuildersService } from './tx-builders.service';
import { parseZeroExEnv, ZeroExConfig } from './zeroex.config';

@Global()
@Module({
  providers: [
    {
      provide: 'ZEROEX_CONFIG',
      useFactory: (): ZeroExConfig => parseZeroExEnv(process.env),
    },
    {
      provide: ZeroExAddressesService,
      inject: ['ZEROEX_CONFIG'],
      useFactory: (cfg: ZeroExConfig) => new ZeroExAddressesService(cfg),
    },
    ZeroExSigningService,
    ZeroExTxBuildersService,
  ],
  exports: [
    'ZEROEX_CONFIG',
    ZeroExAddressesService,
    ZeroExSigningService,
    ZeroExTxBuildersService,
  ],
})
export class ZeroExModule {}
