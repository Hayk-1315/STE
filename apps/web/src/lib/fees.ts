// apps/web/src/lib/fees.ts
import { env } from "@/lib/env";

export function short(addr?: string) {
  if (!addr || addr.length < 10) return addr ?? "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function getFeeInfo() {
  const profile = (env().NEXT_PUBLIC_PROFILE ?? "").toLowerCase(); // "sepolia" | "mainnet"
  const bps = Number(env().NEXT_PUBLIC_TAKER_FEE_BPS ?? "0"); // e.g. 10 = 0.10%
  const recipient = env().NEXT_PUBLIC_TAKER_FEE_RECIPIENT ?? ""; // 0x...
  const pct = (bps / 100).toFixed(2); // "0.10"
  return { profile, bps, pct, recipient, recipientShort: short(recipient) };
}
