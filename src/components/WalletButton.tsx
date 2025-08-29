import { usePrivy, useLogout, useLogin } from '@privy-io/react-auth';
import { useState, useEffect, useRef } from 'react';
import { UserBalance } from './UserBalance';
// import { useActiveWallet, usePhantomWallet } from '@/hooks/useActiveEmbeddedWallet';
import { toastInfo } from '@/utils/toast';
import { useConnect,useWalletStatus,useActiveWallet } from 'yeezy-wallet-sdk';  
import { BuySellButtons } from './BuySellButtons';

export const WalletButton = ({ onClose }: { onClose?: () => void }) => {
  // const { ready, authenticated, login, connectOrCreateWallet } =
  //   usePrivy();
  // const activeWallet = useActiveWallet();
  // const phantomWallet = usePhantomWallet();

  const { isAuthenticated, error, isInitialized } = useWalletStatus();
  const {connect,disconnect} = useConnect();
  const {wallet: activeWallet} = useActiveWallet();
  console.log("activeWallet", activeWallet, isAuthenticated, isInitialized);
  // const {logout} = useLogout({
  //   onSuccess: () => {
  //     console.log('User logged out');
    
  //     if (phantomWallet?.isConnected()) {
  //       console.log("disconnecting phantom wallet");
  //       // Not all wallet clients support programmatic disconnects (e.g. MetaMask, Phantom).
  //       // In kind, if the wallet's client does not support programmatic disconnects, this method will no-op.
  //       // So here we are just disconnect phantom in privy state.
  //       // But in phantom wallet, it will still be connected.
  //       phantomWallet.disconnect();
  //     }
  //   },
  // });

  const handleLogin = () => {
    if (!isInitialized) {
      return;
    }

    if (isInitialized && isAuthenticated && !activeWallet) {
      console.log("no active wallet, logging out first to clear state");
      // logout();
      disconnect();
      toastInfo("Please log in again after a few seconds.");
      return;
    }

    connect();
  };

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const timeout = setTimeout(() => {
        if (!activeWallet) {
          console.log("no active wallet after delay, logging out");
        disconnect();
        }
      }, 10000); // Wait 10 seconds before checking

      return () => clearTimeout(timeout);
    }
  }, [isInitialized, isAuthenticated, activeWallet, disconnect]);

  if (!isInitialized)
    return (
      <div>
        {/* to prevent layout shift */}
        <button onClick={connect} className=" " disabled>
          CONNECT WALLET
        </button>
      </div>
    );

  return (
    <div>
      {isInitialized && isAuthenticated && activeWallet?.address ? (
        <WalletWidget walletAddress={activeWallet.address} logout={disconnect} onClose={onClose} />
      ) : (
        <button onClick={handleLogin} className=" ">
          CONNECT WALLET
        </button>
      )}
    </div>
  );
};

const WalletWidget = ({
  walletAddress,
  logout,
  onClose,
}: {
  walletAddress: string;
  logout: () => void;
  onClose?: () => void;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    logout();
    onClose?.(); // Close the modal when disconnecting
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between">
          <button onClick={handleDisconnect} className="text-black  ">
            DISCONNECT WALLET
          </button>
          <button onClick={copyWalletAddress} className="text-black  ">
            {isCopied ? 'COPIED' : 'COPY'}
          </button>
        </div>
        <p onClick={copyWalletAddress} className="break-all text-black/20">
          {walletAddress}
        </p>
      </div>
      {/* <BuySellButtons /> */}
      {/* <UserBalance /> */}
    </div>
  );
};
