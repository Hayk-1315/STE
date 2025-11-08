// apps/api/src/config/env.ts
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
// Load root .env from the monorepo (apps/api -> ../.. -> .env)
dotenvConfig({ path: path.resolve(process.cwd(), '..', '..', '.env') });

import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === 'postgresql:' || u.protocol === 'postgres:';
      } catch {
        return false;
      }
    },
    { message: 'DATABASE_URL must be a valid postgres URL (postgresql://...)' },
  ),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): AppEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Use the new helper to avoid deprecated .format()
    const tree = z.treeifyError(parsed.error);
    // Keep logs helpful for CI while avoiding secrets
    console.error(JSON.stringify(tree, null, 2));
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
