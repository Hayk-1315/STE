// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeroExModule } from './zeroex/zeroex.module';
import { DevModule } from './dev/dev.module';
import { EngineModule } from './dev/engine.module';
import { MatchingModule } from './matching/matching.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PublicModule } from './public/public.module';
import { FillWatcherService } from './onchain/fill-watcher.service';
import { MetricsModule } from './observability/metrics.module';
import { ZeroexHealthService } from './observability/zeroex-health.service';
import { ShadowChecksService } from './observability/shadow-checks.service';
import { LobRehydratorService } from './matching/lob-rehydrator.service';
import { ConfigModule } from '@nestjs/config';
import { SeaModule } from './sea/sea.module';
import { DelegatedModule } from './sea/delegated/delegated.module';
import { CancelPairFloorModule } from './onchain/cancel-pair-floor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // <-- CLAVE para no leer .env de la raíz
    }),
    ScheduleModule.forRoot(),
    MatchingModule, // global LOB + repos
    ZeroExModule, // 0x signing + addresses
    PublicModule, // REST/WS públicos
    MetricsModule,
    CancelPairFloorModule, // Phase 3.x-b: on-chain cancelPair floor (global)
    SeaModule, // SEA v1 substrate (Phase 1)
    DelegatedModule, // Delegated CMR scaffold (Phase 1; inert/disabled by default)
    ...(process.env.NODE_ENV !== 'production' ? [DevModule, EngineModule] : []), // /dev/*
  ],

  controllers: [AppController],
  providers: [
    AppService,
    FillWatcherService,
    ZeroexHealthService,
    ShadowChecksService,
    LobRehydratorService,
  ],
})
export class AppModule {}
