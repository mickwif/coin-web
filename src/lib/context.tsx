import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MoonPayProviderWrapper } from "./providers";
import {PrivyProvider,usePrivy} from '@privy-io/react-auth';


// Dynamically import WalletProvider with SSR disabled
const WalletProvider = dynamic(
  () => import("yeezy-wallet-sdk").then((mod) => mod.WalletProvider),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-4">Loading ...</div>
  }
);

// Dynamically import MoonPay components with SSR disabled
const MoonPayProvider = dynamic(
  () => import("@moonpay/moonpay-react").then((mod) => mod.MoonPayProvider),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-4">Loading...</div>
  }
);

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(error);
    },
  }),
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://wallet.sit.yeezy-test.tech";
const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://yeezy-rpc.com";

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID
export const AppProvider = ({ children }: { children: React.ReactNode }) => {

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          solana:{
            createOnLogin:'users-without-wallets'// Create a wallet for users who do not have a wallet on login.
          }
        },
        appearance: {
          showWalletLoginFirst: false,
          walletChainType: 'solana-only',
          walletList: ['phantom'],
        },
  
      
        solanaClusters: [{
         name: 'mainnet-beta',
         rpcUrl: SOLANA_RPC_URL,
        }]
         
      }}
    >
    <MoonPayProvider
        apiKey={process.env.NEXT_PUBLIC_MOONPAY_API_KEY || ""}
        debug={process.env.NEXT_PUBLIC_MOONPAY_DEBUG === "true"}
      >
        <MoonPayProviderWrapper>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </MoonPayProviderWrapper>
        </MoonPayProvider>
    </PrivyProvider>
  );
};
