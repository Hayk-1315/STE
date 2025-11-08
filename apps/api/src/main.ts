import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate env at startup (typed via Zod)
  const env = loadEnv();
  
  // Use env PORT when available; default to 3001 to avoid Next.js conflict
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
}
bootstrap();
