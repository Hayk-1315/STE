import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeroExModule } from './zeroex/zeroex.module';
import { DevModule } from './dev/dev.module';
import { EngineModule } from './dev/engine.module';
import { MatchingModule } from './matching/matching.module';
import { ScheduleModule } from '@nestjs/schedule';

const imports: any[] = [ZeroExModule, MatchingModule];
if (process.env.NODE_ENV !== 'production') {
  imports.push(DevModule, EngineModule);
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MatchingModule,
    EngineModule,
    // ZeroExModule, DevModule, ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
