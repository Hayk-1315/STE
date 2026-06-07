// apps/api/src/public/public.module.ts
import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicWsGateway } from './public.ws';
import { ZeroExModule } from '../zeroex/zeroex.module';
import { OrdersController } from './orders.controller';
import { MatchController } from './match.controller';
import { OrdersQueryController } from './orders.query.controller';
import { CancelWatcherService } from '../onchain/cancel-watcher.service';
import { HealthController } from './health.controller';
import { MetricsModule } from '../observability/metrics.module';
import { ShadowChecksService } from '../observability/shadow-checks.service';

@Module({
  imports: [ZeroExModule, MetricsModule],
  controllers: [
    PublicController,
    OrdersController,
    MatchController,
    OrdersQueryController,
    HealthController,
  ],
  providers: [PublicWsGateway, CancelWatcherService, ShadowChecksService],
  // ShadowChecksService is consumed by OrdersPlacementService in MatchingModule
  // (Phase 3 extraction) — export so the forwardRef-imported MatchingModule
  // can inject it.
  exports: [PublicWsGateway, ShadowChecksService],
})
export class PublicModule {}
