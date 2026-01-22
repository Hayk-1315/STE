// scripts/get-order-info-by-struct.mjs
import { JsonRpcProvider, Interface, getAddress } from "ethers";

const RPC  = process.env.RPC || "http://127.0.0.1:8545";
const EP   = getAddress(process.env.EP || "0xDef1C0ded9bec7F1a1670819833240f027b25EfF");

// Pasa el ORDER_JSON por env (el struct exacto que firmaste)
const ORDER = JSON.parse(process.env.ORDER_JSON || "{}");

const i = new Interface([
  "function getLimitOrderInfo((address makerToken,address takerToken,uint128 makerAmount,uint128 takerAmount,uint128 takerTokenFeeAmount,address maker,address taker,address sender,address feeRecipient,bytes32 pool,uint64 expiry,uint256 salt)) view returns (bytes32 orderHash, uint8 status, uint128 takerTokenFilledAmount)"
]);

const labels = ["INVALID(0)","FILLABLE(1)","FILLED(2)","CANCELLED(3)","EXPIRED(4)"];

(async () => {
  const p = new JsonRpcProvider(RPC);
  const data = i.encodeFunctionData("getLimitOrderInfo", [ORDER]);
  const ret  = await p.call({ to: EP, data });
  const [hash, status, filled] = i.decodeFunctionResult("getLimitOrderInfo", ret);
  console.log("orderHash =", hash);
  console.log("status    =", Number(status), labels[Number(status)] ?? "?");
  console.log("takerFilled =", filled.toString());
})();
