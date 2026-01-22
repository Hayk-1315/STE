// apps/api/src/zeroex/tx-builders.service.ts
import { Injectable } from '@nestjs/common';
import { Interface } from 'ethers';
import { ZeroExAddressesService } from './addresses.service';
import { LimitOrder } from './limit-order.types';
import { parseZeroExEnv } from './zeroex.config';

const EP_ABI = [
  // fillLimitOrder(LimitOrder, Signature, uint128)
  'function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s) signature,uint128 takerTokenFillAmount) payable returns (uint128 takerTokenFilledAmount, uint128 makerTokenFilledAmount)',
  // cancelLimitOrder(LimitOrder)
  'function cancelLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order)',
  // NEW: batchFillLimitOrders(orders[], signatures[], takerTokenFillAmounts[], revertIfIncomplete)
  'function batchFillLimitOrders((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)[] orders,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s)[] signatures,uint128[] takerTokenFillAmounts,bool revertIfIncomplete) payable returns (uint128[] takerTokenFilledAmounts,uint128[] makerTokenFilledAmounts)',
] as const;

const EP_CANCEL_PAIR_ABI = [
  // NEW: cancelPairLimitOrders(makerToken, takerToken, minValidSalt)
  'function cancelPairLimitOrders(address makerToken,address takerToken,uint256 minValidSalt)',
] as const;

const epInterface = new Interface(EP_ABI);

export interface TxData {
  /** Exchange Proxy address */
  to: `0x${string}`;
  /** ABI-encoded calldata for the EP method */
  data: `0x${string}`;
  /**
   * ETH value to send with the tx.
   * Use decimal string (ethers BigNumberish-compatible). For 0x fills this is "0".
   */
  value: string;
}

/** 0x v4 Signature tuple for ABI */
export type ZeroExSig = {
  signatureType: number; // 2 = EIP712, 3 = EthSign
  v: number; // 27 or 28 (normalize 0/1 → 27/28)
  r: `0x${string}`;
  s: `0x${string}`;
};

/** Parse 65-byte ECDSA signature hex → {signatureType,v,r,s} */
function parseSigHexToTuple(
  sigHex: string,
  signatureType: number = 2,
): ZeroExSig {
  const hex = sigHex.startsWith('0x') ? sigHex.slice(2) : sigHex;
  if (hex.length < 130) {
    throw new Error(`invalid signature length: ${hex.length / 2} bytes`);
  }
  const r = `0x${hex.slice(0, 64)}`;
  const s = `0x${hex.slice(64, 128)}`;
  let v = parseInt(hex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;

  return {
    signatureType,
    v,
    r: r as `0x${string}`,
    s: s as `0x${string}`,
  };
}

@Injectable()
export class ZeroExTxBuildersService {
  constructor(private readonly addr: ZeroExAddressesService) {}

  /**
   * Build calldata for EP.fillLimitOrder(order, signature, takerTokenFillAmount)
   * @param signature may be hex-string (0x…) or the tuple object
   */
  buildFillLimitOrder(
    order: LimitOrder,
    signature: `0x${string}` | ZeroExSig,
    takerTokenFillAmount: bigint,
  ): TxData {
    const { exchangeProxy } = this.addr.resolve();

    const sigForAbi: ZeroExSig =
      typeof signature === 'string'
        ? parseSigHexToTuple(signature, 2) // default to EIP-712
        : signature;

    const data = epInterface.encodeFunctionData('fillLimitOrder', [
      order,
      sigForAbi,
      takerTokenFillAmount,
    ]);

    return {
      to: exchangeProxy as `0x${string}`,
      data: data as `0x${string}`,
      value: '0',
    };
  }

  buildCancelLimitOrder(order: LimitOrder): TxData {
    const { exchangeProxy } = this.addr.resolve();
    const data = epInterface.encodeFunctionData('cancelLimitOrder', [order]);
    return {
      to: exchangeProxy as `0x${string}`,
      data: data as `0x${string}`,
      value: '0',
    };
  }

  /**
   * Build calldata for EP.batchFillLimitOrders(orders[], signatures[], takerTokenFillAmounts[], revertIfIncomplete)
   * - Accepts signatures as hex OR pre-parsed tuples and normalizes them.
   * - Caller is responsible for executing against the EP address (`to`) with `value = "0"`.
   */
  buildBatchFillLimitOrders(args: {
    orders: ReadonlyArray<LimitOrder>;
    signatures: ReadonlyArray<`0x${string}` | ZeroExSig>;
    takerTokenFillAmounts: ReadonlyArray<bigint>; // uint128[]
    revertIfIncomplete: boolean;
  }): TxData {
    const { exchangeProxy } = this.addr.resolve();
    const chainId = parseZeroExEnv(process.env).chainId;

    // Guard para Base mainnet (y forks de Base) si el EP no soporta batch en tu despliegue
    if (chainId === 8453) {
      throw new Error(
        '0x batchFillLimitOrders isn’t implemented in the Base Exchange Proxy (chainId 8453). ' +
          'On this network, STE v1 can only execute individual fills (fillLimitOrder).',
      );
    }

    const sigs: ZeroExSig[] = args.signatures.map((s) =>
      typeof s === 'string' ? parseSigHexToTuple(s, 2) : s,
    );

    const data = epInterface.encodeFunctionData('batchFillLimitOrders', [
      args.orders,
      sigs,
      args.takerTokenFillAmounts,
      args.revertIfIncomplete,
    ]);

    return {
      to: exchangeProxy as `0x${string}`,
      data: data as `0x${string}`,
      value: '0',
    };
  }

  // ===== NEW: cancelPairLimitOrders =====

  // Interface dedicada para el método cancelPairLimitOrders
  private cancelPairIface = new Interface(EP_CANCEL_PAIR_ABI);

  /**
   * Build calldata for EP.cancelPairLimitOrders(makerToken, takerToken, minValidSalt)
   * Devuelve TxData listo para firmar/enviar (value = "0").
   */
  buildCancelPairLimitOrders(p: {
    makerToken: `0x${string}`;
    takerToken: `0x${string}`;
    minValidSalt: bigint | string;
  }): TxData {
    const { exchangeProxy } = this.addr.resolve();
    const data = this.cancelPairIface.encodeFunctionData(
      'cancelPairLimitOrders',
      [p.makerToken, p.takerToken, BigInt(p.minValidSalt)],
    ) as `0x${string}`;
    return { to: exchangeProxy as `0x${string}`, data, value: '0' };
  }

  /**
   * Alias fino para compatibilidad con controladores que llamen buildCancelPair(...)
   * Delega en buildCancelPairLimitOrders sin alterar lógica.
   */
  buildCancelPair(
    makerToken: `0x${string}`,
    takerToken: `0x${string}`,
    minValidSalt: bigint | string,
  ): TxData {
    return this.buildCancelPairLimitOrders({
      makerToken,
      takerToken,
      minValidSalt,
    });
  }
}
