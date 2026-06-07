// apps/api/src/onchain/cancel-pair-floor.module.ts
//
// Tiny @Global module so CancelPairFloorRepository is reachable from both
// CancelWatcherService (writer, in PublicModule) and IntentValidatorService
// (reader, in SeaModule) without adding new module-import edges or a
// forwardRef chain. Smaller wiring than registering the repo at AppModule
// level (where it would not be visible to feature modules) and cleaner
// than colocating it in MatchingModule (which has no on-chain concerns).
import { Global, Module } from '@nestjs/common';
import { CancelPairFloorRepository } from './cancel-pair-floor.repository';

@Global()
@Module({
  providers: [CancelPairFloorRepository],
  exports: [CancelPairFloorRepository],
})
export class CancelPairFloorModule {}
