// scripts/check-pair-cutoff.mjs
import { JsonRpcProvider, Interface, getAddress } from "ethers";

const RPC   = process.env.RPC || "http://127.0.0.1:8545";
const EP    = getAddress(process.env.EP || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF");
const MAKER = getAddress(process.env.MAKER || "");
const MK    = getAddress(process.env.MAKER_TOKEN || "");
const TK    = getAddress(process.env.TAKER_TOKEN || "");
const SALT  = BigInt(process.env.SALT || "0");

const i = new Interface([
  "function getPairOrderMinimumValidSalt(address maker, address makerToken, address takerToken) view returns (uint256)"
]);

(async () => {
  if (!MAKER || !MK || !TK) {
    console.error("Set MAKER, MAKER_TOKEN, TAKER_TOKEN, SALT (opcional)");
    process.exit(1);
  }
  const p = new JsonRpcProvider(RPC);
  try {
    const ret = await p.call({
      to: EP,
      data: i.encodeFunctionData("getPairOrderMinimumValidSalt", [MAKER, MK, TK])
    });
    const minValid = i.decodeFunctionResult("getPairOrderMinimumValidSalt", ret)[0];
    console.log("minValidSalt =", minValid.toString());
    if (SALT) {
      console.log("salt < minValid ?", SALT < minValid ? "YES (cancelled by pair)" : "NO");
    }
  } catch {
    console.log("EP no expone getPairOrderMinimumValidSalt() en esta red. (OK)");
  }
})();
