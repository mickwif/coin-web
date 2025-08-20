import { useYzyBalance } from '@/hooks/useYzyBalance';
import { Separator } from './ui/separator';
import { useUsdcBalance } from '@/hooks/useUsdcBalance';
import { TOKEN_DECIMALS } from '@/utils/constants';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useEffect } from 'react';
export const UserBalance = () => {
  const { data: yzyBal, isLoading: isLoadingYzyBal, refetch: refetchYzyBal } = useYzyBalance();
  const { data: usdcBal, isLoading: isLoadingUsdcBal, refetch: refetchUsdcBal } = useUsdcBalance();
  const { data: solBal, isLoading: isLoadingSolBal, refetch: refetchSolBal } = useSolBalance();

  useEffect(()=>{
    const interval = setInterval(()=>{
      refetchYzyBal();
      refetchUsdcBal();
      refetchSolBal();
    }, 10_000)
    return ()=>{
      clearInterval(interval)
    }
  },[refetchUsdcBal, refetchYzyBal])

  const loadingBalances = isLoadingYzyBal || isLoadingUsdcBal;
  return (
    <div className="space-y-2.5">
      {/* <Separator /> */}
      <div className="flex justify-between">
        <span>YZY BALANCE</span>
        <span>
          {loadingBalances ? 'Loading...' : yzyBal?.toFixed(TOKEN_DECIMALS.YZY)}
        </span>
      </div>
      {/* <Separator /> */}
      <div className="flex justify-between">
        <span>USDC BALANCE</span>
        <span>
          {loadingBalances
            ? 'Loading...'
            : usdcBal?.toFixed(TOKEN_DECIMALS.USDC)}
        </span>
      </div>
      <div className="flex justify-between">
        <span>SOL BALANCE</span>
        <span>
          {loadingBalances
            ? 'Loading...'
            : solBal?.toFixed(TOKEN_DECIMALS.SOL)}
        </span>
      </div>
      {/* <Separator /> */}
    </div>
  );
};
