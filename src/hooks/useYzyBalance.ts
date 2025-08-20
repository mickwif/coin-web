import { useQuery } from "@tanstack/react-query";
import { useActiveWallet } from "./useActiveEmbeddedWallet";
import { getConnection, getYZYBalance } from "@/utils/solana";
import { useWallet } from 'clique-wallet-sdk';  

export const useYzyBalance = () => {
  // const activeWallet = useActiveWallet();
  const {wallet: activeWallet} = useWallet();


  const query = useQuery({
    queryKey: ["yzyBalance", activeWallet?.address],
    queryFn: async () => {
      if (!activeWallet?.address) return 0;
      const balance = await getYZYBalance(getConnection(), activeWallet.address);
      return balance;
    },
    enabled: !!activeWallet,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
};
