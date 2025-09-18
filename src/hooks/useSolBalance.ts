import { useQuery } from "@tanstack/react-query";
import { useActiveWallet } from "./useActiveEmbeddedWallet";
import { getConnection, getSOLBalance } from "@/utils/solana";
import { useWallet } from 'yeezy-wallet-sdk';  
export const useSolBalance = () => {
  const {wallet:activeWallet }= useActiveWallet();
  // const {wallet: activeWallet} = useWallet();

  const query = useQuery({
    queryKey: ["solBalance", activeWallet?.address],
    queryFn: async () => {
      if (!activeWallet?.address) return 0;
      const sol = await getSOLBalance(getConnection(), activeWallet.address);
      return sol;
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
