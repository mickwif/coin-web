import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Dynamically import WalletProvider with SSR disabled
const WalletProvider = dynamic(
  () => import("clique-wallet-sdk").then((mod) => mod.WalletProvider),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-4">Loading ...</div>
  }
);

// Dynamically import MoonPay components with SSR disabled
// const MoonPayProvider = dynamic(
//   () => import("@moonpay/moonpay-react").then((mod) => mod.MoonPayProvider),
//   { 
//     ssr: false,
//     loading: () => <div className="flex items-center justify-center p-4">Loading...</div>
//   }
// );

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(error);
    },
  }),
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://wallet.sit.clique-test.tech";
const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://yeezy-rpc.com";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider
      config={{
        baseURL: BASE_URL,
        solanaCluster: {
          name: "mainnet-beta",
          rpcUrl: SOLANA_RPC_URL,
        },
        enableEmail: true,
        enablePhone: false,
        enableGoogle: true,
        enableTwitter: false,
        enablePhantom: true,
      }}
    >
   
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>

    </WalletProvider>
  );
};
