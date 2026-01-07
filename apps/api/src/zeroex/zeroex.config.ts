// apps/api/src/zeroex/zeroex.config.ts
import { z } from 'zod';

export const ZeroExEnvSchema = z.object({
  CHAIN_ID: z.coerce.number().int().positive(),
  RPC_URL_READONLY: z.url().or(z.string().min(1)),
  ZEROEX_EXCHANGE_PROXY: z.string().optional().nullable(),
  ZEROEX_ALLOWANCE_SPENDER: z.string().optional().nullable(),
  FEE_RECIPIENT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid feeRecipient address'),
});

export type ZeroExEnv = z.infer<typeof ZeroExEnvSchema>;

export interface ZeroExConfig {
  chainId: number;
  rpcUrl: string;
  exchangeProxy?: string;
  allowanceSpender?: string;
  feeRecipient: string;
}

export function parseZeroExEnv(env: NodeJS.ProcessEnv): ZeroExConfig {
  const p = ZeroExEnvSchema.parse(env);
  return {
    chainId: p.CHAIN_ID,
    rpcUrl: p.RPC_URL_READONLY,
    exchangeProxy: p.ZEROEX_EXCHANGE_PROXY ?? undefined,
    allowanceSpender: p.ZEROEX_ALLOWANCE_SPENDER ?? undefined,
    feeRecipient: p.FEE_RECIPIENT,
  };
}
