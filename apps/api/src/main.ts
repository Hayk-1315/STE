// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import 'dotenv/config';

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

(() => {
  // Si DATABASE_URL ya existe, asumimos que dotenv/config funcionó y no hacemos nada
  if (process.env.DATABASE_URL) return;

  const candidates = [
    path.resolve(process.cwd(), '../../.env'), // si CWD=apps/api
    path.resolve(__dirname, '../../.env'), // dist/src → ../../.env
    path.resolve(__dirname, '../../../.env'), // por si cambia la salida
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
})();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS allowlist from env ---
  const raw = process.env.API_CORS_ORIGINS ?? '';
  const allowlist: readonly string[] = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Local, strongly typed signatures (avoid "any")
  type OriginCallback = (err: Error | null, allow?: boolean) => void;
  type CustomOriginFn = (
    origin: string | undefined,
    callback: OriginCallback,
  ) => void;

  const originFn: CustomOriginFn = (requestOrigin, callback) => {
    // Allow non-browser clients (no Origin header)
    if (!requestOrigin) {
      callback(null, true);
      return;
    }
    if (allowlist.includes(requestOrigin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
  };

  const corsOptions: CorsOptions = {
    origin: originFn,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);
  console.log('[CORS] allowlist:', allowlist);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
