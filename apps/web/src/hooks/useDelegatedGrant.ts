// apps/web/src/hooks/useDelegatedGrant.ts
// Milestone 3C: orchestrates the delegated-CMR grant lifecycle for a CMR
// intent that already exists and is owned by the connected EOA (created via
// the EXISTING useSeaCreate().createCMR — unchanged). This hook does not
// create intents itself; it only prepares/finalizes/revokes the Smart-Session
// grant on top of one. The owner signs the enable digest with the EXISTING
// personalSign (raw-bytes EIP-191, same path CL's ETHSIGN fallback uses) —
// never a new signing method. The backend session key never touches a user key.
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/providers/wallet";
import {
  finalizeDelegatedGrant,
  prepareDelegatedGrant,
  revokeDelegatedGrant,
  type PrepareGrantResponse,
} from "@/lib/delegated";

export type GrantStatus =
  | "idle"
  | "preparing"
  | "awaiting_signature"
  | "finalizing"
  | "active"
  | "revoking"
  | "revoked"
  | "error";

export type GrantState = {
  status: GrantStatus;
  error: string | null;
  accountAddress: string | null; // the Nexus SA (0x taker)
  permissionId: string | null;
  prepare: PrepareGrantResponse | null;
};

const initialState: GrantState = {
  status: "idle",
  error: null,
  accountAddress: null,
  permissionId: null,
  prepare: null,
};

export function useDelegatedGrant() {
  const { address, personalSign } = useWallet();
  const [state, setState] = useState<GrantState>(initialState);

  /**
   * Full prepare -> sign(enableDigest) -> finalize round-trip for one intent.
   * accountModel is fixed to NEXUS_SA (EIP-7702 stays deferred). Never runs
   * without an owner EOA connected; the owner confirms one wallet signature.
   */
  const createGrant = useCallback(
    async (intentId: string) => {
      if (!address) {
        setState({ ...initialState, status: "error", error: "Connect wallet first." });
        return;
      }
      setState({ ...initialState, status: "preparing" });
      try {
        const prep = await prepareDelegatedGrant({
          intentId,
          owner: address,
          accountModel: "NEXUS_SA",
        });
        if (!prep.ok || !prep.enableDigest || !prep.sessionBlob || !prep.accountAddress) {
          setState({
            ...initialState,
            status: "error",
            error: prep.reason ?? "prepare_failed",
          });
          return;
        }
        setState((s) => ({
          ...s,
          status: "awaiting_signature",
          accountAddress: prep.accountAddress ?? null,
          prepare: prep,
        }));

        // Existing raw-bytes EIP-191 personal_sign over the 32-byte digest —
        // the SAME method used for the CL ETHSIGN fallback. No new signing path.
        const ownerSignature = await personalSign(prep.enableDigest);

        setState((s) => ({ ...s, status: "finalizing" }));
        const fin = await finalizeDelegatedGrant({
          intentId,
          owner: address,
          accountModel: "NEXUS_SA",
          accountAddress: prep.accountAddress,
          sessionBlob: prep.sessionBlob,
          ownerSignature,
        });
        if (!fin.ok) {
          setState((s) => ({
            ...s,
            status: "error",
            error: fin.reason ?? "finalize_failed",
          }));
          return;
        }
        setState((s) => ({
          ...s,
          status: "active",
          permissionId: fin.permissionId ?? null,
        }));
        toast.success("Delegated grant active", { description: intentId });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setState((s) => ({ ...s, status: "error", error: msg }));
        toast.error("Delegated grant failed", { description: msg });
      }
    },
    [address, personalSign],
  );

  const revoke = useCallback(
    async (intentId: string) => {
      if (!address) return;
      setState((s) => ({ ...s, status: "revoking" }));
      try {
        const res = await revokeDelegatedGrant({ intentId, owner: address });
        if (!res.ok) {
          setState((s) => ({
            ...s,
            status: "error",
            error: res.reason ?? "revoke_failed",
          }));
          return;
        }
        // Backend already marks the grant REVOKED regardless of on-chain send;
        // if the SmartSession disable call needs sending, that is Milestone 3D
        // (delegated row actions / attempts UI). Reflect the stop here.
        setState((s) => ({ ...s, status: "revoked" }));
        toast.success("Delegated grant revoked", { description: intentId });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setState((s) => ({ ...s, status: "error", error: msg }));
        toast.error("Revoke failed", { description: msg });
      }
    },
    [address],
  );

  const reset = useCallback(() => setState(initialState), []);

  return { state, createGrant, revoke, reset };
}
