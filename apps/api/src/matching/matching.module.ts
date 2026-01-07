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

@Global()
@Module({
  imports: [forwardRef(() => PublicModule)],
  providers: [
    OrderBookService,
    PersistenceRepository,
    SnapshotService,
    EventsRepository,
    ExpirySweeperService,
    LobRehydratorService,
  ],
  exports: [
    OrderBookService,
    PersistenceRepository,
    SnapshotService,
    EventsRepository,
  ],
})
export class MatchingModule {}
