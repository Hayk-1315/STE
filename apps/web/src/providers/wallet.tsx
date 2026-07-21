/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/web/src/providers/wallet.tsx
// Purpose: Simple wallet context with Injected (EIP-1193) + Web3Auth modal (happy path).

"use client";

import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";
import { ethers, type Eip1193Provider, type TypedDataDomain, type TypedDataField } from "ethers";
import { env } from "@/lib/env";

// Web3Auth (PnP Web SDK v10 / MetaMask Embedded Wallets)
import { Web3Auth, WEB3AUTH_NETWORK, type IProvider } from "@web3auth/modal";
import { toast } from "sonner";

type WalletState = {
  address?: `0x${string}`;
  chainId?: number;
  ready: boolean;
  source?: "injected" | "web3auth"; // <— NUEVO

  connectInjected: () => Promise<void>;
  connectWeb3Auth: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTypedData: (p: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    message: Record<string, unknown>;
  }) => Promise<string>;
  personalSign: (message: string) => Promise<string>;
  /**
   * Phase 5 bug-fix: arbitrary EIP-191 personal_sign over a UTF-8 message.
   * Use this for canonical SEA messages (CMR ownerAuth, intent cancel auth)
   * — the existing `personalSign(orderHash)` rejects non-hex inputs and is
   * reserved for the ETHSIGN orderHash fallback in `useOrderSigning`.
   */
  personalSignMessage: (message: string) => Promise<string>;
  getSigner: () => Promise<ethers.Signer>;
  /**
   * Phase 3b (delegated CMR): the raw EIP-1193 provider for the connected wallet
   * (injected or Web3Auth), so viem / @biconomy/abstractjs can wrap it for Nexus
   * SA owner userOps. Additive read-only accessor — it does NOT change any of the
   * ethers-based signing methods above. Returns null when not connected.
   */
  getRawProvider: () => Eip1193Provider | null;
};

const Ctx = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { NEXT_PUBLIC_CHAIN_ID, NEXT_PUBLIC_WEB3AUTH_CLIENT_ID, NEXT_PUBLIC_WEB3AUTH_NETWORK } =
    env();

  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [ready, setReady] = useState<boolean>(false);
  const [source, setSource] = useState<"injected" | "web3auth" | undefined>(undefined);

  const providerRef = useRef<ethers.BrowserProvider | null>(null);
  const web3authRef = useRef<Web3Auth | null>(null);

  // <<< NUEVO: guardamos también el provider EIP-1193 “crudo” para escuchar eventos
  const eip1193Ref = useRef<Eip1193Provider | null>(null);
  // <<< FIN NUEVO

  const hydrateFromProvider = useCallback(async (prov: ethers.BrowserProvider) => {
    const network = await prov.getNetwork();
    setChainId(Number(network.chainId.toString()));
    const signer = await prov.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr as `0x${string}`);
    setReady(true);
  }, []);

  // ---- Injected (MetaMask/CBW/etc) ----
  const connectInjected = useCallback(async () => {
    const injected = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
    if (!injected) throw new Error("No injected EIP-1193 provider found (MetaMask/Coinbase).");

    await injected.request({ method: "eth_requestAccounts" });

    // <<< NUEVO: guardamos el provider crudo para eventos
    eip1193Ref.current = injected;
    // <<< FIN NUEVO

    providerRef.current = new ethers.BrowserProvider(injected, "any");
    await hydrateFromProvider(providerRef.current);
    setSource("injected");
  }, [hydrateFromProvider]);

  // ---- Web3Auth (modal) happy path ----
  const connectWeb3Auth = useCallback(async () => {
    providerRef.current = null;
    if (!NEXT_PUBLIC_WEB3AUTH_CLIENT_ID) throw new Error("Web3Auth client id not configured.");

    if (!web3authRef.current) {
      // v10: chain config + login methods are managed in the Web3Auth dashboard.
      // Network is the only piece still selected from env (devnet vs mainnet).
      const w3a = new Web3Auth({
        clientId: NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
        web3AuthNetwork:
          NEXT_PUBLIC_WEB3AUTH_NETWORK === "sapphire_mainnet"
            ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
            : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      });

      await w3a.init();
      web3authRef.current = w3a;
    }

    const provider: IProvider | null = await web3authRef.current.connect();
    if (!provider) throw new Error("Web3Auth connect returned null provider");

    eip1193Ref.current = provider as unknown as Eip1193Provider;

    providerRef.current = new ethers.BrowserProvider(provider as unknown as Eip1193Provider, "any");
    await hydrateFromProvider(providerRef.current);
    setSource("web3auth");
  }, [NEXT_PUBLIC_WEB3AUTH_CLIENT_ID, NEXT_PUBLIC_WEB3AUTH_NETWORK, hydrateFromProvider]);

  // ---- Disconnect ----
  const disconnect = useCallback(async () => {
    setAddress(undefined);
    setChainId(undefined);
    setReady(false);
    providerRef.current = null;

    // <<< NUEVO: limpiamos también el ref del provider crudo
    eip1193Ref.current = null;
    // <<< FIN NUEVO

    if (web3authRef.current) {
      try {
        await web3authRef.current.logout();
      } catch {
        /* ignore */
      }
    }
    setSource(undefined);
  }, []);

  // ---- REACT A CAMBIOS DE CUENTA / NETWORK EN EL WALLET (SIN REFRESCAR) ----
  useEffect(() => {
    const raw = eip1193Ref.current as any;
    if (!raw) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        // Wallet “desconectada” desde el propio MM/Web3Auth
        setAddress(undefined);
        setReady(false);
        return;
      }
      setAddress(accounts[0] as `0x${string}`);
      setReady(true);
    };

    const handleChainChanged = (next: string | number) => {
      let parsed: number;
      if (typeof next === "string") {
        parsed = next.startsWith("0x") ? parseInt(next, 16) : Number(next);
      } else {
        parsed = Number(next);
      }
      setChainId(parsed);
    };

    if (typeof raw.on === "function") {
      raw.on("accountsChanged", handleAccountsChanged);
      raw.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof raw.removeListener === "function") {
        raw.removeListener("accountsChanged", handleAccountsChanged);
        raw.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [source]); // se reengancha cuando cambias de injected <-> web3auth
  // ---- FIN BLOQUE NUEVO ----

  // Aviso si el usuario está en la red equivocada
  useEffect(() => {
    if (!ready || !chainId) return;

    const expected = Number(NEXT_PUBLIC_CHAIN_ID);
    if (!expected) return;

    if (chainId !== expected) {
      const expectedLabel =
        expected === 8453
          ? "Base Mainnet"
          : expected === 11155111
            ? "Ethereum Sepolia"
            : `chainId ${expected}`;

      toast(
        `Estás conectado a la red equivocada (chainId=${chainId}). Cambia a ${expectedLabel} para usar el exchange.`,
      );
    }
  }, [chainId, ready, NEXT_PUBLIC_CHAIN_ID]);

  // ---- Signers & signing ----
  const getSigner = useCallback(async () => {
    if (!providerRef.current) throw new Error("Wallet not connected.");
    return providerRef.current.getSigner();
  }, []);

  // Phase 3b: expose the raw EIP-1193 provider (already tracked for events) so a
  // viem walletClient / abstractjs can wrap the connected wallet. Additive only.
  const getRawProvider = useCallback(() => eip1193Ref.current, []);

  const signTypedData = useCallback(
    async (p: {
      domain: TypedDataDomain;
      types: Record<string, TypedDataField[]>;
      message: Record<string, unknown>;
    }) => {
      if (!address) throw new Error("Wallet not connected.");

      const typesWithDomain: Record<string, TypedDataField[]> = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        ...p.types,
      };
      const payload = {
        types: typesWithDomain,
        domain: p.domain,
        primaryType: "LimitOrder",
        message: p.message,
      };
      const data = JSON.stringify(payload);

      const injected = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
      if (injected && typeof (injected as any).request === "function") {
        try {
          const accounts = await (injected as any).request({
            method: "eth_accounts",
          });
          console.info("[signTypedData] MM accounts =", accounts);
        } catch {}
      }
      console.info("[signTypedData] from =", address, "source =", source);

      if (source === "injected" && injected && typeof (injected as any).request === "function") {
        const sig = await (injected as any).request({
          method: "eth_signTypedData_v4",
          params: [address, data],
        });
        return sig as string;
      }

      if (
        source === "web3auth" &&
        providerRef.current &&
        typeof (providerRef.current as any).send === "function"
      ) {
        const sig = await (providerRef.current as any).send("eth_signTypedData_v4", [
          address,
          data,
        ]);
        return sig as string;
      }

      const signer = await getSigner();
      const s = signer as unknown as {
        signTypedData?: (
          domain: TypedDataDomain,
          types: Record<string, TypedDataField[]>,
          value: Record<string, unknown>,
        ) => Promise<string>;
      };
      if (typeof s.signTypedData === "function") {
        return await s.signTypedData(p.domain, p.types, p.message);
      }
      throw new Error("No EIP-712 v4 signing path available.");
    },
    [address, source, getSigner],
  );

  const personalSign = useCallback(
    async (message: string) => {
      // Para cancel by hash esperamos un hex "0x…"
      if (typeof message !== "string" || !message.startsWith("0x")) {
        throw new Error("personalSign expects an orderHash as 0x-prefixed hex string");
      }

      // Si hay provider inyectado (MetaMask/CBW) usa EIP-1193 con el ORDEN correcto [data, address]
      const injected = (window as unknown as { ethereum?: Eip1193Provider }).ethereum as
        | (Eip1193Provider & {
            request?: (args: { method: string; params?: any[] }) => Promise<any>;
          })
        | undefined;

      if (source === "injected" && injected?.request && address) {
        const sig = await injected.request({
          method: "personal_sign",
          params: [message, address], // ← orden correcto
        });
        return sig as string;
      }

      // Fallback (Web3Auth u otros): firma los BYTES del hash (no la cadena "0x…")
      const signer = await getSigner();
      const bytes = ethers.getBytes(message);
      const sig = await signer.signMessage(bytes);
      return sig as string;
    },
    [source, address, getSigner],
  );

  /**
   * Arbitrary EIP-191 personal_sign over a UTF-8 message (e.g. canonical SEA
   * `SEA-CMR-INTENT|...` / `SEA-CANCEL-INTENT|...` strings). Distinct from
   * `personalSign(orderHash)` above, which is dedicated to the ETHSIGN
   * fallback path in `useOrderSigning` and rejects non-hex inputs.
   *
   * Injected path: encode to UTF-8 hex bytes so MetaMask/CBW receive a
   * deterministic byte sequence (wallets render valid UTF-8 hex back as the
   * underlying string in their prompt). Web3Auth / signer fallback: defer to
   * ethers `signer.signMessage(string)`, which signs UTF-8 directly via
   * EIP-191. Both paths produce the same signature byte-for-byte.
   */
  const personalSignMessage = useCallback(
    async (message: string): Promise<string> => {
      if (typeof message !== "string" || message.length === 0) {
        throw new Error("personalSignMessage expects a non-empty string");
      }

      const injected = (window as unknown as { ethereum?: Eip1193Provider }).ethereum as
        | (Eip1193Provider & {
            request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
          })
        | undefined;

      if (source === "injected" && injected?.request && address) {
        // ethers v6: toUtf8Bytes → hexlify gives `0x<hex>` of the UTF-8 byte sequence.
        const hexUtf8 = ethers.hexlify(ethers.toUtf8Bytes(message));
        const sig = await injected.request({
          method: "personal_sign",
          params: [hexUtf8, address],
        });
        return sig as string;
      }

      // Web3Auth / fallback: ethers signMessage(string) hashes as UTF-8 under
      // EIP-191 ("\x19Ethereum Signed Message:\n<len><utf8 bytes>"). Matches
      // what MetaMask produces for the hex-utf8 path above.
      const signer = await getSigner();
      const sig = await signer.signMessage(message);
      return sig as string;
    },
    [source, address, getSigner],
  );

  const value: WalletState = {
    address,
    chainId,
    ready,
    source,
    connectInjected,
    connectWeb3Auth,
    disconnect,
    signTypedData,
    personalSign,
    personalSignMessage,
    getSigner,
    getRawProvider,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
