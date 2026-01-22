// scripts/make-cancelpair.mjs
import { JsonRpcProvider, Wallet, Interface } from "ethers";
import fs from "node:fs";

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const PK  = process.env.PRIVATE_KEY; // el MAKER que firmó las órdenes
const EP  = process.env.EP || "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

const makerToken = process.env.MAKER_TOKEN; // ej: WETH
const takerToken = process.env.TAKER_TOKEN; // ej: USDC

if (!PK || !makerToken || !takerToken) {
  console.error("Set PRIVATE_KEY, MAKER_TOKEN, TAKER_TOKEN (and optional EP, RPC_URL).");
  process.exit(1);
}

const SALT_OFFSET = (1n << 128n);

// cutoff = “invalidar todo lo anterior a este segundo” (o cambia por el que quieras)
const cutoffSec = BigInt(Math.floor(Date.now() / 1000));
// minValidSalt = 2^128 + (cutoffSec << 96)
const minValidSalt = SALT_OFFSET + (cutoffSec << 96n);

const ABI = ['function cancelPairLimitOrders(address,address,uint256)'];
const iface = new Interface(ABI);

const data = iface.encodeFunctionData('cancelPairLimitOrders', [
  makerToken,
  takerToken,
  minValidSalt
]);

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(PK, provider);

console.log("[maker]", await wallet.getAddress());
console.log("[pair ]", makerToken, takerToken);
console.log("[salt ]", minValidSalt.toString());

const tx = await wallet.sendTransaction({ to: EP, data, value: 0n });
console.log("sent:", tx.hash);
const rec = await tx.wait();
console.log("confirmed:", rec?.hash ?? tx.hash);

/*$BASE = "http://localhost:3001"
Invoke-RestMethod -Uri "$BASE/orderbook?symbol=WETH-USDC&source=live&depth=25" -Method Get | ConvertTo-Json -Depth 50

Para ejecutar:
$env:RPC_URL      = "http://127.0.0.1:8545"
$env:PRIVATE_KEY  = "d79773b9c25fc8856eaffbe5abebe261be7c36e1877018c52d2397042c4bc1bd"
$env:MAKER_TOKEN  = "0x4200000000000000000000000000000000000006" # WETH
$env:TAKER_TOKEN  = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" # USDC (con checksum!)
node scripts\make-cancelpair.mjs
*/