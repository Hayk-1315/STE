// apps/api/scripts/sign-cancel-order.ts
// Usage:
//   pnpm --filter ./apps/api exec ts-node -r tsconfig-paths/register scripts/sign-cancel-order.ts 0xORDER_HASH WETH-USDC
// Env (opcional):
//   DEV_ORDER_SIGNER_KEY=0x<64-hex>

import { Wallet, getBytes, hashMessage, recoverAddress } from 'ethers';

const PRIVATE_KEY =
  process.env.DEV_ORDER_SIGNER_KEY ??
  // DEV ONLY — do not use in real environments
  '0x59c6995e998f97a5a0044976f27d6c93e8d1ff65000000000000000000000000';

function assertHex32(s: string): void {
  if (!/^0x[0-9a-fA-F]{64}$/.test(s)) {
    throw new Error('orderHash must be 0x + 64 hex chars');
  }
}

async function main(): Promise<void> {
  const orderHash = (process.argv[2] || '').trim();
  const marketId = (process.argv[3] || '').trim(); // symbol or DB id
  if (!orderHash || !marketId) throw new Error('usage: <orderHash> <marketId>');
  assertHex32(orderHash);

  const wallet = new Wallet(PRIVATE_KEY);

  // Sign EIP-191 personal_sign over the bytes of the orderHash
  const signature = await wallet.signMessage(getBytes(orderHash));

  // Optional local verify (should match maker)
  const recovered = recoverAddress(hashMessage(getBytes(orderHash)), signature);

  console.log(
    JSON.stringify(
      {
        maker: wallet.address,
        recovered,
        body: {
          marketId,
          orderHash,
          maker: wallet.address,
          signature,
          // scheme is optional; backend defaults to EthSign
        },
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
