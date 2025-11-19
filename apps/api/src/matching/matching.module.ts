// apps/api/src/matching/matching.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { OrderBookService } from './orderbook.service';
import { PersistenceRepository } from './persistence.repository';
import { SnapshotService } from './snapshot.service';
import { Global } from '@nestjs/common';
import { PublicModule } from '../public/public.module';

@Global()
@Module({
  imports: [forwardRef(() => PublicModule) /* ... */],
  providers: [OrderBookService, PersistenceRepository, SnapshotService],
  exports: [OrderBookService, PersistenceRepository],
})
export class MatchingModule {}
