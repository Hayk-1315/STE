import { JsonRpcProvider, ethers, Contract } from "ethers";

const RPC_URL = "https://mainnet.base.org";
const EP = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

const ZEROEX_ABI = [
  "function getFunctionImplementation(bytes4 selector) view returns (address impl)"
];

const SIG =
  "batchFillLimitOrders((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)";

const provider = new JsonRpcProvider(RPC_URL);
const zeroEx = new Contract(EP, ZEROEX_ABI, provider);

const selector = ethers.id(SIG).slice(0, 10);

console.log("[RPC]", RPC_URL);
console.log("[EP]", EP);
console.log("[selector]", selector, "de", SIG);

zeroEx.getFunctionImplementation(selector)
  .then((impl) => {
    console.log("[getFunctionImplementation] ", impl);
    if (String(impl).toLowerCase() === "0x0000000000000000000000000000000000000000") {
      console.log(" batchFillLimitOrders NO está registrado en este EP (sin soporte).");
      process.exitCode = 2;
    } else {
      console.log(" batchFillLimitOrders SÍ está registrado en este EP. (Hay soporte en el router).");
    }
  })
  .catch((e) => {
    console.error(" getFunctionImplementation no existe o falló:");
    console.error(e?.shortMessage || e?.message || String(e));
    process.exit(1);
  });
