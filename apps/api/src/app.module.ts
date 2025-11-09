import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeroExModule } from './zeroex/zeroex.module';
import { DevModule } from './dev/dev.module';

const controllersOrImports = [ZeroExModule];
if (process.env.NODE_ENV !== 'production') {
  controllersOrImports.push(DevModule);
}

@Module({
  //imports: [],
  controllers: [AppController],
  providers: [AppService],
  imports: controllersOrImports,
})
export class AppModule {}
