// apps/api/src/public/match.controller.ts
// Returns taker sweep plan + (if possible) 0x EP tx data.
//
// Request JSON (minimal):
// { "marketId": "WETH-USDC", "side": "BUY" | "SELL", "sizeBase": "1000000000000000" }
//
// Response:
// {
//   marketId, symbol, side,
//   requestedBase, remainingBase,
//   takerToken, takerAmount,
//   fills: [{ makerOrderHash, maker, priceTicks, sizeBase }],
//   txData?: { to: `0x${string}`, data: `0x${string}`, value: string }
// }

import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { ZeroExTxBuildersService } from '../zeroex/tx-builders.service';
import type { TxData } from '../zeroex/tx-builders.service';

type QuoteReq = {
  marketId: string; // id o symbol (usamos como "marketIdOrSymbol")
  side: Side; // "BUY" | "SELL" (taker perspective on BASE)
  sizeBase: string | number; // raw base units
};

@Controller()
export class MatchController {
  constructor(
    private readonly ob: OrderBookService,
    private readonly txb: ZeroExTxBuildersService, // F1
  ) {}

  @Post('match/quote')
  async quote(@Body() b: QuoteReq) {
    if (
      !b?.marketId ||
      !b?.side ||
      b.sizeBase === undefined ||
      b.sizeBase === null
    ) {
      throw new BadRequestException('marketId, side, sizeBase are required');
    }
    const side = String(b.side).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    const sizeBase = BigInt(
      typeof b.sizeBase === 'string' ? b.sizeBase : String(b.sizeBase),
    );

    const plan = await this.ob.quote({
      marketIdOrSymbol: b.marketId,
      side: side as Side,
      sizeBase,
    });

    // All selected levels must have raw order + sig to build EP calldata
    const allRaw = plan.fills.every((f) => !!f.rawOrder && !!f.rawSig);

    let txData: TxData | undefined;

    if (allRaw && plan.fills.length === 1) {
      // Single-fill path (supported by our builders right now)
      const f = plan.fills[0];
      const o = f.rawOrder!;
      const s = f.rawSig!;

      // takerTokenFillAmount depends on taker side:
      // - BUY: taker pays quote => use plan.takerAmount (quote units)
      // - SELL: taker pays base  => use executed base from the fill
      const takerFillAmount =
        plan.side === 'BUY' ? BigInt(plan.takerAmount) : BigInt(f.sizeBase);

      // buildFillLimitOrder is synchronous
      txData = this.txb.buildFillLimitOrder(o, s, takerFillAmount);
    }

    // If multiple fills or missing raw payloads, txData remains undefined for now.
    return { ...plan, txData };
  }
}
