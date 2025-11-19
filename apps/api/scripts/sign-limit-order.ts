// apps/api/scripts/sign-limit-order.ts
// Dev helper: build and sign a 0x LimitOrder matching the backend EIP-712 domain/types.
// Run with:
//   pnpm --filter ./apps/api exec ts-node -r tsconfig-paths/register scripts/sign-limit-order.ts

import {
  Wallet,
  TypedDataEncoder,
  type TypedDataDomain,
  type TypedDataField,
} from 'ethers';
import {
  EIP712_LIMIT_ORDER_TYPES,
  SignatureType,
  type LimitOrder,
  type Signature,
} from '../src/zeroex/limit-order.types';

const ZEROEX_EXCHANGE_PROXY =
  (process.env.ZEROEX_EXCHANGE_PROXY as `0x${string}`) ??
  ('0x0000000000000000000000000000000000000001' as `0x${string}`);

const CHAIN_ID = Number.parseInt(
  process.env.ZEROEX_CHAIN_ID ?? process.env.CHAIN_ID ?? '84532',
  10,
);

// ⚠️ Dev-only private key. Never use this in any real environment.
const PRIVATE_KEY =
  process.env.DEV_ORDER_SIGNER_KEY ??
  '0x59c6995e998f97a5a0044976f27d6c93e8d1ff65000000000000000000000000';

async function main(): Promise<void> {
  const wallet = new Wallet(PRIVATE_KEY);

  // Must match your seeded markets.json
  const WETH = '0x0000000000000000000000000000000000000001' as `0x${string}`;
  const USDC = '0x0000000000000000000000000000000000000002' as `0x${string}`;

  // Log context

  console.log(
    JSON.stringify(
      {
        maker: wallet.address,
        chainId: CHAIN_ID,
        exchangeProxy: ZEROEX_EXCHANGE_PROXY,
        WETH,
        USDC,
      },
      null,
      2,
    ),
  );

  // 0x v4 LimitOrder strict typing:
  // - amounts, expiry, salt are bigint
  // - addresses are `0x${string}`
  const order: LimitOrder = {
    makerToken: WETH,
    takerToken: USDC,
    makerAmount: 1_000_000_000_000_000_000n, // 1 WETH (18 decimals)
    takerAmount: 100_000_000n, // 100 USDC (6 decimals)
    takerTokenFeeAmount: 0n,
    maker: wallet.address as `0x${string}`,
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pool: '0x0000000000000000000000000000000000000000000000000000000000000000',
    expiry: 0,
    salt: BigInt(Math.floor(Date.now() / 1000)),
  };

  const orderForPost = {
    ...order,
    makerAmount: order.makerAmount.toString(),
    takerAmount: order.takerAmount.toString(),
    takerTokenFeeAmount: order.takerTokenFeeAmount.toString(),
    salt: order.salt.toString(),
  };

  const domain: TypedDataDomain = {
    name: '0x Protocol',
    version: '4',
    chainId: CHAIN_ID,
    verifyingContract: ZEROEX_EXCHANGE_PROXY,
  };

  const types: Record<string, TypedDataField[]> =
    EIP712_LIMIT_ORDER_TYPES as unknown as Record<string, TypedDataField[]>;

  // Hash (for visibility)
  const orderHash = TypedDataEncoder.hash(
    domain,
    types,
    order as unknown as Record<string, unknown>,
  );

  console.log('orderHash:', orderHash);

  // Sign typed data (we allow a single, scoped eslint disable due to ethers API)

  const sigFlat = await wallet.signTypedData(
    domain,
    types,
    order as unknown as Record<string, any>,
  );

  // 0x v4 signature layout: [r (32)] [s (32)] [v (1)] [signatureType (1)]
  const sigBytes = sigFlat.slice(2); // remove 0x prefix
  const r: `0x${string}` = `0x${sigBytes.slice(0, 64)}`;
  const s: `0x${string}` = `0x${sigBytes.slice(64, 128)}`;
  const vHex = `0x${sigBytes.slice(128, 130)}`;
  const v = Number.parseInt(vHex, 16);

  const signature: Signature = {
    signatureType: SignatureType.EIP712,
    v,
    r,
    s,
  };

  const body = {
    order: orderForPost,
    signature,
  };

  console.log('\n=== POST /orders body ===');

  console.log(JSON.stringify(body, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
