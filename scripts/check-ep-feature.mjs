import { JsonRpcProvider, Contract, ethers } from "ethers";

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const EP  = process.env.EP || "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

const ABI = ["function getFunctionImplementation(bytes4) view returns (address)"];

async function check(sig) {
  const provider = new JsonRpcProvider(RPC);
  const ep = new Contract(EP, ABI, provider);
  const selector = ethers.id(sig).slice(0,10);
  const impl = await ep.getFunctionImplementation(selector);
  console.log(sig.padEnd(50), selector, "", impl);
}

(async () => {
  const sig = process.argv[2] || "cancelPairLimitOrders(address,address,uint256)";
  await check(sig);
})();
