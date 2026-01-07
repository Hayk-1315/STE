// apps/api/src/zeroex/signing.service.ts
import { Injectable } from '@nestjs/common';
import { ZeroExAddressesService } from './addresses.service';
import {
  EIP712_LIMIT_ORDER_TYPES,
  LimitOrder,
  Signature,
  SignatureType,
} from './limit-order.types';
import {
  TypedDataEncoder,
  recoverAddress,
  hashMessage,
  getBytes,
  type TypedDataDomain,
  type TypedDataField,
} from 'ethers';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

@Injectable()
export class ZeroExSigningService {
  constructor(private readonly addr: ZeroExAddressesService) {}

  /** Coerce missing/nullable fields to zero-safe values before hashing. */
  private normalize(o: LimitOrder): LimitOrder {
    // Helpers
    const asAddr = (v: unknown): `0x${string}` =>
      typeof v === 'string' && v.startsWith('0x') && v.length === 42
        ? (v as `0x${string}`)
        : (ZERO_ADDR as `0x${string}`);
    const asBytes32 = (v: unknown): `0x${string}` =>
      typeof v === 'string' && v.startsWith('0x') && v.length === 66
        ? (v as `0x${string}`)
        : (ZERO32 as `0x${string}`);
    const asBig = (v: unknown): bigint => {
      if (typeof v === 'bigint') return v;
      if (typeof v === 'number') return BigInt(v);
      if (typeof v === 'string' && v.length > 0) return BigInt(v);
      return 0n;
    };
    const asNum = (v: unknown): number => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string' && v.length) return Number(v);
      return 0;
    };

    return {
      makerToken: asAddr(o?.makerToken),
      takerToken: asAddr(o?.takerToken),
      makerAmount: asBig(o?.makerAmount),
      takerAmount: asBig(o?.takerAmount),
      takerTokenFeeAmount: asBig(o?.takerTokenFeeAmount),
      maker: asAddr(o?.maker),
      taker: asAddr(o?.taker),
      sender: asAddr(o?.sender),
      feeRecipient: asAddr(o?.feeRecipient),
      pool: asBytes32(o?.pool),
      expiry: asNum(o?.expiry),
      salt: asBig(o?.salt),
    };
  }

  /** Build the EIP-712 domain for 0x v4 Exchange Proxy. */
  private domain(chainId: number, verifyingContract: string): TypedDataDomain {
    return { name: 'ZeroEx', version: '1.0.0', chainId, verifyingContract };
  }

  /** Compute EIP-712 order hash for a given limit order. */
  getOrderHash(chainId: number, order: LimitOrder): string {
    const { exchangeProxy } = this.addr.resolve();
    const domain: TypedDataDomain = this.domain(chainId, exchangeProxy);
    const types: Record<string, TypedDataField[]> =
      EIP712_LIMIT_ORDER_TYPES as unknown as Record<string, TypedDataField[]>;
    const value: Record<string, unknown> = this.normalize(
      order,
    ) as unknown as Record<string, unknown>;
    if (process.env.DEBUG_EIP712 === '1') {
      console.log('[eip712] domain', domain);

      console.log('[eip712] value', value);

      console.log('[eip712] hash', TypedDataEncoder.hash(domain, types, value));
    }
    return TypedDataEncoder.hash(domain, types, value);
  }

  /** Verify maker signature against the order (supports EIP712 and EthSign). */
  verifySignature(
    chainId: number,
    order: LimitOrder,
    sig: Signature,
  ): { valid: boolean; recovered?: string } {
    const { exchangeProxy } = this.addr.resolve();
    const domain: TypedDataDomain = this.domain(chainId, exchangeProxy);
    const types: Record<string, TypedDataField[]> =
      EIP712_LIMIT_ORDER_TYPES as unknown as Record<string, TypedDataField[]>;
    const value: Record<string, unknown> = this.normalize(
      order,
    ) as unknown as Record<string, unknown>;

    const orderHash = TypedDataEncoder.hash(domain, types, value);

    let digest: string;
    if (sig.signatureType === SignatureType.EIP712) {
      digest = orderHash;
    } else if (sig.signatureType === SignatureType.ETHSIGN) {
      // EIP-191 personal_sign digest over the EIP-712 order hash
      digest = hashMessage(getBytes(orderHash));
    } else {
      return { valid: false };
    }

    const recovered = recoverAddress(digest, { v: sig.v, r: sig.r, s: sig.s });
    return { valid: !!recovered, recovered };
  }
}
