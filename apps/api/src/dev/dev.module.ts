// apps/api/src/dev/dev.module.ts
import { Module } from '@nestjs/common';
import { DevZeroExController } from './dev.controller';
import { ZeroExModule } from '../zeroex/zeroex.module';

@Module({
  imports: [ZeroExModule],
  controllers: [DevZeroExController],
})
export class DevModule {}
