/* eslint-disable @typescript-eslint/no-unsafe-argument */
// apps/api/test/zeroex/tx-builders.spec.ts
import { ZeroExAddressesService } from '../../src/zeroex/addresses.service';
import { ZeroExTxBuildersService } from '../../src/zeroex/tx-builders.service';
import { SignatureType } from '../../src/zeroex/limit-order.types';

const cfg = {
  chainId: 8453,
  rpcUrl: 'http://localhost:8545',
  exchangeProxy: '0xDef1C0ded9bEc7F1A1670819833240f027b25EfF',
};

describe('ZeroExTxBuildersService', () => {
  it('encodes fillLimitOrder calldata', () => {
    const addr = new ZeroExAddressesService(cfg as any);
    const svc = new ZeroExTxBuildersService(addr);
    const order = {
      makerToken: '0x' + '11'.repeat(20),
      takerToken: '0x' + '22'.repeat(20),
      makerAmount: 1000n,
      takerAmount: 2000n,
      takerTokenFeeAmount: 0n,
      maker: '0x' + 'aa'.repeat(20),
      taker: '0x' + '00'.repeat(20),
      sender: '0x' + '00'.repeat(20),
      feeRecipient: '0x' + '00'.repeat(20),
      pool: '0x' + '00'.repeat(32),
      expiry: Math.floor(Date.now() / 1000) + 3600,
      salt: 1234567890n,
    };
    const sig = {
      signatureType: SignatureType.EIP712,
      v: 27,
      r: '0x' + '00'.repeat(32),
      s: '0x' + '00'.repeat(32),
    };
    const tx = svc.buildFillLimitOrder(order as any, sig as any, 100n);
    expect(tx.to.toLowerCase()).toBe(cfg.exchangeProxy.toLowerCase());
    expect(tx.data.startsWith('0x')).toBe(true);
  });
});
