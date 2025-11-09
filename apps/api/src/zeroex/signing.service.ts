// apps/api/src/zeroex/signing.service.ts
// imports (ajusta a esto)
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

@Injectable()
export class ZeroExSigningService {
  constructor(private readonly addr: ZeroExAddressesService) {}

  /** Build the EIP-712 domain for 0x v4 Exchange Proxy. */
  private domain(chainId: number, verifyingContract: string): TypedDataDomain {
    return {
      name: '0x Protocol',
      version: '4',
      chainId,
      verifyingContract,
    };
  }

  /** Compute EIP-712 order hash for a given limit order. */
  getOrderHash(chainId: number, order: LimitOrder): string {
    const { exchangeProxy } = this.addr.resolve();
    const domain: TypedDataDomain = this.domain(chainId, exchangeProxy);
    const types: Record<string, TypedDataField[]> =
      EIP712_LIMIT_ORDER_TYPES as unknown as Record<string, TypedDataField[]>;
    const value: Record<string, unknown> = order as unknown as Record<
      string,
      unknown
    >;

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
    const value: Record<string, unknown> = order as unknown as Record<
      string,
      unknown
    >;

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
