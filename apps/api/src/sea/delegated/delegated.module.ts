// apps/api/src/sea/delegated/delegated.module.ts
//
// Delegated CMR DI wiring. Additive and self-contained: imported by AppModule so
// nothing in the existing SEA module changes. The feature is inert by default
// (see delegation.config / delegation.guard). The real Biconomy provider is only
// instantiated when `SEA_DELEGATED_PROVIDER=biconomy` AND the feature is enabled;
// otherwise the mock/noop provider is used and the SDK is never touched.
import { Module } from '@nestjs/common';
import {
  resolveDelegationConfig,
  type DelegationConfig,
} from './delegation.config';
import {
  DELEGATION_CONFIG,
  DELEGATION_PROVIDER,
  type DelegationProvider,
} from './delegation-provider.interface';
import { MockDelegationProvider } from './mock-delegation.provider';
import { BiconomyDelegationProvider } from './biconomy-delegation.provider';
import { SessionSignerProvider } from './session-signer.provider';
import { DelegationGrantRepository } from './delegation-grant.repository';
import { DelegatedExecutionAuditRepository } from './delegated-execution-audit.repository';
import { DelegatedIntentTransitionRepository } from './delegated-intent-transition.repository';
import { DelegatedFillBuilder } from './delegated-fill.builder';
import { DelegatedFillReconcilerService } from './delegated-fill-reconciler.service';
import { DelegationService } from './delegation.service';
import { DelegatedExecutorWorker } from './delegated-executor.worker';
import { DelegatedController } from './delegated.controller';

@Module({
  controllers: [DelegatedController],
  providers: [
    {
      provide: DELEGATION_CONFIG,
      useFactory: () => resolveDelegationConfig(process.env),
    },
    SessionSignerProvider,
    {
      // Real provider only when explicitly selected AND enabled; else mock.
      // Biconomy's SDK is dynamically imported inside its methods, so even this
      // instantiation loads nothing until a real call runs (never in CI).
      provide: DELEGATION_PROVIDER,
      inject: [DELEGATION_CONFIG, SessionSignerProvider],
      useFactory: (
        cfg: DelegationConfig,
        signer: SessionSignerProvider,
      ): DelegationProvider =>
        cfg.provider === 'BICONOMY' && cfg.enabled
          ? new BiconomyDelegationProvider(cfg, signer)
          : new MockDelegationProvider(),
    },
    DelegationGrantRepository,
    DelegatedExecutionAuditRepository,
    DelegatedIntentTransitionRepository,
    DelegatedFillBuilder,
    DelegatedFillReconcilerService,
    DelegationService,
    DelegatedExecutorWorker,
  ],
  exports: [DELEGATION_CONFIG, DelegationService],
})
export class DelegatedModule {}
