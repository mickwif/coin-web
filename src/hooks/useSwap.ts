import { executeJupiterSwap } from '@/utils/jupiter';
import { getConnection, getSOLBalance } from '@/utils/solana';
import { toastError, toastInfo, toastSuccess, toastWarn } from '@/utils/toast';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useYzyBalance } from './useYzyBalance';
import { useUsdcBalance } from './useUsdcBalance';
import { TokenList, TOKENS } from '@/utils/constants';
import { useTokenPrices } from './useTokenPrices';
import { useMutation } from '@tanstack/react-query';
import { useSolBalance } from './useSolBalance';
import { validateAndTransferStateWithRetry } from '@/utils/state';
import { handleTxError } from '@/utils/handleTxError';
import { WalletClient } from 'clique-wallet-sdk';  ;

const validTokenPairs = [
  {
    from: 'USDC',
    to: 'YZY',
  },
  {
    from: 'YZY',
    to: 'USDC',
  },
] as const;

const calculateTokenAmount = (amount: number, tokenPrice: number) => {
  return amount / tokenPrice;
};

type SwapProps = {
  activeWallet: WalletClient;
  amount: number; // assume in usd
  tokenPair: (typeof validTokenPairs)[number];
  slippage: number;
};

export const useSwap = () => {
  const { data: yzyBalance, refetch: refetchYzyBalance } = useYzyBalance();
  const { data: usdcBalance, refetch: refetchUsdcBalance, fetchUsdcBalance } = useUsdcBalance();
  // const { data: solBalance, refetch: refetchSolBalance } = useSolBalance();
  const { data: tokenPrices } = useTokenPrices(
    TokenList.map((token) => token.mint.toString())
  );

  return useMutation<string | undefined, Error, SwapProps>({
    mutationFn: async ({
      activeWallet,
      amount,
      tokenPair,
      slippage,
    }: SwapProps) => {
      const { from, to } = tokenPair;

      if (!amount) {
        toastWarn('Please enter a valid amount.');
        throw new Error('Invalid amount provided');
      }

      if (!tokenPrices) {
        toastWarn(
          'Unable to load token prices right now. Please try again later.'
        );
        throw new Error('Token prices not loaded');
      }

      if (yzyBalance === undefined || usdcBalance === undefined) {
        toastWarn(
          'Unable to load your balances right now. Please try again later.'
        );
        throw new Error('Balances not loaded');
      }

      const connection = getConnection();

      await validateAndTransferStateWithRetry(connection, activeWallet);
     

      const fromTokenPrice = Number(tokenPrices[TOKENS[from].mint].usdPrice);
      const fromAmount = calculateTokenAmount(amount, fromTokenPrice);
      let fromTokenBalance = 0;
      if (from === 'USDC') {
        // get latest usdc balance
        const latestUsdcBalance = await fetchUsdcBalance();
        fromTokenBalance = latestUsdcBalance;
      } else {
        fromTokenBalance = yzyBalance;
      }
  

      if (Number.isNaN(fromAmount)) {
        throw new Error('Calculated token amount is NaN');
      }

      if (!fromTokenBalance || fromTokenBalance < fromAmount) {
        toastWarn(`Insufficient ${from} balance.`);
        throw new Error(`Insufficient ${from} balance.`);
      }

      try {
        const txHash = await executeJupiterSwap(
          connection,
          activeWallet,
          TOKENS[from].mint,
          TOKENS[to].mint,
          Math.floor(Number(fromAmount) * 10 ** TOKENS[from].decimals),
          slippage * 100
        );

        console.log('Transaction successful:', txHash);
        toastSuccess(`${from ==='YZY'?'SOLD':'BOUGHT'} $YZY SUCCESSFULLY`);
        refetchYzyBalance();
        refetchUsdcBalance();
        return txHash;
      } catch (e) {
        // console.error('Swap error:', e);
         handleTxError(e);
      }
    },
  });
};
