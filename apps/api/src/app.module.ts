import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeroExModule } from './zeroex/zeroex.module';
import { DevModule } from './dev/dev.module';
import { EngineModule } from './dev/engine.module';
import { MatchingModule } from './matching/matching.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MatchingModule, // global LOB + repos
    ZeroExModule, // 0x signing + addresses
    PublicModule, // REST/WS públicos
    ...(process.env.NODE_ENV !== 'production' ? [DevModule, EngineModule] : []), // /dev/*
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
