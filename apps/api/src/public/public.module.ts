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

@Module({
  imports: [ZeroExModule],
  controllers: [
    PublicController,
    OrdersController,
    MatchController,
    OrdersQueryController,
    HealthController,
  ],
  providers: [PublicWsGateway, CancelWatcherService],
  exports: [PublicWsGateway],
})
export class PublicModule {}
