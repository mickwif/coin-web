import { useQuery } from "@tanstack/react-query";
import { useActiveWallet } from "./useActiveEmbeddedWallet";
import { USDC_MINT } from "@/utils/constants";
import { getConnection, getTokenBalance } from "@/utils/solana";
import { useWallet } from 'clique-wallet-sdk';  

export const useUsdcBalance = () => {
  // const activeWallet = useActiveWallet();
  const {wallet: activeWallet} = useWallet();


  const fetchUsdcBalance = async () => {
    if (!activeWallet?.address) return 0;
    const balance = await getTokenBalance(getConnection(), activeWallet.address, USDC_MINT.toString());
    return balance;
  }

  const query = useQuery({
    queryKey: ["usdcBalance", activeWallet?.address],
    queryFn: async () => {
      return fetchUsdcBalance();
    },
    enabled: !!activeWallet,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    fetchUsdcBalance,
  }
};
