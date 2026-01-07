// apps/web/src/components/ConnectButton.tsx
// apps/web/src/components/ConnectButton.tsx
"use client";

import React from "react";
import { useWallet } from "@/providers/wallet";
import { env } from "@/lib/env";

export default function ConnectButton() {
  const { address, ready, connectInjected, connectWeb3Auth, disconnect } = useWallet();
  const web3authEnabled = Boolean(env().NEXT_PUBLIC_WEB3AUTH_CLIENT_ID);
  if (ready && address) {
    return (
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={connectInjected}>
        MetaMask
      </button>
      {web3authEnabled && (
        <button className="px-3 py-1 rounded border" onClick={connectWeb3Auth}>
          Web3Auth
        </button>
      )}
    </div>
  );
}
