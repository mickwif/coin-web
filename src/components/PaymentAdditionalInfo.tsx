import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useYzyBalance } from '@/hooks/useYzyBalance';
import { useUsdcBalance } from '@/hooks/useUsdcBalance';
import { TokenList, SOL_MINT, USDC_MINT, YZY_TOKEN } from '@/utils/constants';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {
  estimateTransactionFee,
  getConnection,
  isValidAddress,
} from '@/utils/solana';
import { WalletClient } from 'yeezy-wallet-sdk';  ;
const swapTransactionFeeRate = process.env.NEXT_PUBLIC_SWAP_TRANSACTION_FEE_RATE
  ? parseFloat(process.env.NEXT_PUBLIC_SWAP_TRANSACTION_FEE_RATE)
  : 0;

const yourMoonPayFeeRate = process.env.NEXT_PUBLIC_MOONPAY_FEE_RATE
  ? parseFloat(process.env.NEXT_PUBLIC_MOONPAY_FEE_RATE)
  : 0;
const moonPayOfficialFeeRate = 0.045;
const moonPayOfficialMinFee = 3.99;
const moonPayNetworkFee = 0.38;

interface PaymentAdditionalInfoProps {
  selectedTab: 'BUY' | 'SELL' | 'SEND';
  selectedMethod: string;
  amount: string;
  setNestedDrawerOpen: (open: boolean) => void;
  sendRecipientWalletAddress: string;
  formatNumber: (value: string) => string;
  selectedWallet: ConnectedSolanaWallet | undefined;
}

export function PaymentAdditionalInfo({
  selectedTab,
  selectedMethod,
  amount,
  setNestedDrawerOpen,
  sendRecipientWalletAddress,
  formatNumber,
  selectedWallet,
}: PaymentAdditionalInfoProps) {
  const {
    data: tokenPrices,
    isLoading: isTokenPricesLoading,
    refetch: refetchTokenPrices,
  } = useTokenPrices(TokenList.map((token) => token.mint.toString()));

  const {
    data: solBalance,
    isLoading: isSolBalanceLoading,
    refetch: refetchSolBalance,
  } = useSolBalance();
  const {
    data: yzyBalance,
    isLoading: isYzyBalanceLoading,
    refetch: refetchYzyBalance,
  } = useYzyBalance();
  const {
    data: usdcBalance,
    isLoading: isUsdcBalanceLoading,
    refetch: refetchUsdcBalance,
  } = useUsdcBalance();

  const YZY_Price = useMemo(() => {
    return tokenPrices
      ? Number(tokenPrices[YZY_TOKEN.mint.toString()]?.usdPrice)
      : 0.01; // default price
  }, [tokenPrices]);

  const USD_Price = useMemo(() => {
    return tokenPrices ? Number(tokenPrices[USDC_MINT.toString()]?.usdPrice) : 1;
  }, [tokenPrices]);

  const SOL_Price = useMemo(() => {
    return tokenPrices ? Number(tokenPrices[SOL_MINT.toString()]?.usdPrice) : 200; // default price
  }, [tokenPrices]);

  const [sendTransactionFee, setSendTransactionFee] = useState(0);
  const [swapTransactionFee, setSwapTransactionFee] = useState(0);

  useEffect(() => {
    const fetchFee = async () => {
      if (
        !selectedWallet ||
        !sendRecipientWalletAddress ||
        !isValidAddress(sendRecipientWalletAddress)
      ) {
        setSendTransactionFee(0);
        return;
      }

      const connection = getConnection();
      const estimatedFee = await estimateTransactionFee(
        connection,
        selectedWallet,
        sendRecipientWalletAddress
      );
      const fee = estimatedFee * SOL_Price;
      setSendTransactionFee(fee);
    };

    fetchFee();
  }, [selectedWallet, sendRecipientWalletAddress, SOL_Price]);

  useEffect(() => {
    const fetchFee = async () => {
      if (
        !selectedWallet ||
        !amount ||
        !selectedMethod ||
        !selectedTab ||
        amount === '0'
      ) {
        setSwapTransactionFee(0);
        return;
      }

      if (
        (selectedTab === 'BUY' || selectedTab === 'SELL') &&
        selectedMethod !== 'CARD'
      ) {
        const baseFee = Number.parseFloat(amount) * swapTransactionFeeRate;
        const gasFee = 0.002;
        const totalFee = baseFee + gasFee * SOL_Price;
        setSwapTransactionFee(totalFee);
      }
    };

    fetchFee();
  }, [selectedWallet, amount, selectedMethod, selectedTab, SOL_Price]);
  const transactionFeeRate = 0.01; // 1%

  if (isTokenPricesLoading) {
    return 'Loading';
  }

  if (!tokenPrices) {
    return 'Error';
  }

  if (isSolBalanceLoading || isYzyBalanceLoading || isUsdcBalanceLoading) {
    return 'Loading';
  }

  const buyingPower = selectedMethod === 'SOL' ? solBalance : usdcBalance;

  const calculateYZYAmount = (): number => {
    const inputAmount = Number.parseFloat(amount) || 0;
    return inputAmount / YZY_Price;
  };

  const calculateMethodAmount = (): number => {
    const inputAmount = Number.parseFloat(amount) || 0;
    if (selectedTab === 'BUY' && selectedMethod !== 'CARD') {
      const methodPrice = selectedMethod === 'SOL' ? SOL_Price : USD_Price;
      return inputAmount / methodPrice;
    } else if (selectedTab === 'SELL') {
      const yzyAmount = inputAmount / YZY_Price;
      const methodPrice = selectedMethod === 'SOL' ? SOL_Price : USD_Price;
      return (yzyAmount * YZY_Price) / methodPrice;
    }
    return inputAmount;
  };

  const calculateMoonPayFee = (): number => {
    const inputAmount = Number.parseFloat(amount) || 0;

    // Rule 1: Input amount must be >= 20
    if (inputAmount < 20) {
      return 0;
    }

    // Rule 2: Fixed network fee
    const networkFee = moonPayNetworkFee; // 0.38

    // Rule 3: Amount after network fee
    const amountAfterNetworkFee = inputAmount - networkFee;

    // Rule 4 & 5: Calculate MoonPay fee based on final available amount
    // We need to solve for finalAvailableAmount where:
    // finalAvailableAmount + fee = amountAfterNetworkFee
    // fee = Math.max(3.99, finalAvailableAmount * 0.045) + (finalAvailableAmount * yourMoonPayFeeRate)

    // Let's use an iterative approach to solve this
    let finalAvailableAmount = amountAfterNetworkFee;
    let fee = 0;
    let previousFinalAmount = 0;

    // Iterate until we find a stable solution
    while (Math.abs(finalAvailableAmount - previousFinalAmount) > 0.01) {
      previousFinalAmount = finalAvailableAmount;

      // Calculate fee based on current finalAvailableAmount
      const moonPayOfficialFee = finalAvailableAmount * moonPayOfficialFeeRate;
      const yourMoonPayFee = finalAvailableAmount * yourMoonPayFeeRate;
      fee =
        Math.max(moonPayOfficialMinFee, moonPayOfficialFee) + yourMoonPayFee;

      // Update finalAvailableAmount
      finalAvailableAmount = amountAfterNetworkFee - fee;
    }

    return fee + networkFee;
  };

  const calculateYZYAmountInMoonPay = (): number => {
    const inputAmount = Number.parseFloat(amount) || 0;
    // if (inputAmount < 20) {
    //   return 0;
    // }
    const availableAmount = inputAmount - calculateMoonPayFee();
    return availableAmount / YZY_Price;
  };

  const calculateSOLAmountInMoonPay = (): number => {
    // TODO: The price of SOL is different from real-time price in MoonPay
    // We need to get the price of SOL from MoonPay
    const inputAmount = Number.parseFloat(amount) || 0;
    if (inputAmount < 20) {
      return 0;
    }
    const availableAmount = inputAmount - calculateMoonPayFee();
    return availableAmount / SOL_Price;
  };

  const renderInfoRow = (
    label: string,
    value: string | number,
    onClick?: () => void
  ) => (
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-black">{label}</span>
      <span
        className={cn(
          'text-sm  ',
          onClick && 'text-gray-500 underline cursor-pointer text-xs'
        )}
        onClick={onClick}
      >
        {typeof value === 'number' ? formatNumber(value.toFixed(2)) : value}
      </span>
    </div>
  );

  const truncateWalletAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const yzyAmount = calculateYZYAmount();
  const methodAmount = calculateMethodAmount();

  if (selectedTab === 'BUY') {
    if (selectedMethod === 'CARD') {
      return (
        <>
          {renderInfoRow(
            'EST. SOL AMOUNT',
            `${calculateSOLAmountInMoonPay().toFixed(3)} SOL`
          )}
          {renderInfoRow(
            'EST. $YZY AMOUNT',
            `${calculateYZYAmountInMoonPay().toFixed(3)} $YZY`
          )}
          {renderInfoRow('EST. TRANSACTION FEES', calculateMoonPayFee())}
          <Separator className="my-2" />
          {renderInfoRow('$YZY BALANCE', `${yzyBalance?.toFixed(3) || 0} $YZY`)}
        </>
      );
    } else {
      return (
        <>
          {renderInfoRow(
            `${selectedMethod} AMOUNT`,
            `${methodAmount.toFixed(6)} ${selectedMethod}`
          )}
          {renderInfoRow('EST. $YZY AMOUNT', `${yzyAmount.toFixed(3)} $YZY`)}
          {renderInfoRow('EST. TRANSACTION FEES', swapTransactionFee)}
          <Separator className="my-2" />
          {renderInfoRow(
            'BUYING POWER',
            `${buyingPower?.toFixed(3) || 0} ${selectedMethod}`
          )}
          {renderInfoRow('$YZY BALANCE', `${yzyBalance?.toFixed(3) || 0} $YZY`)}
        </>
      );
    }
  } else if (selectedTab === 'SELL') {
    return (
      <>
        {renderInfoRow('$YZY AMOUNT', `${yzyAmount.toFixed(3)} $YZY`)}
        {renderInfoRow(
          `EST. ${selectedMethod} AMOUNT`,
          `${methodAmount.toFixed(6)} ${selectedMethod}`
        )}
        {renderInfoRow('EST. TRANSACTION FEES', swapTransactionFee)}
        <Separator className="my-2" />
        {renderInfoRow('$YZY BALANCE', `${yzyBalance?.toFixed(3) || 0} $YZY`)}
      </>
    );
  } else if (selectedTab === 'SEND') {
    return (
      <>
        {renderInfoRow('EST. $YZY AMOUNT', `${yzyAmount.toFixed(3)} $YZY`)}
        {renderInfoRow(
          'EST. TRANSACTION FEES',
          amount === '0' ? '$0.00' : `$${sendTransactionFee.toFixed(2)}`
        )}
        <Separator className="my-2" />
        {renderInfoRow('$YZY BALANCE', `${yzyBalance} $YZY`)}
        {renderInfoRow(
          'RECIPIENT',
          sendRecipientWalletAddress
            ? truncateWalletAddress(sendRecipientWalletAddress)
            : 'SET',
          () => setNestedDrawerOpen(true)
        )}
      </>
    );
  }
  return null;
}
