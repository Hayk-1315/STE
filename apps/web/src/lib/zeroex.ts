// apps/web/src/lib/zeroex.ts
import { env, zeroExEP } from "@/lib/env";

/** Lee EP/chainId desde /dev/zeroex/sanity; si falla, usa env. */
export async function getZeroExDomainFallback(): Promise<{
  chainId: number;
  verifyingContract: `0x${string}`;
}> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  try {
    const r = await fetch(`${base}/dev/zeroex/sanity`, { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as { exchangeProxy?: string; chainId?: number };
      if (j.exchangeProxy && j.chainId) {
        return {
          chainId: j.chainId,
          verifyingContract: j.exchangeProxy as `0x${string}`,
        };
      }
    }
  } catch {
    /* ignore */
  }
  // Fallback dev
  return {
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0),
    verifyingContract: zeroExEP(),
  } as const;
}
