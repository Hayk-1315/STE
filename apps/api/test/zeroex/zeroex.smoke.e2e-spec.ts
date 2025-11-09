// apps/api/test/zeroex/zeroex.smoke.e2e-spec.ts
import { ZeroExAddressesService } from '../../src/zeroex/addresses.service';
import { ZeroExSigningService } from '../../src/zeroex/signing.service';
import { ZeroExTxBuildersService } from '../../src/zeroex/tx-builders.service';
import { SignatureType } from '../../src/zeroex/limit-order.types';
import { Interface, isAddress } from 'ethers';

const cfg = {
  chainId: 8453,
  rpcUrl: 'http://localhost:8545',
  // Set EP only if auto-resolve fails in your env:
  // exchangeProxy: '0xDef1C0ded9bEc7F1A1670819833240f027b25EfF',
};

describe('zeroex smoke', () => {
  it('builds hash and calldata for a synthetic order', () => {
    const addr = new ZeroExAddressesService(cfg as any);
    const sign = new ZeroExSigningService(addr);
    const txb = new ZeroExTxBuildersService(addr);

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

    const hash = sign.getOrderHash(cfg.chainId, order as any);
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const sig = {
      signatureType: SignatureType.EIP712,
      v: 27,
      r: '0x' + '00'.repeat(32),
      s: '0x' + '00'.repeat(32),
    };
    const tx = txb.buildFillLimitOrder(order as any, sig as any, 100n);
    const selector = new Interface([
      'function fillLimitOrder((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt) order,(uint8 signatureType,uint8 v,bytes32 r,bytes32 s) signature,uint128 takerTokenFillAmount) payable returns (uint128,uint128)',
    ]).getFunction('fillLimitOrder')!.selector;

    expect(isAddress(tx.to)).toBe(true);
    expect(tx.data.slice(0, 10)).toBe(selector);
    expect(tx.value).toBe('0x0');
  });
});
