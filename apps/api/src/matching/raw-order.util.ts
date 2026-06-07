// apps/api/src/matching/raw-order.util.ts
//
// Phase 5 P0 fix: pure helpers shared by `attachRawToOrder` /
// `findRawOrderByHash` / `OrdersPlacementService.place`. The on-chain 0x v4
// ABI requires the signature as a 4-field tuple
//   (uint8 signatureType, uint8 v, bytes32 r, bytes32 s)
// where signatureType discriminates between EIP712 (2) and ETHSIGN (3).
// Previously the repo stored only the 65-byte `r||s||v` hex, which silently
// defaulted to EIP712 at fill time — fills against ETHSIGN-signed orders
// would revert. The fix packs the full tuple into a 66-byte buffer:
//
//   [0]       signatureType (1 byte: 2 or 3)
//   [1..33)   r (32 bytes)
//   [33..65)  s (32 bytes)
//   [65]      v (1 byte: 27 or 28)
//
// Anything that doesn't round-trip cleanly is treated as missing raw, so
// legacy 0-byte or 65-byte rows surface as `missing_raw` to /match/quote
// instead of producing a malformed fill tx.

import type { LimitOrder } from '../zeroex/limit-order.types';

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion --
 * tsc infers 0x-prefixed template-literal results as plain string, so the
 * 0x${string} hex casts below are load-bearing; this rule false-positives. */

export type ZeroExSigTuple = {
  signatureType: 2 | 3;
  v: 27 | 28;
  r: `0x${string}`;
  s: `0x${string}`;
};

const HEX32_RE = /^0x[0-9a-fA-F]{64}$/;

function isHex32(v: unknown): v is `0x${string}` {
  return typeof v === 'string' && HEX32_RE.test(v);
}

/**
 * Normalise a signature into the canonical 0x v4 tuple.
 *
 * Accepts:
 *   - 65-byte 0x hex string (r||s||v). Defaults `signatureType=2` (EIP712).
 *     `v` raw bytes 0/1 are lifted to 27/28.
 *   - `{ signatureType, v, r, s }` tuple. Validates r/s as 32-byte hex,
 *     lifts v∈{0,1}→{27,28}, validates signatureType∈{2,3}.
 *
 * Returns undefined on any malformation. The strict typing of the return
 * (signatureType 2|3, v 27|28) is what the tx builder downstream relies on.
 */
export function signatureToTuple(s: unknown): ZeroExSigTuple | undefined {
  if (typeof s === 'string') {
    const hex = s.startsWith('0x') ? s.slice(2) : s;
    if (!/^[0-9a-fA-F]{130}$/.test(hex)) return undefined;
    const r = `0x${hex.slice(0, 64)}` as `0x${string}`;
    const sv = `0x${hex.slice(64, 128)}` as `0x${string}`;
    let v = parseInt(hex.slice(128, 130), 16);
    if (v === 0 || v === 1) v += 27;
    if (v !== 27 && v !== 28) return undefined;
    return { signatureType: 2, v: v, r, s: sv };
  }
  if (s && typeof s === 'object') {
    const o = s as Record<string, unknown>;
    if (!isHex32(o.r) || !isHex32(o.s)) return undefined;
    const vRaw = o.v;
    if (typeof vRaw !== 'number' || !Number.isFinite(vRaw)) return undefined;
    let v = vRaw;
    if (v === 0 || v === 1) v += 27;
    if (v !== 27 && v !== 28) return undefined;
    const stRaw = o.signatureType;
    const signatureType =
      typeof stRaw === 'number' && Number.isFinite(stRaw) ? stRaw : 2;
    if (signatureType !== 2 && signatureType !== 3) return undefined;
    return {
      signatureType: signatureType,
      v: v,
      r: o.r,
      s: o.s,
    };
  }
  return undefined;
}

/**
 * Pack a validated tuple into a 66-byte `Uint8Array`.
 * Layout: [signatureType:1][r:32][s:32][v:1].
 *
 * Returns `Uint8Array` (not `Buffer`) because Prisma's `Bytes` column type
 * is `Uint8Array<ArrayBuffer>`, and Node's `Buffer<ArrayBufferLike>` widens
 * `buffer` to `SharedArrayBuffer` which fails strict assignability.
 */
export function tupleToPackedBytes(t: ZeroExSigTuple): Uint8Array {
  // Allocate over a fresh ArrayBuffer (not the default ArrayBufferLike) so
  // Prisma's strict `Uint8Array<ArrayBuffer>` Bytes column type accepts the
  // value without `SharedArrayBuffer` widening.
  const buf = new Uint8Array(new ArrayBuffer(66));
  buf[0] = t.signatureType;
  const r = hexToBytes(t.r.slice(2));
  const s = hexToBytes(t.s.slice(2));
  buf.set(r, 1); // r → [1..33)
  buf.set(s, 33); // s → [33..65)
  buf[65] = t.v;
  return buf;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Inverse of `tupleToPackedBytes`. Returns null when the input is:
 *   - null / undefined
 *   - any length != 66 (legacy 0-byte and 65-byte rows are intentionally
 *     rejected so callers treat them as missing_raw, not "valid EIP712")
 *   - signatureType not in {2,3}
 *   - v not in {27,28}
 */
export function packedBytesToTuple(
  buf: Buffer | Uint8Array | null | undefined,
): ZeroExSigTuple | null {
  if (!buf || buf.length !== 66) return null;
  const signatureType = buf[0];
  if (signatureType !== 2 && signatureType !== 3) return null;
  const v = buf[65];
  if (v !== 27 && v !== 28) return null;
  const r = `0x${bytesToHex(buf.slice(1, 33))}` as `0x${string}`;
  const s = `0x${bytesToHex(buf.slice(33, 65))}` as `0x${string}`;
  return { signatureType, v, r, s };
}

function bytesToHex(b: Uint8Array): string {
  let out = '';
  for (let i = 0; i < b.length; i++) {
    out += b[i].toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Normalise a LimitOrder-shaped input so it is safe for Prisma's JSON column
 * (no BigInt primitives anywhere) and lower-cases address fields.
 *
 * Accepts amounts/salt as bigint | number | string; outputs decimal strings.
 * Accepts expiry as number | bigint | numeric string; outputs a JS number
 * (matches the existing `expiry BigInt` column coercion in attachRawToOrder).
 *
 * Returns a plain Record<string, unknown> with no `BigInt` primitives, safe
 * to pass through `as Prisma.InputJsonValue`. JSON.stringify round-trips.
 */
export function normalizeOrderForJson(
  order: LimitOrder | Record<string, unknown>,
): Record<string, unknown> {
  const o = order as Record<string, unknown>;
  return {
    makerToken: toLowerAddr(o.makerToken),
    takerToken: toLowerAddr(o.takerToken),
    makerAmount: toDecimalString(o.makerAmount),
    takerAmount: toDecimalString(o.takerAmount),
    takerTokenFeeAmount: toDecimalString(o.takerTokenFeeAmount),
    maker: toLowerAddr(o.maker),
    taker: toLowerAddr(o.taker),
    sender: toLowerAddr(o.sender),
    feeRecipient: toLowerAddr(o.feeRecipient),
    pool: toLowerHex(o.pool),
    expiry: toNumber(o.expiry),
    salt: toDecimalString(o.salt),
  };
}

function toLowerAddr(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.toLowerCase();
}

function toLowerHex(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.toLowerCase();
}

function toDecimalString(v: unknown): string {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'number' && Number.isFinite(v))
    return Math.trunc(v).toString();
  if (typeof v === 'string') {
    // Accept already-decimal strings (the wire form) and bigint-stringified
    // values. We do not parse hex here — bigint hex is not used in the wire
    // payload for 0x v4 amounts/salt.
    return v;
  }
  return '0';
}

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  return 0;
}
