import { cn } from '@/lib/utils';
import type React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useState } from 'react';
import { isValidAddress } from '@/utils/solana';
import { useActiveWallet } from '@/hooks/useActiveEmbeddedWallet';

interface OptionsPageProps {
  selectedTab: 'BUY' | 'SELL' | 'SEND';
  handleTabChange: (tab: 'BUY' | 'SELL' | 'SEND') => void;
  handleMethodChange: (method: string) => void;
  sendRecipientWalletAddress: string;
  setSendRecipientWalletAddress: (address: string) => void;
  handleSendFormSubmit: (e: React.FormEvent) => void;
}

const buyOptions = ['CARD', 'SOL', 'USDC'];
const sellOptions = ['SOL', 'USDC'];

export function OptionsPage({
  selectedTab,
  handleTabChange,
  handleMethodChange,
  sendRecipientWalletAddress,
  setSendRecipientWalletAddress,
  handleSendFormSubmit,
}: OptionsPageProps) {
  const activeWallet = useActiveWallet();
  const [isValid, setIsValid] = useState(true);
  const [isSame, setIsSame] = useState(false);
  const options =
    selectedTab === 'BUY'
      ? buyOptions
      : selectedTab === 'SELL'
      ? sellOptions
      : [];

  const checkValidAddress = useDebouncedCallback((address: string) => {
    const valid = isValidAddress(address);
    setIsValid(valid);
  }, 300);

  useEffect(() => {
    if (sendRecipientWalletAddress) {
      checkValidAddress(sendRecipientWalletAddress);
      if (
        activeWallet &&
        sendRecipientWalletAddress === activeWallet?.address
      ) {
        setIsSame(true);
      } else {
        setIsSame(false);
      }
    } else {
      setIsSame(false);
    }
  }, [checkValidAddress, sendRecipientWalletAddress]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-sm">
        {/* Tab Buttons */}
        <div className="mb-8 flex items-center space-x-8">
          {['BUY', 'SELL', 'SEND'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as 'BUY' | 'SELL' | 'SEND')}
              className={cn(
                'text-normal',
                selectedTab === tab ? 'underline' : ''
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {(selectedTab === 'BUY' ||
          selectedTab === 'SELL' ||
          selectedTab === 'SEND') && (
          <div className="space-y-4">
            {selectedTab === 'SEND' ? (
              <form onSubmit={handleSendFormSubmit} className="space-y-4">
                <div className="relative pb-5">
                  <label htmlFor="wallet-address" className="block mb-2  ">
                    ENTER WALLET ADDRESS
                  </label>
                  <input
                    type="text"
                    id="wallet-address"
                    value={sendRecipientWalletAddress}
                    onChange={(e) =>
                      setSendRecipientWalletAddress(e.target.value)
                    }
                    className="w-full pb-1 border-b border-black focus:outline-none"
                    required
                    placeholder="ADDRESS"
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
                <button
                  type="submit"
                  className="w-full text-left text-black   mt-0"
                  disabled={!isValid || isSame}
                >
                  CONTINUE
                </button>
              </form>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleMethodChange(option)}
                  className="w-full text-left text-black  "
                >
                  {selectedTab} $YZY {selectedTab === 'BUY' ? 'WITH' : 'FOR'}{' '}
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
