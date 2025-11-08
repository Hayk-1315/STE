import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Read validated environment (typed)
  const env = loadEnv();

  // Listen on typed PORT (default handled by schema)
  await app.listen(env.PORT);
}

// Explicitly mark the top-level async call
void bootstrap();
