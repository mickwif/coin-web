import { useState, useEffect } from 'react';
import { YzyCoinLivePrice } from './YzyCoinLivePrice';
import { formatNumber, convertFormatNumberToNumber } from '@/utils/format';
import { UserBalance } from './UserBalance';
import { useSend } from '@/hooks/useSend';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useDebouncedCallback } from 'use-debounce';
import { isValidAddress } from '@/utils/solana';
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

export const SendInterface = ({
  activeWallet,
  onClose,
}: {
  activeWallet: WalletClient;
  onClose?: () => void;
}) => {
  const [amount, setAmount] = useState('0');
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatNumber(inputValue);
    setAmount(formattedValue);
  };

  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [tokenToSend, setTokenToSend] = useState<'USDC' | 'YZY'>('USDC');

  const { mutate: send, isPending } = useSend();

  const [isValid, setIsValid] = useState(true);
  const [isSame, setIsSame] = useState(false);

  const checkValidAddress = useDebouncedCallback((address: string) => {
    if (address.trim()) {
      const valid = isValidAddress(address);
      setIsValid(valid);
    }
  }, 300);

  useEffect(() => {
    if (recipientWalletAddress) {
      checkValidAddress(recipientWalletAddress);
      if (activeWallet && recipientWalletAddress === activeWallet?.address) {
        setIsSame(true);
      } else {
        setIsSame(false);
      }
    } else {
      setIsSame(false);
    }
  }, [checkValidAddress, recipientWalletAddress]);

  return (
    <div
      className={`${ibmPlexMono.variable} pb-4 px-4 font-mono font-medium bg-white`}
    >
      <div className="mx-auto max-w-sm space-y-12">
        <YzyCoinLivePrice />

        <div className="  flex justify-evenly">
          <button
            className={tokenToSend === 'USDC' ? '' : 'text-black/50'}
            onClick={() => setTokenToSend('USDC')}
          >
            SEND USDC
          </button>
          <button
            className={tokenToSend === 'YZY' ? '' : 'text-black/50'}
            onClick={() => setTokenToSend('YZY')}
          >
            SEND YZY
          </button>
        </div>

        {/* Amount Display */}
        <CurrencyInput
          amount={amount}
          onAmountChange={setAmount}
          currency={tokenToSend}
          hideSwap={tokenToSend === 'USDC'}
        />

        <div className="w-full relative pb-5">
          <input
            className="border-none w-full border-black text-base text-center"
            placeholder="ENTER WALLET ADDRESS"
            value={recipientWalletAddress}
            onChange={(e) => setRecipientWalletAddress(e.target.value.trim())}
          />

          {!isValid && (
            <p className="text-red-600 text-xs absolute bottom-0">
              Invalid address
            </p>
          )}
          {isSame && (
            <p className="text-red-600 text-xs absolute bottom-0">
              Cannot send to self
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <button
            className="   flex items-center gap-2"
            disabled={!isValid || isSame || isPending}
            onClick={() => {
              send({
                activeWallet,
                amount: convertFormatNumberToNumber(amount),
                token: tokenToSend,
                recipientWalletAddress,
              });
            }}
          >
            {/* // TODO UPDATE WHEN CURRENCY SWAP */}
            SEND ${amount} {tokenToSend}
            {isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
          </button>
        </div>

        <UserBalance />
        <WalletButton onClose={onClose} />
      </div>
    </div>
  );
};
