import { env, zeroExEP } from "@/lib/env";

/** Read EP from /readyz; fallback to env. */
export async function getZeroExDomainFallback(): Promise<{
  chainId: number;
  verifyingContract: `0x${string}`;
}> {
  const base = env().NEXT_PUBLIC_API_BASE_URL;
  try {
    const r = await fetch(`${base}/readyz`, { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as { exchangeProxy?: string } | null;
      const ep = (j?.exchangeProxy as `0x${string}` | undefined) ?? zeroExEP();
      return {
        chainId: env().NEXT_PUBLIC_CHAIN_ID,
        verifyingContract: ep,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    chainId: env().NEXT_PUBLIC_CHAIN_ID,
    verifyingContract: zeroExEP(),
  } as const;
}
