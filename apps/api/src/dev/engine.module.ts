// apps/api/src/dev/engine.module.ts
import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';

@Module({
  controllers: [EngineController],
})
export class EngineModule {}
