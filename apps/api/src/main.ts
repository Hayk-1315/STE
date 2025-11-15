import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3000,
    '0.0.0.0',
  );
  const url = await app.getUrl();
  Logger.log(`API listening at ${url}`);
}

// Explicitly mark the top-level async call
void bootstrap();
