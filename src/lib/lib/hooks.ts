import { useCallback, useMemo } from "react";
import { useWallet } from "./context";
import type { Chain } from "./types";
import { Transaction } from "@solana/web3.js";

export function useWalletClient() {
  const {
    wallet,
    signMessage: contextSignMessage,
    sendTransaction: contextSendTransaction,
    signTransaction: contextSignTransaction,
  } = useWallet();

  const client = useMemo(
    () => ({
      wallet: wallet,
      async signMessage(message: string) {
        return contextSignMessage(message);
      },
      async sendTransaction(transaction: Transaction) {
        return contextSendTransaction(transaction);
      },
      async signTransaction(transaction: Transaction) {
        return contextSignTransaction(transaction);
      },
    }),
    [wallet, contextSignMessage, contextSendTransaction, contextSignTransaction]
  );

  return client;
}

export function useConnect() {
  const { connect, disconnect, isConnecting } = useWallet();

  return {
    connect,
    disconnect,
    isConnecting,
  };
}

export function useWalletStatus() {
  const { error, session, isInitialized, wallet } =
    useWallet();

  return {
    isAuthenticated: wallet !== null,
    authenticated: wallet !== null,
    error,
    session,
    isInitialized,
    ready: isInitialized,
  };
}

export function useActiveWallet() {
  const { wallet } = useWallet();
  return { wallet };
}
