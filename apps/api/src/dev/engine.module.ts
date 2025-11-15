// apps/api/src/dev/engine.module.ts
import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [MatchingModule],
  controllers: [EngineController],
})
export class EngineModule {}
