import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useAllowanceStatus(params: {
  provider: ethers.Provider | null | undefined;
  token: `0x${string}` | null | undefined;
  owner: `0x${string}` | null | undefined;
  spender: `0x${string}` | null | undefined;
  decimals: number;
}) {
  const { provider, token, owner, spender, decimals } = params;

  const [loading, setLoading] = useState(false);
  const [allowance, setAllowance] = useState<bigint | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!provider || !token || !owner || !spender) {
        if (alive) setAllowance(null);
        return;
      }
      setLoading(true);
      try {
        const erc20 = new ethers.Contract(
          token,
          ["function allowance(address owner, address spender) view returns (uint256)"],
          provider,
        );
        const v: bigint = await erc20.allowance(owner, spender);
        if (alive) setAllowance(v);
      } catch {
        if (alive) setAllowance(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void run();
    return () => {
      alive = false;
    };
    // deps ESTABLES, nada de funciones/literales
  }, [provider, token, owner, spender]);

  const MAX = ethers.MaxUint256;
  // tolerancia para “casi max” (algunos wallets usan MAX-1)
  const isUnlimited = allowance !== null && allowance >= MAX - MAX / BigInt(1000000);

  const human =
    allowance === null ? "" : isUnlimited ? "Unlimited" : ethers.formatUnits(allowance, decimals);

  return { loading, allowance, isUnlimited, human };
}
