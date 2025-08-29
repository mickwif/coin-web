import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { UserBalance } from './UserBalance';
import { YzyCoinLivePrice } from './YzyCoinLivePrice';
import { useState } from 'react';
import { PaymentDisplay } from './PaymentDisplay';
import { formatNumber, convertFormatNumberToNumber } from '@/utils/format';
import { toastInfo } from '@/utils/toast';
import { useSwap } from '@/hooks/useSwap';
import { LoaderCircleIcon } from 'lucide-react';
import { CurrencyInput } from './CurrencyInput';
import { IBM_Plex_Mono } from 'next/font/google';
import { WalletClient } from 'yeezy-wallet-sdk';  ;
import { WalletButton } from './WalletButton';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
});

export const SellInterface = ({
  activeWallet,
  onClose,
}: {
  activeWallet: WalletClient;
  onClose?: () => void;
}) => {
  const [amount, setAmount] = useState('0');
  const { mutate: swap, isPending: isSwapping } = useSwap();

  const sellForSOL = () => {
    if (!convertFormatNumberToNumber(amount)) {
      toastInfo('Please enter a valid amount.');
      return;
    }

    swap({
      activeWallet,
      amount: convertFormatNumberToNumber(amount),
      tokenPair: {
        from: 'YZY',
        to: 'USDC',
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

        <CurrencyInput
          amount={amount}
          onAmountChange={setAmount}
          currency="YZY"
        />

        <div className="  space-y-3 flex flex-col items-center">
          <button
            onClick={sellForSOL}
            disabled={isSwapping}
            className="flex items-center gap-2"
          >
            SELL
            {isSwapping && <LoaderCircleIcon className="size-4 animate-spin" />}
          </button>
        </div>
        <UserBalance />
        <WalletButton onClose={onClose} />
      </div>
    </div>
  );
};
