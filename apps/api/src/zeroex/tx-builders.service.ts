// apps/api/src/zeroex/tx-builders.service.ts
import { Injectable } from '@nestjs/common';
import { Interface } from 'ethers';
import { ZeroExAddressesService } from './addresses.service';
import { LimitOrder, Signature } from './limit-order.types';

const EP_ABI = [
  // fillLimitOrder(LimitOrder, Signature, uint128)
  'function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s) signature,uint128 takerTokenFillAmount) payable returns (uint128 takerTokenFilledAmount, uint128 makerTokenFilledAmount)',
  // cancelLimitOrder(LimitOrder)
  'function cancelLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order)',
] as const;

const epInterface = new Interface(EP_ABI);

export interface TxData {
  to: string;
  data: string;
  value: string; // hex
}

@Injectable()
export class ZeroExTxBuildersService {
  constructor(private readonly addr: ZeroExAddressesService) {}

  buildFillLimitOrder(
    order: LimitOrder,
    signature: Signature,
    takerTokenFillAmount: bigint,
  ): TxData {
    const { exchangeProxy } = this.addr.resolve();
    const data = epInterface.encodeFunctionData('fillLimitOrder', [
      order,
      signature,
      takerTokenFillAmount,
    ]);
    return { to: exchangeProxy, data, value: '0x0' };
  }

  buildCancelLimitOrder(order: LimitOrder): TxData {
    const { exchangeProxy } = this.addr.resolve();
    const data = epInterface.encodeFunctionData('cancelLimitOrder', [order]);
    return { to: exchangeProxy, data, value: '0x0' };
  }
}
