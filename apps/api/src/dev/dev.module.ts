// apps/api/src/dev/dev.module.ts
import { Module } from '@nestjs/common';
import { DevZeroExController } from './dev.controller';

@Module({
  controllers: [DevZeroExController],
})
export class DevModule {}
