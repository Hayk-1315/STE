// apps/web/env.ts
import { z } from 'zod';

const WebEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url()
});

export type WebEnv = z.infer<typeof WebEnvSchema>;

export function getWebEnv(): WebEnv {
  const parsed = WebEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.format());
    throw new Error('Invalid web environment variables');
  }
  return parsed.data;
}
