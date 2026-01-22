import { JsonRpcProvider, ethers, Contract } from "ethers";

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const EP      = process.env.EP      || "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

const ABI = ['function getFunctionImplementation(bytes4 selector) view returns (address impl)'];

const SIG = 'cancelPairLimitOrders(address,address,uint256)';

const provider = new JsonRpcProvider(RPC_URL);
const ep = new Contract(EP, ABI, provider);

const selector = ethers.id(SIG).slice(0, 10);

console.log("[RPC]", RPC_URL);
console.log("[EP ]", EP);
console.log("[selector]", selector, "de", SIG);

ep.getFunctionImplementation(selector)
  .then((impl) => {
    console.log("[getFunctionImplementation] ", impl);
    if (String(impl).toLowerCase() === "0x0000000000000000000000000000000000000000") {
      console.log(" NO está registrado en este EP.");
      process.exitCode = 2;
    } else {
      console.log(" SÍ está registrado en este EP.");
    }
  })
  .catch((e) => {
    console.error(" getFunctionImplementation no existe/falló:", e?.shortMessage || e?.message || String(e));
    process.exit(1);
  });
