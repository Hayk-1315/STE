import { ethers } from "ethers";

export const SALT_OFFSET = BigInt(1) << BigInt(128); // 2^128

// Invalida TODO lo anterior al momento actual en el esquema 256-bit (OFFSET + ts<<96)
export function minValidSaltAtNow(): string {
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  return (SALT_OFFSET + (nowSec << BigInt(96))).toString();
}

// Variante: invalida lo anterior a (ahora - deltaSec)
export function minValidSaltOlderThan(deltaSec: number): string {
  const t = BigInt(Math.max(0, Math.floor(Date.now() / 1000) - deltaSec));
  return (SALT_OFFSET + (t << BigInt(96))).toString();
}

// Si alguna vez subiste a EXACTO 2^128 (legacy wipe), y quieres un “mínimo seguro”:
export const MINVALID_AFTER_LEGACY = (SALT_OFFSET + BigInt(1)).toString();
