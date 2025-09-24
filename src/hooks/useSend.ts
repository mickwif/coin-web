import { toastError, toastInfo, toastSuccess, toastWarn } from '@/utils/toast';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useTokenPrices } from './useTokenPrices';
import { TokenList, TOKENS } from '@/utils/constants';
import { useUsdcBalance } from './useUsdcBalance';
import { useYzyBalance } from './useYzyBalance';
import { getConnection, transferToken, } from '@/utils/solana';
import { useSolBalance } from './useSolBalance';
import { validateAndTransferStateWithRetry } from '@/utils/state';
import { handleTxError } from '@/utils/handleTxError';
import { WalletClient } from 'yeezy-wallet-sdk';  ;

type SendProps = {
  activeWallet: ConnectedSolanaWallet;
  amount: number;
  recipientWalletAddress: string;
  token: 'USDC' | 'YZY';
};

const calculateTokenAmount = (amount: number, tokenPrice: number) => {
  return amount / tokenPrice;
};

export const useSend = () => {
  const { data: yzyBalance, refetch: refetchYzyBalance} = useYzyBalance();
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useUsdcBalance();
  // const { data: solBalance, refetch: refetchSolBalance } = useSolBalance();
  const { data: tokenPrices } = useTokenPrices(
    TokenList.map((token) => token.mint.toString())
  );

  return useMutation({
    mutationFn: async ({
      activeWallet,
      amount,
      recipientWalletAddress,
      token,
    }: SendProps) => {
      if (!amount) {
        toastWarn('Please enter a valid amount.');
        throw new Error('Invalid amount provided');
      }

      if (!recipientWalletAddress) {
        toastWarn('Please enter a valid recipient wallet address.');
        throw new Error('Invalid recipient wallet address provided');
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
      const tokenPrice = token === 'USDC'? 1: Number(tokenPrices[TOKENS[token].mint].usdPrice);
      const tokenAmount = calculateTokenAmount(amount, tokenPrice);

      if (token === 'YZY') {
        if (yzyBalance < tokenAmount) {
          toastWarn('Insufficient YZY balance.');
          throw new Error('Insufficient YZY balance');
        }
      } else if (token === 'USDC') {
        if (usdcBalance < tokenAmount) {
          toastWarn('Insufficient USDC balance.');
          throw new Error('Insufficient USDC balance');
        }
      }


      try {
       const txHash = await transferToken(connection, activeWallet, recipientWalletAddress, tokenAmount, token === 'USDC'? TOKENS.USDC: TOKENS.YZY)
      
        console.log('Transaction successful:', txHash);
        toastSuccess(`Sent ${token} successfully`);
        
        if(token === 'USDC') {
          refetchUsdcBalance();
        } else {
          refetchYzyBalance();
        }

        try {
          const payload = { action: 'SEND', token, amount, signature: txHash };
          window?.parent?.postMessage({ type: 'payment:success', payload }, '*');
        } catch {}

      } catch (e: any) {
        handleTxError(e)
        try {
          window?.parent?.postMessage({ type: 'payment:error', payload: { action: 'SEND', error: String(e?.message || e) } }, '*');
        } catch {}
      }
    },
  });
};
