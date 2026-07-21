// apps/web/src/hooks/useDelegationCapability.ts
// Resolves whether the delegated-CMR (Nexus SA) UI is available for the current
// wallet + backend. Capability matrix (Milestone 3A):
//   - MetaMask / injected → NEXUS_SA owner-userOp signing PROVEN → supported.
//   - Web3Auth → owner-userOp signing UNPROVEN → disabled until tested.
//   - EIP-7702 → deferred/disabled (dApp cannot drive it via MetaMask).
// Even when "supported", the backend still hard-disables writes on base-mainnet /
// READ_ONLY, so this is a UI gate layered on top of the backend guards.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@/providers/wallet";
import {
  getDelegationCapabilities,
  isDelegatedEnabled,
  type DelegationAccountModel,
  type DelegationStatusResponse,
} from "@/lib/delegated";

export type WalletSupport = "supported" | "unproven" | "unknown";

export type DelegationCapability = {
  /** Flag on + backend enabled + backend supports it + wallet proven. */
  available: boolean;
  /** The only supported model in v1 (EIP-7702 deferred). */
  accountModel: DelegationAccountModel | null;
  walletSupport: WalletSupport;
  /** Human reason when unavailable (for the shell copy). */
  reason: string;
  loading: boolean;
  backend: DelegationStatusResponse | null;
};

function walletSupportFor(source: "injected" | "web3auth" | undefined): WalletSupport {
  if (source === "injected") return "supported"; // MetaMask owner-userOp proven
  if (source === "web3auth") return "unproven"; // not yet tested → disabled
  return "unknown";
}

export function useDelegationCapability(): DelegationCapability {
  const { source, ready } = useWallet();
  const flagOn = useMemo(() => isDelegatedEnabled(), []);
  const [backend, setBackend] = useState<DelegationStatusResponse | null>(null);
  // Starts loading only when the flag is on; state updates below happen after an
  // await (never synchronously in the effect) per react-hooks/set-state-in-effect.
  const [loading, setLoading] = useState<boolean>(() => isDelegatedEnabled());

  useEffect(() => {
    if (!flagOn) return;
    let active = true;
    void (async () => {
      try {
        const b = await getDelegationCapabilities();
        if (active) setBackend(b);
      } catch {
        if (active) setBackend(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [flagOn]);

  const walletSupport = walletSupportFor(source);
  const backendOk =
    !!backend &&
    backend.enabled &&
    backend.capabilities.supported &&
    backend.capabilities.accountModels.includes("NEXUS_SA");

  let reason = "";
  if (!flagOn) reason = "Delegated execution is not enabled.";
  else if (!ready) reason = "Connect a wallet to use delegated execution.";
  else if (walletSupport === "unproven")
    reason =
      "Delegated execution isn't available for this wallet yet (Web3Auth is not verified). Use manual confirmation.";
  else if (walletSupport === "unknown")
    reason = "Connect an injected wallet (e.g. MetaMask) for delegated execution.";
  else if (loading) reason = "Checking delegated availability…";
  else if (!backendOk)
    reason = backend?.reason ?? "Delegated execution isn't available on this network.";

  const available = flagOn && ready && walletSupport === "supported" && backendOk;

  return {
    available,
    accountModel: available ? "NEXUS_SA" : null,
    walletSupport,
    reason,
    loading,
    backend,
  };
}
