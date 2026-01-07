// scripts/check-0x-features.mjs
import { JsonRpcProvider, ethers, Contract } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "https://mainnet.base.org";
const EP      = process.env.EP      ?? "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

const ABI = [
  "function getFunctionImplementation(bytes4 selector) view returns (address impl)"
];

const SIGS = {
  // limit orders
  fillLimitOrder:
    "fillLimitOrder((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128)",
  batchFillLimitOrders:
    "batchFillLimitOrders((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)",
  batchFillLimitOrdersNoThrow:
    "batchFillLimitOrdersNoThrow((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)",

  // RFQ (por si el EP tuviera RFQ batching)
  batchFillRfqOrders:
    "batchFillRfqOrders((address,address,address,address,uint128,uint128,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)",
  batchFillRfqOrdersNoThrow:
    "batchFillRfqOrdersNoThrow((address,address,address,address,uint128,uint128,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)",

  // transformERC20 (enrutador genérico de swaps)
  transformERC20:
    "transformERC20(address,address,uint256,uint256,(address,bytes)[])",
};

const provider = new JsonRpcProvider(RPC_URL);
const ep = new Contract(EP, ABI, provider);

console.log("[RPC]", RPC_URL);
console.log("[EP ]", EP);
for (const [name, sig] of Object.entries(SIGS)) {
  const selector = ethers.id(sig).slice(0, 10);
  try {
    const impl = await ep.getFunctionImplementation(selector);
    const ok = String(impl).toLowerCase() !== "0x0000000000000000000000000000000000000000";
    console.log(`${name.padEnd(28)} ${selector} → ${impl} ${ok ? "✅" : "❌"}`);
  } catch (e) {
    console.log(`${name.padEnd(28)} (no getFunctionImplementation) ⚠️`);
  }
}
