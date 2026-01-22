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
    <div className="flex gap-1">
      <button
        className="rounded-full px-3 py-1 text-xs font-medium bg-sky-600 text-white hover:bg-sky-500 transition"
        onClick={connectInjected}
      >
        MetaMask
      </button>
      {web3authEnabled && (
        <button
          className="rounded-full px-3 py-1 text-xs font-medium border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
          onClick={connectWeb3Auth}
        >
          Web3Auth
        </button>
      )}
    </div>
  );
}
