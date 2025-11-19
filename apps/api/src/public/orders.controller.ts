// apps/api/src/public/orders.controller.ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OrderBookService, Side } from '../matching/orderbook.service';
import { PersistenceRepository } from '../matching/persistence.repository';
import { ZeroExSigningService } from '../zeroex/signing.service';
import type { LimitOrder, Signature } from '../zeroex/limit-order.types';
import {
  hashMessage,
  getBytes,
  recoverAddress,
  keccak256,
  toUtf8Bytes,
} from 'ethers';

type PostOrderDTO = {
  order: LimitOrder;
  signature: Signature;
};

type CancelDTO = {
  marketId: string; // symbol or DB id; resolved internally
  orderHash: string;
  maker: string;
  signature: string; // raw eth_sign hex string
};

const pow10 = (n: number) => {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
};

const toLower = (s: string) => s.trim().toLowerCase();

const getChainIdFromEnv = (): number => {
  // Try CHAIN_ID, then ZEROEX_CHAIN_ID, fallback to 84532 in dev
  const raw = process.env.CHAIN_ID ?? process.env.ZEROEX_CHAIN_ID ?? '84532';
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    // In dev mode we default to Base Sepolia; do not crash the handler
    return 84532;
  }
  return parsed;
};

@Controller()
export class OrdersController {
  constructor(
    private readonly ob: OrderBookService,
    private readonly repo: PersistenceRepository,
    private readonly signing: ZeroExSigningService,
  ) {}

  /**
   * POST /orders
   * Verifies a 0x LimitOrder signature (EIP-712 or EthSign via SignatureType),
   * derives side/priceTicks/sizeBase, and places the order into the in-memory
   * order book. OrderBookService enforces trading rules and persists state.
   */
  @Post('orders')
  async place(@Body() body: PostOrderDTO) {
    const { order, signature } = body;
    if (!order || !signature) {
      throw new BadRequestException('order and signature are required');
    }

    const makerExpected = toLower(order.maker);
    const devSkipSigs = process.env.DEV_SKIP_SIGS === '1';

    let orderHash: string;

    if (devSkipSigs) {
      // Dev mode: do not use 0x TypedData (addresses like "0xbase..." are not valid).
      // Use a simple hash over the JSON payload instead.
      orderHash = keccak256(toUtf8Bytes(JSON.stringify(order)));
    } else {
      const chainId = getChainIdFromEnv();
      orderHash = this.signing.getOrderHash(chainId, order);
      const { valid, recovered } = this.signing.verifySignature(
        chainId,
        order,
        signature,
      );

      if (!valid || !recovered || toLower(recovered) !== makerExpected) {
        throw new BadRequestException('invalid_signature');
      }
    }

    // 2) Resolve market by token pair (makerToken/takerToken)
    const makerToken = toLower(order.makerToken);
    const takerToken = toLower(order.takerToken);

    const markets = await this.repo.listMarketsBasic(); // { id, symbol, baseAddress, quoteAddress }
    const market = markets.find((m) => {
      const base = toLower(m.baseAddress);
      const quote = toLower(m.quoteAddress);
      return (
        (base === makerToken && quote === takerToken) ||
        (base === takerToken && quote === makerToken)
      );
    });

    if (!market) {
      throw new BadRequestException('market_not_found_for_tokens');
    }

    const ctx = await this.repo.getTradingContext(market.id);

    // 3) Derive side, sizeBase, priceTicks from maker/taker amounts
    const makerAmt = BigInt(order.makerAmount);
    const takerAmt = BigInt(order.takerAmount);

    let side: Side;
    let sizeBase: bigint;
    let priceTicks: bigint;

    const baseAddr = ctx.baseAddress;
    const quoteAddr = ctx.quoteAddress;

    const isMakerBase = baseAddr === makerToken && quoteAddr === takerToken;

    if (isMakerBase) {
      // SELL base: maker pays base, receives quote
      side = 'SELL';
      sizeBase = makerAmt;

      // price per 1 base = quote/base = takerAmt / makerAmt
      // priceTicks = (price * 10^quoteDecimals) / priceTickQ
      //            = (takerAmt * 10^quoteDecimals) / (makerAmt * priceTickQ)
      // priceTicks * priceTickQ = (takerAmt * 10^baseDecimals) / makerAmt
      const num = takerAmt * pow10(ctx.baseDecimals);
      const den = makerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    } else {
      // BUY base: maker pays quote, receives base
      side = 'BUY';
      sizeBase = takerAmt;

      // price per 1 base = quote/base = makerAmt / takerAmt
      // priceTicks * priceTickQ = (makerAmt * 10^baseDecimals) / takerAmt
      const num = makerAmt * pow10(ctx.baseDecimals);
      const den = takerAmt * ctx.priceTickQ;
      priceTicks = num / den;
      if (num % den !== 0n) {
        throw new BadRequestException('price_tick_violation');
      }
    }

    // 4) Place into in-memory book keyed by symbol; persistence is handled inside OrderBookService
    const res = await this.ob.place({
      marketId: market.symbol,
      orderHash,
      maker: makerExpected,
      side,
      priceTicks,
      sizeBase,
    });
    await this.ob.attachRaw(market.symbol, orderHash, { order, signature });

    return { orderHash, status: res.status };
  }

  /**
   * POST /cancel
   * Verifies an eth_sign (personal_sign) signature over the orderHash and
   * cancels the order in the in-memory book plus persistence.
   */
  @Post('cancel')
  async cancel(@Body() body: CancelDTO) {
    const { marketId, orderHash, maker, signature } = body;

    if (!marketId || !orderHash || !maker || !signature) {
      throw new BadRequestException(
        'marketId, orderHash, maker, signature are required',
      );
    }

    const devSkipSigs = process.env.DEV_SKIP_SIGS === '1';

    if (!devSkipSigs) {
      let recovered: string;
      try {
        const digest = hashMessage(getBytes(orderHash));
        recovered = recoverAddress(digest, signature);
      } catch {
        throw new BadRequestException('invalid_signature');
      }

      if (toLower(recovered) !== toLower(maker)) {
        throw new BadRequestException('invalid_signature');
      }
    }

    const out = await this.ob.cancel(marketId, orderHash);
    return out;
  }
}
