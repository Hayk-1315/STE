// apps/web/src/lib/explorer.ts
import { env } from "@/lib/env";

export function basescanBaseUrl(): string {
  const cid = Number(env().NEXT_PUBLIC_CHAIN_ID);
  return cid === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org";
}

export function addrUrl(addr: `0x${string}`): string {
  return `${basescanBaseUrl()}/address/${addr}`;
}

export function txUrl(txHash: `0x${string}`): string {
  return `${basescanBaseUrl()}/tx/${txHash}`;
}
