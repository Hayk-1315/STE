// apps/api/src/matching/matching.module.ts
import { Module } from '@nestjs/common';
import { OrderBookService } from './orderbook.service';
import { PersistenceRepository } from './persistence.repository';
import { SnapshotService } from './snapshot.service';

@Module({
  providers: [OrderBookService, PersistenceRepository, SnapshotService],
  exports: [OrderBookService, PersistenceRepository],
})
export class MatchingModule {}
