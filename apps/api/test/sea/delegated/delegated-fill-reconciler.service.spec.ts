// apps/api/test/sea/delegated/delegated-fill-reconciler.service.spec.ts
//
// The delegated post-fill reconciler must update the SAME product state a manual
// fill does (Recent Trades via addTrade, orderbook/My Orders via
// applyExternalFill) and be idempotent by (txHash, marketId, taker) so a
// delegated fill can never be double-counted.
import { DelegatedFillReconcilerService } from '../../../src/sea/delegated/delegated-fill-reconciler.service';
import type { OrderBookService } from '../../../src/matching/orderbook.service';
import type { PersistenceRepository } from '../../../src/matching/persistence.repository';

const ORDER = '0x' + '1'.repeat(64);
const TX = '0x' + 'b'.repeat(64);
const SA = '0x' + 'a'.repeat(40);

function build(opts?: { existingTrade?: boolean; applyStatus?: string }) {
  const persistence = {
    findTradeByTxHashForIntent: jest
      .fn()
      .mockResolvedValue(
        opts?.existingTrade
          ? { id: 1n, makerOrderHash: ORDER, sizeBase: '5' }
          : null,
      ),
    addTrade: jest.fn().mockResolvedValue(undefined),
  };
  const ob = {
    applyExternalFill: jest
      .fn()
      .mockResolvedValue({ status: opts?.applyStatus ?? 'filled' }),
  };
  const svc = new DelegatedFillReconcilerService(
    persistence as unknown as PersistenceRepository,
    ob as unknown as OrderBookService,
  );
  return { svc, persistence, ob };
}

const INPUT = {
  marketId: 'm1',
  orderHash: ORDER,
  execBase: 1_000_000_000_000_000_000n,
  taker: SA,
  priceTicks: 3000n,
  txHash: TX,
};

describe('DelegatedFillReconcilerService', () => {
  it('reconciles a confirmed fill into Recent Trades + orderbook/My Orders', async () => {
    const { svc, persistence, ob } = build();
    const res = await svc.reconcileConfirmedFill(INPUT);

    expect(res).toEqual({ reconciled: true, status: 'filled' });
    // Recent Trades: addTrade with the maker order, taker (SA), price, base, tx.
    expect(persistence.addTrade).toHaveBeenCalledWith(
      'm1',
      ORDER,
      SA.toLowerCase(),
      3000n,
      1_000_000_000_000_000_000n,
      TX,
    );
    // Maker side: applyExternalFill reduces the resting order's remaining.
    expect(ob.applyExternalFill).toHaveBeenCalledWith(
      'm1',
      ORDER,
      INPUT.execBase,
      {
        taker: SA.toLowerCase(),
        priceTicks: 3000n,
      },
    );
  });

  it('idempotent: an already-reconciled (txHash, market, taker) is a no-op', async () => {
    const { svc, persistence, ob } = build({ existingTrade: true });
    const res = await svc.reconcileConfirmedFill(INPUT);

    expect(res).toEqual({ reconciled: false, reason: 'already_reconciled' });
    // Neither state-mutating primitive runs a second time — no double-fill.
    expect(persistence.addTrade).not.toHaveBeenCalled();
    expect(ob.applyExternalFill).not.toHaveBeenCalled();
  });

  it('rejects a non-positive execBase without touching product state', async () => {
    const { svc, persistence, ob } = build();
    const res = await svc.reconcileConfirmedFill({ ...INPUT, execBase: 0n });

    expect(res).toEqual({ reconciled: false, reason: 'nonpositive_execBase' });
    expect(persistence.addTrade).not.toHaveBeenCalled();
    expect(ob.applyExternalFill).not.toHaveBeenCalled();
  });

  it('never throws: an internal failure is caught and reported', async () => {
    const { svc, persistence, ob } = build();
    (persistence.addTrade as jest.Mock).mockRejectedValueOnce(
      new Error('db down'),
    );
    const res = await svc.reconcileConfirmedFill(INPUT);

    expect(res).toEqual({ reconciled: false, reason: 'reconcile_error' });
    // addTrade threw before applyExternalFill, so the LOB was not mutated.
    expect(ob.applyExternalFill).not.toHaveBeenCalled();
  });

  it('propagates a partial-fill status (maker order stays with remaining)', async () => {
    const { svc } = build({ applyStatus: 'partial' });
    const res = await svc.reconcileConfirmedFill(INPUT);
    expect(res).toEqual({ reconciled: true, status: 'partial' });
  });
});
