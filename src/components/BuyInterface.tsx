import { useCallback, useEffect, useState } from 'react';
import { PaymentDisplay } from './PaymentDisplay';
import { UserBalance } from './UserBalance';
import { LoaderCircleIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toastInfo } from '@/utils/toast';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useSwap } from '@/hooks/useSwap';
import { convertFormatNumberToNumber, formatNumber } from '@/utils/format';
import { YzyCoinLivePrice } from './YzyCoinLivePrice';
import { useMoonPay } from '@/lib/providers';
import { CurrencyInput } from './CurrencyInput';
import { getConnection } from '@/utils/solana';
import { validateAndTransferStateWithRetry } from '@/utils/state';
import { IBM_Plex_Mono, Playfair_Display } from 'next/font/google';
import { useUsdcBalance } from '@/hooks/useUsdcBalance';
import { WalletClient } from 'clique-wallet-sdk';  ;
import { WalletButton } from './WalletButton';  
import { fetchCoinbaseToken } from '@/utils/coinbase';
import {
  getOnrampBuyUrl,
  GetOnrampUrlWithSessionTokenParams,
} from '@coinbase/onchainkit/fund';

const MOONPAY_MIN_AMOUNT = 20;
const MOONPAY_MAX_AMOUNT = 29850;

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
});



export const BuyInterface = ({
  activeWallet,
  onClose,
}: {
  activeWallet: WalletClient;
  onClose?: () => void;
}) => {
  const { setBaseCurrencyAmount, setIsVisible, isVisible, setWalletAddress } = useMoonPay();

  const [amount, setAmount] = useState('0');
  const { mutate: swap, isPending: isSwapping } = useSwap();
  const {refetch: refetchUsdcBalance} = useUsdcBalance()
  
  useEffect(()=>{
    if(activeWallet){
      setWalletAddress(activeWallet.address || '')
    }
  }, [activeWallet, setWalletAddress])

  const onCloseOverlay = useCallback(async () => {
    console.log('onCloseOverlay');
    try {
      const connection = getConnection();
      await validateAndTransferStateWithRetry(connection, activeWallet!);
      refetchUsdcBalance() //  refetch USDC balance after transaction
    } catch (error) {
      console.error('State validation and transfer failed:', error);
    }

    onClose?.(); // Call the onClose prop
  }, [activeWallet, onClose, refetchUsdcBalance]);

  const buyWithMoonpay = () => {
    if (convertFormatNumberToNumber(amount) < MOONPAY_MIN_AMOUNT) {
      toastInfo('The minimum purchase amount is $20 when using a card.');
      return;
    }

    if (convertFormatNumberToNumber(amount) > MOONPAY_MAX_AMOUNT) {
      toastInfo(
        `The maximum purchase amount is $${formatNumber(
          MOONPAY_MAX_AMOUNT.toString()
        )} when using a card.`
      );
      return;
    }
    // Set up mutation observer to detect when moonpay overlay is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && 
              node.classList.contains('moonpay-widget__overlay-container')) {
            onCloseOverlay();
            observer.disconnect();
          }
        });
      });
    });

    // Start observing the document body for removed nodes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setBaseCurrencyAmount(convertFormatNumberToNumber(amount).toString());
    setIsVisible(true);
  };

  const buyWithCoinbase =async () => {
    if (!activeWallet?.address) return;
    const token = await fetchCoinbaseToken(activeWallet.address, 'SOL');
    if (token) {
      const partnerUserId = activeWallet?.id + '_' + Date.now();
      const params: GetOnrampUrlWithSessionTokenParams = {
        sessionToken: token,
        redirectUrl: window.location.href,
        partnerUserId,
        presetCryptoAmount: Number(amount),
      };
      const onrampBuyUrl = getOnrampBuyUrl(params);
      const width = 600;
      const height = 800;
      const left = Math.round((window.screen.width - width) / 2);
      const top = Math.round((window.screen.height - height) / 2);
      window.open(
        onrampBuyUrl,
        '_blank',
        [
          `width=${width}`,
          `height=${height}`,
          `left=${left}`,
          `top=${top}`,
        ].join(','),
      );
    }
  }

  const buyWithSOL = () => {
    if (!convertFormatNumberToNumber(amount)) {
      toastInfo('Please enter a valid amount.');
      return;
    }

    swap({
      activeWallet,
      amount: convertFormatNumberToNumber(amount),
      tokenPair: {
        from: 'USDC',
        to: 'YZY',
      },
      slippage: 0.5,
    });
  };

  return (
    <div
      className={`${ibmPlexMono.variable} pb-4 px-4 font-mono font-medium bg-white`}
    >
      <div className="mx-auto max-w-sm space-y-20">
        <YzyCoinLivePrice />
        {/* Amount Display */}

        <CurrencyInput
          amount={amount}
          onAmountChange={setAmount}
          currency="YZY"
        />

        <div className="space-y-3 flex flex-col items-center">
          <button
            onClick={buyWithCoinbase}
            className="flex items-center gap-2 uppercase"
            disabled={isVisible || isSwapping}
          >
            Add Funds with Card
            {(isVisible|| isSwapping) && <LoaderCircleIcon className="size-4 animate-spin" />}
          </button>
          <button
            onClick={buyWithSOL}
            disabled={isSwapping || isVisible}
            className="flex items-center gap-2 uppercase"
          >
            BUY WITH USDC
            {isSwapping && <LoaderCircleIcon className="size-4 animate-spin" />}
          </button>
        </div>
        <UserBalance />
        <WalletButton onClose={onClose} />
        {/* {isMoonpayWidgetVisible && (
          <MoonPayBuyWidget
            className="z-[1000] bg-red-400 "
            variant="overlay"
            baseCurrencyCode="usd"
            baseCurrencyAmount={convertFormatNumberToNumber(amount).toString()}
            currencyCode="sol"
            defaultCurrencyCode="sol"
            lockAmount="true"
            onLogin={async () => console.log('Customer logged in!')}
            onCloseOverlay={() => setIsMoonpayWidgetVisible(false)}
            walletAddress={walletAddress}
            onUrlSignatureRequested={handleGetSignature}
            visible={isMoonpayWidgetVisible}
          />
        )} */}
      </div>
    </div>
  );
};
