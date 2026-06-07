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
  NEXT_PUBLIC_PROFILE: z.string().optional(),
  // Phase 5: Conditional / SEA UI gate. Defaults to "false" — the Conditional
  // tab keeps its disabled placeholder unless this is explicitly set to "true".
  // Independent of NEXT_PUBLIC_READ_ONLY / NEXT_PUBLIC_PROFILE: when SEA is
  // enabled in a read-only or mainnet profile, the tab is visible but SEA
  // ACTIONS (create / cancel / execute) are disabled (read-only toast),
  // identical to how Market/Limit submit buttons behave today.
  NEXT_PUBLIC_SEA_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_READ_ONLY: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_TAKER_FEE_BPS: z.string().regex(/^\d+$/).optional(),
  NEXT_PUBLIC_TAKER_FEE_RECIPIENT: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address")
    .optional(),
  NEXT_PUBLIC_WEB3AUTH_NETWORK: z.enum(["sapphire_mainnet", "sapphire_devnet"]).optional(),
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
    NEXT_PUBLIC_PROFILE: process.env.NEXT_PUBLIC_PROFILE,
    NEXT_PUBLIC_SEA_ENABLED: process.env.NEXT_PUBLIC_SEA_ENABLED,
    NEXT_PUBLIC_READ_ONLY: process.env.NEXT_PUBLIC_READ_ONLY,
    NEXT_PUBLIC_TAKER_FEE_BPS: process.env.NEXT_PUBLIC_TAKER_FEE_BPS,
    NEXT_PUBLIC_TAKER_FEE_RECIPIENT: process.env.NEXT_PUBLIC_TAKER_FEE_RECIPIENT,
    NEXT_PUBLIC_WEB3AUTH_NETWORK: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
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
  if (e.NEXT_PUBLIC_CHAIN_ID === 11155111) return "https://rpc.sepolia.org";
  // Fallback local
  return "http://localhost:8545";
}

export function zeroExEP(): `0x${string}` {
  return env().NEXT_PUBLIC_ZEROEX_EXCHANGE_PROXY as `0x${string}`;
}
