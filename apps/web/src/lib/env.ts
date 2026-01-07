// apps/web/src/lib/env.ts
// Purpose: Strongly-typed, runtime-validated public env for the Next.js app.
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .transform((s) => new URL(s))
    .refine((u) => ["http:", "https:"].includes(u.protocol), "Invalid protocol")
    .transform((u) => u.toString().replace(/\/+$/, "")),
  NEXT_PUBLIC_CHAIN_ID: z.string().regex(/^\d+$/).transform(Number),
  NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_RPC_URL: z
    .string()
    .optional()
    .transform((s) => (s ? new URL(s).toString() : undefined)),
  NEXT_PUBLIC_ZEROEX_EXCHANGE_PROXY: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
});

type Env = z.infer<typeof schema>;
let _cache: Env | null = null;

export function env(): Env {
  if (_cache) return _cache;
  const parsed = schema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_ZEROEX_EXCHANGE_PROXY: process.env.NEXT_PUBLIC_ZEROEX_EXCHANGE_PROXY,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`[env] Invalid NEXT_PUBLIC_* config → ${issues}`);
  }
  _cache = parsed.data;
  return _cache;
}

export function rpcUrl(): string {
  const e = env();
  if (e.NEXT_PUBLIC_RPC_URL) return e.NEXT_PUBLIC_RPC_URL;
  // Sensible defaults for Base
  if (e.NEXT_PUBLIC_CHAIN_ID === 8453) return "https://mainnet.base.org";
  if (e.NEXT_PUBLIC_CHAIN_ID === 84532) return "https://sepolia.base.org";
  // Fallback local
  return "http://localhost:8545";
}

export function zeroExEP(): `0x${string}` {
  return env().NEXT_PUBLIC_ZEROEX_EXCHANGE_PROXY as `0x${string}`;
}
