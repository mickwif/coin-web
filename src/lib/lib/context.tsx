import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WalletInfo, UserSession } from "./types";
import { WalletClient, WalletProviderConfig } from "./client";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { modalManager } from "./modal";
import {
  retrieveAndClearTwitterCodeChallenge,
  verifyAndClearState,
} from "./utils/twitter";

interface WalletState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  isInitialized: boolean;
  walletInfo: WalletInfo | null;
  wallet: WalletClient | null;
  session: UserSession | null;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: Transaction |VersionedTransaction) => Promise<string>;
  signTransaction: (transaction: Transaction |VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
}

const initialState: WalletState = {
  isAuthenticated: false,
  isConnecting: false,
  isInitialized: false,
  walletInfo: null,
  wallet: null,
  session: null,
  error: null,
};

const WalletContext = createContext<WalletContextValue>(
  {} as WalletContextValue
);

type Action =
  | { type: "SET_CONNECTING"; payload: boolean }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "SET_SESSION"; payload: UserSession }
  | { type: "SET_WALLET_INFO"; payload: WalletInfo }
  | { type: "SET_WALLET"; payload: WalletClient }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

function walletReducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case "SET_CONNECTING":
      return { ...state, isConnecting: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    case "SET_SESSION":
      return {
        ...state,
        isAuthenticated: true,
        session: action.payload,
        error: null,
      };
    case "SET_WALLET_INFO":
      return { ...state, walletInfo: action.payload };
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET":
      return { ...initialState, isInitialized: true };
    default:
      return state;
  }
}

interface WalletProviderProps {
  children: ReactNode;
  config: WalletProviderConfig;
}

let checkingTwitterCallback = false;
let checkingGoogleCallback = false;
export function WalletProvider({ children, config }: WalletProviderProps) {
  // const client = new WalletClient(config);
  const clientRef = useRef<WalletClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new WalletClient(config);
  }
  const client = clientRef.current;
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { walletInfo } = state;
  const hasAttemptedReconnect = useRef(false);

  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [isLoadingClientId, setIsLoadingClientId] = useState(true);
  

  // 自动重连逻辑
  useEffect(() => {
    async function autoReconnect() {
      if (hasAttemptedReconnect.current || state.isInitialized) return;

      hasAttemptedReconnect.current = true;
      try {
        const wallet = await client.reconnect();
        if (wallet) {
          dispatch({ type: "SET_WALLET_INFO", payload: wallet });
          dispatch({type: 'SET_WALLET', payload: client})
        }
      } catch (error) {
        console.error("Auto reconnect failed:", error);
      } finally {
        dispatch({ type: "SET_INITIALIZED", payload: true });
      }
    }

    autoReconnect();
  }, [client]);

  // Fetch Google Client ID on initialization
  useEffect(() => {
    async function fetchGoogleClientId() {
      try {
        const clientId = await client.getOAuth2ClientId('google');
        setGoogleClientId(clientId);
      } catch (error) {
        console.error('Error fetching Google Client ID:', error);
      } finally {
        setIsLoadingClientId(false);
      }
    }
    
    fetchGoogleClientId();
  }, [config.baseURL]);

  useEffect(() => {
    //TODO: handle twitter oauth callback
    const handleTwitterCallback = async () => {
      try {
        if (checkingTwitterCallback) {
          return;
        }
        checkingTwitterCallback = true;
        dispatch({ type: "SET_CONNECTING", payload: true });
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const paramState = urlParams.get("state");
        if (!code) {
          throw new Error("No code found in URL parameters");
        }

        if (!paramState) {
          throw new Error("No state found in URL parameters");
        }

        if (!verifyAndClearState(paramState)) {
          throw new Error("State verification failed");
        }
        // modalManager.showLoginModal({
        //   client,
        //   isLoading: true,
        // });
        const wallet = await client.twitterLogin({
          code,
          redirect_uri: `${window.location.origin}/twitter/callback`,
          code_verifier: retrieveAndClearTwitterCodeChallenge(),
        });
        console.log("wallet", wallet);
        if (wallet) {
          dispatch({ type: "SET_WALLET_INFO", payload: wallet });
          dispatch({type: 'SET_WALLET', payload: client})
          // Get the return URL from session storage
          const returnUrl = sessionStorage.getItem("auth_return_url") || "/";
          // Clear the return URL from session storage
          sessionStorage.removeItem("auth_return_url");
          // Redirect back to the original page
          window.location.href = returnUrl; //TODO
        }
        await modalManager.hideModal();
      } catch (e) {
        console.log("twitter error: ", e);
        console.error("Twitter callback error:", e);
        // Store error in session storage to display on redirect
        sessionStorage.setItem("auth_error", e instanceof Error ? e.message : "Failed to connect");
        // Redirect to error page or home page
        // window.location.href = "/error";
      } finally {
        dispatch({ type: "SET_CONNECTING", payload: false });
        checkingTwitterCallback = false;
      }
    };
    const handleGoogleCallback = async () => {
      try {
        if (checkingGoogleCallback) {
          return;
        }
        checkingGoogleCallback = true;
        dispatch({ type: "SET_CONNECTING", payload: true });
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (!code) {
          throw new Error("No code found in URL parameters");
        }

        // modalManager.showLoginModal({
        //   client,
        //   isLoading: true,
        // });
        const wallet = await client.googleLogin({
          code,
          redirect_uri: `${window.location.origin}/google/callback`,
        });
        console.log("wallet", wallet);
        if (wallet) {
          dispatch({ type: "SET_WALLET_INFO", payload: wallet });
          dispatch({type: 'SET_WALLET', payload: client})
          // Get the return URL from session storage
          const returnUrl = sessionStorage.getItem("auth_return_url") || "/";
          // Clear the return URL from session storage
          sessionStorage.removeItem("auth_return_url");
          // Redirect back to the original page
          window.location.href = returnUrl; //TODO
        }
        await modalManager.hideModal();
      } catch (e) {
        console.log("google error: ", e);
        console.error("Google callback error:", e);
        // Store error in session storage to display on redirect
        sessionStorage.setItem("auth_error", e instanceof Error ? e.message : "Failed to connect");
        // Redirect to error page or home page
        // window.location.href = "/error";
      } finally {
        dispatch({ type: "SET_CONNECTING", payload: false });
        checkingGoogleCallback = false;
      }
    };
    if (window.location.pathname.includes("/twitter/callback")) {
      handleTwitterCallback();
    }
    if (window.location.pathname.includes("/google/callback")) {
      handleGoogleCallback();
    }
  }, [client]);

  const connect = useCallback(async () => {
    if (isLoadingClientId || !googleClientId) {
      console.log("isLoadingClientId", isLoadingClientId);
      console.log("googleClientId", googleClientId);
      return;
    }

    try {
      dispatch({ type: "SET_CONNECTING", payload: true });
      modalManager.showLoginModal({
        client,
        googleClientId,
        onClose: () => {
          dispatch({ type: "SET_CONNECTING", payload: false });
        },
        onLogin: (walletInfo: WalletInfo) => {
          dispatch({ type: "SET_CONNECTING", payload: false });
          dispatch({ type: "SET_WALLET_INFO", payload: walletInfo });
          dispatch({type: 'SET_WALLET', payload: client})

        },
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to connect",
      });
      dispatch({ type: "SET_CONNECTING", payload: false });
    }
  }, [client, isLoadingClientId]);

  const disconnect = useCallback(async () => {
    await client.logout();
    dispatch({ type: "RESET" });
  }, [client]);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!walletInfo) throw new Error("No wallet ");
      console.log("walletInfo: ", client.getWallet());
      return client.signMessage(message);
    },
    [walletInfo, client]
  );

  const signTransaction = useCallback(
    async (transaction: Transaction| VersionedTransaction): Promise<Transaction| VersionedTransaction> => {
      if (!walletInfo) throw new Error("No wallet");
      const signed = await client.signTransaction(transaction);
      return signed;
    },
    [walletInfo, client]
  );

  const sendTransaction = useCallback(
    async (transaction: Transaction|VersionedTransaction): Promise<string> => {
      if (!walletInfo) throw new Error("No wallet");
      return client.sendTransaction(transaction.serialize());
    },
    [walletInfo, client]
  );

  const value = {
    ...state,
    connect,
    disconnect,
    signMessage,
    signTransaction,
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
