// apps/api/src/sea/sea.module.ts
// SEA v1 Phase 2: substrate + deterministic structured-intent validator.
// Monitor, fire path, and AI services are added in later phases.
//
// DI notes:
//  - ZeroExModule is `@Global()` → ZeroExSigningService is reachable here
//    without an explicit `imports:` entry.
//  - MatchingModule is `@Global()` → PersistenceRepository is reachable here
//    too. Both are consumed read-only.
import { Module } from '@nestjs/common';
import { SeaController } from './sea.controller';
import { IntentService } from './intent.service';
import { IntentRepository } from './intent.repository';
import { IntentEventRepository } from './intent-event.repository';
import { IntentValidatorService } from './intent-validator.service';
import { IntentFireService } from './intent-fire.service';
import { IntentMonitorService } from './intent-monitor.service';
import { IntentExpirySweeperService } from './intent-expiry-sweeper.service';
import { IntentExecutingSweeperService } from './intent-executing-sweeper.service';
import { CmrPrepareService } from './cmr-prepare.service';
import { AiModule } from './ai/ai.module';

@Module({
  // Phase 6 (AI Assist): stateless NL parse endpoint, layered on top.
  imports: [AiModule],
  controllers: [SeaController],
  providers: [
    IntentService,
    IntentRepository,
    IntentEventRepository,
    IntentValidatorService,
    // Phase 3: opt-in CL fire path (SEA_MONITOR_ENABLED=1).
    IntentFireService,
    IntentMonitorService,
    // Phase 3.x-a: default-on intent expiry sweeper (DRAFT/ACTIVE only).
    IntentExpirySweeperService,
    // Phase 4.x-d: opt-in stale EXECUTING sweeper
    // (SEA_EXECUTING_SWEEP_ENABLED=1; hard-disabled in READ_ONLY/mainnet).
    IntentExecutingSweeperService,
    // Phase 4: opt-in CMR readiness path
    // (SEA_MONITOR_ENABLED=1 AND SEA_CMR_PREPARE_ENABLED=1).
    CmrPrepareService,
  ],
  exports: [
    IntentService,
    IntentRepository,
    IntentEventRepository,
    IntentValidatorService,
    IntentFireService,
    IntentMonitorService,
    IntentExpirySweeperService,
    IntentExecutingSweeperService,
    CmrPrepareService,
  ],
})
export class SeaModule {}
