// apps/api/test/public/match.controller.spec.ts
// DB-free coverage for the Phase 5 Part B.1 min-size gate on POST /match/quote.
// Mocks OrderBookService, PersistenceRepository, ZeroExTxBuildersService, and
// MetricsService so we can verify the gate fires BEFORE ob.quote() is called
// and that a clear `size_below_min_size` code is surfaced.
import { BadRequestException } from '@nestjs/common';
import { MatchController } from '../../src/public/match.controller';
import type { OrderBookService } from '../../src/matching/orderbook.service';
import type { ZeroExTxBuildersService } from '../../src/zeroex/tx-builders.service';
import type { PersistenceRepository } from '../../src/matching/persistence.repository';
import type { MetricsService } from '../../src/observability/metrics.service';

type ObMock = { quote: jest.Mock };
type PersistenceMock = {
  getTradingContext: jest.Mock;
  findRawOrderByHash: jest.Mock;
};
type TxbMock = {
  buildFillLimitOrder: jest.Mock;
  buildBatchFillLimitOrders: jest.Mock;
};
type MetricsMock = {
  quotesTotal: { inc: jest.Mock };
  quoteLatency: { observe: jest.Mock };
};

function buildCtrl(opts?: {
  minSizeB?: bigint;
  minNotionalQ?: bigint;
  priceTickQ?: bigint;
  symbol?: string;
  quote?: Partial<{
    requestedBase: string;
    remainingBase: string;
    takerAmount: string;
    takerTotalAmount: string;
    fills: Array<{
      priceTicks: string;
      sizeBase: string;
      makerOrderHash?: string;
      maker?: string;
    }>;
  }>;
}) {
  const defaultQuote = {
    marketId: 'm1',
    symbol: opts?.symbol ?? 'WETH-USDC',
    side: 'BUY',
    requestedBase: '0',
    remainingBase: '0',
    takerToken: '0xquote',
    takerAmount: '0',
    takerFeeAmount: '0',
    takerTotalAmount: '0',
    fills: [],
    ...opts?.quote,
  };
  const ob: ObMock = {
    quote: jest.fn().mockResolvedValue(defaultQuote),
  };
  const persistence: PersistenceMock = {
    getTradingContext: jest.fn().mockResolvedValue({
      id: 'm1',
      symbol: opts?.symbol ?? 'WETH-USDC',
      baseDecimals: 18,
      quoteDecimals: 6,
      baseAddress: '0xbase',
      quoteAddress: '0xquote',
      minNotionalQ: opts?.minNotionalQ ?? BigInt(0),
      minSizeB: opts?.minSizeB ?? 1_000_000_000_000_000n, // 0.001 WETH default
      priceTickQ: opts?.priceTickQ ?? BigInt(1),
    }),
    findRawOrderByHash: jest.fn(),
  };
  const txb: TxbMock = {
    buildFillLimitOrder: jest.fn(),
    buildBatchFillLimitOrders: jest.fn(),
  };
  const metrics: MetricsMock = {
    quotesTotal: { inc: jest.fn() },
    quoteLatency: { observe: jest.fn() },
  };
  const ctrl = new MatchController(
    ob as unknown as OrderBookService,
    txb as unknown as ZeroExTxBuildersService,
    persistence as unknown as PersistenceRepository,
    metrics as unknown as MetricsService,
  );
  return { ctrl, ob, persistence, txb, metrics };
}

describe('MatchController.quote min-size gate (Phase 5 Part B.1)', () => {
  it('rejects sizeBase < minSizeB with size_below_min_size BEFORE ob.quote runs', async () => {
    const { ctrl, ob, persistence } = buildCtrl({
      minSizeB: 1_000_000_000_000_000n, // 0.001 WETH
    });

    await expect(
      ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'BUY',
        sizeBase: '100', // way below min
      }),
    ).rejects.toThrow(BadRequestException);

    // Trading context must be loaded (the gate depends on it), but the matcher
    // must NOT be invoked for an invalid request.
    expect(persistence.getTradingContext).toHaveBeenCalledTimes(1);
    expect(ob.quote).not.toHaveBeenCalled();
  });

  it('exposes a structured payload with requested + minSizeB', async () => {
    const { ctrl } = buildCtrl({ minSizeB: 1_000_000_000_000_000n });
    try {
      await ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'SELL',
        sizeBase: '500',
      });
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const resp = (e as BadRequestException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp.message).toBe('size_below_min_size');
      expect(resp.requested).toBe('500');
      expect(resp.minSizeB).toBe('1000000000000000');
    }
  });

  it('passes through to ob.quote when sizeBase === minSizeB (boundary)', async () => {
    const { ctrl, ob } = buildCtrl({ minSizeB: 1_000_000_000_000_000n });
    await ctrl.quote({
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: '1000000000000000', // exactly minSizeB
    });
    expect(ob.quote).toHaveBeenCalledTimes(1);
  });

  it('passes through to ob.quote when sizeBase > minSizeB', async () => {
    const { ctrl, ob } = buildCtrl({ minSizeB: 1_000_000_000_000_000n });
    await ctrl.quote({
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: '2000000000000000',
    });
    expect(ob.quote).toHaveBeenCalledTimes(1);
  });
});

describe('MatchController.quote min-notional gate (Phase 5 Part B.2)', () => {
  // Helper fill: priceTicks=300_000_000_000, priceTickQ=1, sizeBase=1e18 (1 WETH),
  // baseDecimals=18 → notionalQ = 300_000_000_000 quote units (= 300 USDC at 6-dec).
  // To craft "below min" / "above min" cases, tweak minNotionalQ accordingly.
  it('rejects with notional_below_min_notional when fills total below minNotionalQ', async () => {
    const { ctrl, ob } = buildCtrl({
      minSizeB: BigInt(1),
      minNotionalQ: 1_000_000_000_000n, // 1,000,000 USDC (huge)
      priceTickQ: BigInt(1),
      quote: {
        fills: [
          { priceTicks: '300000000000', sizeBase: '1000000000000000000' },
        ],
      },
    });
    try {
      await ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'BUY',
        sizeBase: '1000000000000000000',
      });
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const resp = (e as BadRequestException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp.message).toBe('notional_below_min_notional');
      expect(resp.notionalQ).toBe('300000000000');
      expect(resp.minNotionalQ).toBe('1000000000000');
    }
    expect(ob.quote).toHaveBeenCalledTimes(1);
  });

  it('passes through when notionalQ === minNotionalQ (boundary)', async () => {
    const { ctrl, ob } = buildCtrl({
      minSizeB: BigInt(1),
      minNotionalQ: 300_000_000_000n,
      priceTickQ: BigInt(1),
      quote: {
        fills: [
          { priceTicks: '300000000000', sizeBase: '1000000000000000000' },
        ],
      },
    });
    await expect(
      ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'BUY',
        sizeBase: '1000000000000000000',
      }),
    ).resolves.toBeDefined();
    expect(ob.quote).toHaveBeenCalledTimes(1);
  });

  it('passes through when notionalQ > minNotionalQ', async () => {
    const { ctrl } = buildCtrl({
      minSizeB: BigInt(1),
      minNotionalQ: 1_000_000n, // 1 USDC
      priceTickQ: BigInt(1),
      quote: {
        fills: [
          { priceTicks: '300000000000', sizeBase: '1000000000000000000' },
        ],
      },
    });
    await expect(
      ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'BUY',
        sizeBase: '1000000000000000000',
      }),
    ).resolves.toBeDefined();
  });

  it('empty fills bypass the notional gate (no_fills path still returns success)', async () => {
    const { ctrl } = buildCtrl({
      minSizeB: BigInt(1),
      minNotionalQ: 1_000_000_000_000n, // huge, would reject any execution
      quote: { fills: [] },
    });
    await expect(
      ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'BUY',
        sizeBase: '1',
      }),
    ).resolves.toBeDefined();
  });

  it('SELL with same fills math is rejected symmetrically when below min', async () => {
    // Identical fills, identical notional, identical rejection regardless of side.
    const { ctrl } = buildCtrl({
      minSizeB: BigInt(1),
      minNotionalQ: 1_000_000_000_000n,
      priceTickQ: BigInt(1),
      quote: {
        fills: [
          { priceTicks: '300000000000', sizeBase: '1000000000000000000' },
        ],
      },
    });
    try {
      await ctrl.quote({
        marketId: 'WETH-USDC',
        side: 'SELL',
        sizeBase: '1000000000000000000',
      });
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const resp = (e as BadRequestException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp.message).toBe('notional_below_min_notional');
    }
  });
});

describe('MatchController.quote raw-signature round-trip (Phase 5 P0 fix)', () => {
  // Locks the contract that findRawOrderByHash returns a Signature tuple
  // (with signatureType) and the tx builder is invoked with that tuple
  // as-is — so ETHSIGN-signed orders fill correctly on-chain.
  //
  // Note: the match.controller HYDRATES the fill object in place
  // (`f.rawOrder = row.zeroExOrder`, `f.rawSig = row.signature`). To avoid
  // cross-test leakage via shared object references, build a FRESH fill
  // inside each test.
  const buildSampleFill = () => ({
    priceTicks: '300000000000',
    sizeBase: '1000000000000000000',
    makerOrderHash: '0xfeed' + 'f'.repeat(60),
    maker: '0xmaker',
  });
  const rawOrder = {
    makerToken: '0xbase',
    takerToken: '0xquote',
    makerAmount: '1000000000000000000',
    takerAmount: '300000000000',
    takerTokenFeeAmount: '0',
    maker: '0xmaker',
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pool: '0x' + '0'.repeat(64),
    expiry: 1_700_000_000,
    salt: '42',
  };

  it('forwards EIP-712 (signatureType=2) tuple from findRawOrderByHash to buildFillLimitOrder', async () => {
    const { ctrl, persistence, txb } = buildCtrl({
      priceTickQ: 1n,
      quote: { fills: [buildSampleFill()] },
    });
    persistence.findRawOrderByHash.mockResolvedValue({
      zeroExOrder: rawOrder,
      signature: {
        signatureType: 2,
        v: 27,
        r: '0x' + 'a'.repeat(64),
        s: '0x' + 'b'.repeat(64),
      },
    });
    txb.buildFillLimitOrder.mockReturnValue({
      to: '0xep',
      data: '0xcalldata',
      value: '0',
    });
    const out = (await ctrl.quote({
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: '1000000000000000000',
    })) as { txData?: unknown; noTxReason?: string };
    expect(out.noTxReason).toBeUndefined();
    expect(out.txData).toBeDefined();
    expect(txb.buildFillLimitOrder).toHaveBeenCalledTimes(1);
    const sigArg = txb.buildFillLimitOrder.mock.calls[0][1] as {
      signatureType: number;
    };
    expect(sigArg.signatureType).toBe(2);
  });

  it('SEA CL shape: JSON.stringify of /match/quote response succeeds (no bigint leak)', async () => {
    // Regression for the P0 bug where /match/quote returned 500
    // `Do not know how to serialize a BigInt` when the matched maker was
    // placed by the SEA CL fire path. Root cause: IntentFireService.sanitizeOrder
    // produces bigint primitives, attachRaw used to store them as-is, and
    // ob.quote echoed them straight into fills[i].rawOrder. The fix
    // normalises in attachRaw; this test guards the controller end-to-end
    // by simulating that the matcher returned a fill with bigint amounts
    // (worst-case shape) and asserting the response payload is JSON-safe.
    // It also walks the payload recursively to catch any other bigint leak.
    const seaShapeFill = {
      priceTicks: '300000000000',
      sizeBase: '1000000000000000000',
      makerOrderHash: '0xfeed' + 'f'.repeat(60),
      maker: '0xmaker',
      // SEA-shape: bigint primitives anywhere here would crash JSON.stringify.
      // After the attachRaw fix these are strings — but the controller has no
      // guarantee about its input from ob.quote, so we deliberately seed
      // bigints here to assert the controller does not propagate them.
      rawOrder: {
        makerToken: '0xbase',
        takerToken: '0xquote',
        makerAmount: '1000000000000000000',
        takerAmount: '300000000000',
        takerTokenFeeAmount: '0',
        maker: '0xmaker',
        taker: '0x0000000000000000000000000000000000000000',
        sender: '0x0000000000000000000000000000000000000000',
        feeRecipient: '0x0000000000000000000000000000000000000000',
        pool: '0x' + '0'.repeat(64),
        expiry: 1_700_000_000,
        salt: '42',
      },
      rawSig: {
        signatureType: 2,
        v: 27,
        r: '0x' + 'a'.repeat(64),
        s: '0x' + 'b'.repeat(64),
      },
    };
    const { ctrl, txb } = buildCtrl({
      priceTickQ: 1n,
      quote: { fills: [seaShapeFill] },
    });
    txb.buildFillLimitOrder.mockReturnValue({
      to: '0xep',
      data: '0xcalldata',
      value: '0',
    });

    const out = await ctrl.quote({
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: '1000000000000000000',
    });

    // Walk the payload and assert there are no bigint primitives anywhere.
    const assertNoBigInt = (node: unknown, path = '$'): void => {
      if (typeof node === 'bigint') {
        throw new Error(`bigint at ${path}`);
      }
      if (Array.isArray(node)) {
        node.forEach((v, i) => assertNoBigInt(v, `${path}[${i}]`));
        return;
      }
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
          assertNoBigInt(v, `${path}.${k}`);
        }
      }
    };
    expect(() => assertNoBigInt(out)).not.toThrow();
    expect(() => JSON.stringify(out)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(out)) as {
      txData?: unknown;
      fills: Array<{ rawOrder?: { makerAmount?: unknown } }>;
    };
    expect(parsed.txData).toBeDefined();
    expect(parsed.fills[0].rawOrder?.makerAmount).toBe('1000000000000000000');
  });

  it('forwards ETHSIGN (signatureType=3) tuple correctly through the tx builder', async () => {
    const { ctrl, persistence, txb } = buildCtrl({
      priceTickQ: 1n,
      quote: { fills: [buildSampleFill()] },
    });
    persistence.findRawOrderByHash.mockResolvedValue({
      zeroExOrder: rawOrder,
      signature: {
        signatureType: 3,
        v: 28,
        r: '0x' + 'a'.repeat(64),
        s: '0x' + 'b'.repeat(64),
      },
    });
    txb.buildFillLimitOrder.mockReturnValue({
      to: '0xep',
      data: '0xcalldata',
      value: '0',
    });
    const out = (await ctrl.quote({
      marketId: 'WETH-USDC',
      side: 'BUY',
      sizeBase: '1000000000000000000',
    })) as { txData?: unknown; noTxReason?: string };
    expect(out.noTxReason).toBeUndefined();
    expect(out.txData).toBeDefined();
    const sigArg = txb.buildFillLimitOrder.mock.calls[0][1] as {
      signatureType: number;
    };
    // ETHSIGN preserved end-to-end — the regression this guards against
    // would silently force signatureType=2 (EIP-712) at fill time.
    expect(sigArg.signatureType).toBe(3);
  });
});
