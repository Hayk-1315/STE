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
