// apps/api/test/matching/raw-order.util.spec.ts
//
// Phase 5 P0 fix: regression coverage for the shared signature + order
// normalisation helpers. Locks both signatureType=2 (EIP712) and
// signatureType=3 (ETHSIGN) round-trip semantics so a future change can't
// silently degrade ETHSIGN orders to EIP712 on persistence.

import {
  normalizeOrderForJson,
  packedBytesToTuple,
  signatureToTuple,
  tupleToPackedBytes,
} from '../../src/matching/raw-order.util';

const R = ('0x' + 'a'.repeat(64)) as `0x${string}`;
const S = ('0x' + 'b'.repeat(64)) as `0x${string}`;
const R_BYTES = 'a'.repeat(64);
const S_BYTES = 'b'.repeat(64);

describe('signatureToTuple', () => {
  // ---- EIP-712 hex path ----
  it('65-byte 0x hex → tuple with signatureType=2 (EIP-712 default)', () => {
    const hex = `0x${R_BYTES}${S_BYTES}1c`; // v=0x1c=28
    const t = signatureToTuple(hex);
    expect(t).toEqual({ signatureType: 2, v: 28, r: R, s: S });
  });

  it('hex with raw v=0 lifted to 27', () => {
    const hex = `0x${R_BYTES}${S_BYTES}00`;
    expect(signatureToTuple(hex)?.v).toBe(27);
  });

  it('hex with raw v=1 lifted to 28', () => {
    const hex = `0x${R_BYTES}${S_BYTES}01`;
    expect(signatureToTuple(hex)?.v).toBe(28);
  });

  it('65-byte hex without 0x prefix is accepted', () => {
    const hex = `${R_BYTES}${S_BYTES}1c`;
    expect(signatureToTuple(hex)?.v).toBe(28);
  });

  it('64-byte hex → undefined', () => {
    const hex = `0x${R_BYTES}${S_BYTES}`; // missing v
    expect(signatureToTuple(hex)).toBeUndefined();
  });

  it('empty string → undefined', () => {
    expect(signatureToTuple('')).toBeUndefined();
  });

  it('non-hex 130 chars → undefined', () => {
    expect(signatureToTuple('0x' + 'z'.repeat(130))).toBeUndefined();
  });

  it('hex with v outside {0,1,27,28} → undefined', () => {
    const hex = `0x${R_BYTES}${S_BYTES}05`; // 5 is not a valid v
    expect(signatureToTuple(hex)).toBeUndefined();
  });

  // ---- ETHSIGN tuple path ----
  it('tuple {signatureType:3, v:28, r, s} → preserved', () => {
    expect(signatureToTuple({ signatureType: 3, v: 28, r: R, s: S })).toEqual({
      signatureType: 3,
      v: 28,
      r: R,
      s: S,
    });
  });

  it('tuple {signatureType:3, v:1, ...} → v lifted to 28', () => {
    expect(signatureToTuple({ signatureType: 3, v: 1, r: R, s: S })?.v).toBe(
      28,
    );
  });

  it('tuple missing signatureType → defaults to 2 (EIP-712)', () => {
    expect(signatureToTuple({ v: 27, r: R, s: S })?.signatureType).toBe(2);
  });

  it('tuple with signatureType=99 → undefined', () => {
    expect(
      signatureToTuple({ signatureType: 99, v: 27, r: R, s: S }),
    ).toBeUndefined();
  });

  it('tuple with non-hex r → undefined', () => {
    expect(
      signatureToTuple({ signatureType: 2, v: 27, r: '0xnotvalid', s: S }),
    ).toBeUndefined();
  });

  it('tuple missing s → undefined', () => {
    expect(signatureToTuple({ signatureType: 2, v: 27, r: R })).toBeUndefined();
  });

  it('null/undefined/number → undefined', () => {
    expect(signatureToTuple(null)).toBeUndefined();
    expect(signatureToTuple(undefined)).toBeUndefined();
    expect(signatureToTuple(42)).toBeUndefined();
  });
});

describe('tupleToPackedBytes / packedBytesToTuple round-trip', () => {
  it('EIP-712 tuple round-trips through 66-byte buffer with leading byte 2', () => {
    const t = { signatureType: 2, v: 27, r: R, s: S } as const;
    const buf = tupleToPackedBytes(t);
    expect(buf.length).toBe(66);
    expect(buf[0]).toBe(2);
    expect(buf[65]).toBe(27);
    const back = packedBytesToTuple(buf);
    expect(back).toEqual(t);
  });

  it('ETHSIGN tuple round-trips with leading byte 3', () => {
    const t = { signatureType: 3, v: 28, r: R, s: S } as const;
    const buf = tupleToPackedBytes(t);
    expect(buf[0]).toBe(3);
    expect(packedBytesToTuple(buf)).toEqual(t);
  });

  it('legacy 65-byte buffer → null (treated as missing)', () => {
    const legacy = Buffer.alloc(65);
    expect(packedBytesToTuple(legacy)).toBeNull();
  });

  it('legacy 0-byte buffer → null', () => {
    expect(packedBytesToTuple(Buffer.alloc(0))).toBeNull();
  });

  it('null / undefined → null', () => {
    expect(packedBytesToTuple(null)).toBeNull();
    expect(packedBytesToTuple(undefined)).toBeNull();
  });

  it('66-byte buffer with invalid signatureType → null', () => {
    const buf = Buffer.alloc(66);
    buf[0] = 99; // invalid
    buf[65] = 27;
    expect(packedBytesToTuple(buf)).toBeNull();
  });

  it('66-byte buffer with invalid v → null', () => {
    const buf = Buffer.alloc(66);
    buf[0] = 2;
    buf[65] = 5; // invalid
    expect(packedBytesToTuple(buf)).toBeNull();
  });
});

describe('normalizeOrderForJson', () => {
  const baseOrder = {
    makerToken: '0xMaKeRtOkEn0000000000000000000000000000aa',
    takerToken: '0xTaKeRtOkEn0000000000000000000000000000bb',
    maker: '0xMaKeR0000000000000000000000000000000000cc',
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pool: ('0x' + '0'.repeat(64)) as `0x${string}`,
  };

  it('bigint amounts/salt → decimal strings, no BigInt primitives remain', () => {
    const out = normalizeOrderForJson({
      ...baseOrder,
      makerAmount: 1_000_000_000_000_000_000n,
      takerAmount: 300_000_000_000n,
      takerTokenFeeAmount: 0n,
      expiry: 1_700_000_000,
      salt: (1n << 130n) + 42n,
    });
    expect(typeof out.makerAmount).toBe('string');
    expect(out.makerAmount).toBe('1000000000000000000');
    expect(typeof out.salt).toBe('string');
    expect(typeof out.expiry).toBe('number');
    // Round-trip through JSON to confirm no `$type:"BigInt"` artefacts.
    expect(() => JSON.stringify(out)).not.toThrow();
  });

  it('string numerics pass through unchanged', () => {
    const out = normalizeOrderForJson({
      ...baseOrder,
      makerAmount: '1000000000000000000',
      takerAmount: '300000000000',
      takerTokenFeeAmount: '0',
      expiry: '1700000000',
      salt: '42',
    });
    expect(out.makerAmount).toBe('1000000000000000000');
    expect(out.expiry).toBe(1_700_000_000);
    expect(out.salt).toBe('42');
  });

  it('bigint expiry → coerced to JS number', () => {
    const out = normalizeOrderForJson({
      ...baseOrder,
      makerAmount: '0',
      takerAmount: '0',
      takerTokenFeeAmount: '0',
      expiry: 1_700_000_000n,
      salt: '0',
    });
    expect(out.expiry).toBe(1_700_000_000);
  });

  it('addresses are lower-cased', () => {
    const out = normalizeOrderForJson({
      ...baseOrder,
      makerAmount: '0',
      takerAmount: '0',
      takerTokenFeeAmount: '0',
      expiry: 0,
      salt: '0',
    });
    expect(out.makerToken).toBe(baseOrder.makerToken.toLowerCase());
    expect(out.maker).toBe(baseOrder.maker.toLowerCase());
  });
});
