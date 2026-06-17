// apps/api/src/sea/ai/ai.module.ts
// SEA AI Assist (Phase 1A) module. Provides the stateless parse endpoint and
// binds the active provider behind the AI_INTENT_PROVIDER token so it can be
// swapped without touching the parser/validator. PersistenceRepository and
// OrderBookService are reachable via the @Global MatchingModule.
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiParserService } from './ai-parser.service';
import { AI_INTENT_PROVIDER } from './provider/ai-provider.interface';
import { AnthropicIntentProvider } from './provider/anthropic.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiParserService,
    { provide: AI_INTENT_PROVIDER, useClass: AnthropicIntentProvider },
  ],
  exports: [AiParserService],
})
export class AiModule {}
