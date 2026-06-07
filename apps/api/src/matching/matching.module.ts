// apps/api/src/matching/matching.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { OrderBookService } from './orderbook.service';
import { PersistenceRepository } from './persistence.repository';
import { SnapshotService } from './snapshot.service';
import { Global } from '@nestjs/common';
import { PublicModule } from '../public/public.module';
import { EventsRepository } from './events.repository';
import { ExpirySweeperService } from './expiry-sweeper.service';
import { LobRehydratorService } from './lob-rehydrator.service';
import { OrdersPlacementService } from './orders-placement.service';
import { MetricsModule } from '../observability/metrics.module';

@Global()
@Module({
  // OrdersPlacementService (Phase 3) injects MetricsService and
  // ShadowChecksService — bring those in via MetricsModule and the
  // existing forwardRef'd PublicModule (which now exports ShadowChecks).
  imports: [forwardRef(() => PublicModule), MetricsModule],
  providers: [
    OrderBookService,
    PersistenceRepository,
    SnapshotService,
    EventsRepository,
    ExpirySweeperService,
    LobRehydratorService,
    OrdersPlacementService,
  ],
  exports: [
    OrderBookService,
    PersistenceRepository,
    SnapshotService,
    EventsRepository,
    OrdersPlacementService,
  ],
})
export class MatchingModule {}
