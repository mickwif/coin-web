import { use, useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer } from 'vaul';
import {
  ConnectedSolanaWallet,
  useLogin,
  usePrivy,
  useSolanaWallets,
} from '@privy-io/react-auth';
// import { useActiveWallet } from '@/hooks/useActiveEmbeddedWallet';
import { BuyInterface } from './BuyInterface';
import { SellInterface } from './SellInterface';
import { SendInterface } from './SendInterface';
import Image from 'next/image';
import { useWalletStatus,useActiveWallet, useConnect } from 'clique-wallet-sdk';  ;
import { WalletClient } from 'clique-wallet-sdk';  ;

const payments = [
  'apple-pay.svg',
  'visa.svg',
  'mastercard.svg',
  'venmo.svg',
  'coin.svg',
];

export const BuySellButtons = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'BUY' | 'SELL' | 'SEND'>(
    'BUY'
  );
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('CARD');
  const [pendingAction, setPendingAction] = useState<
    'BUY' | 'SELL' | 'SEND' | null
  >(localStorage.getItem('pendingAction') as 'BUY' | 'SELL' | 'SEND' | null);

  // const { ready, authenticated, logout } = usePrivy();
  // const activeWallet = useActiveWallet();

  const { authenticated, error, isInitialized, ready } = useWalletStatus();
  const { wallet: activeWallet } = useActiveWallet();

  // https://github.com/radix-ui/primitives/issues/2122
  useEffect(() => {
    if (isOpen) {
      // Pushing the change to the end of the call stack
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 0);

      return () => clearTimeout(timer);
    } else {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isOpen]);

  const {connect} = useConnect()

  // const { login } = useLogin({
  //   onComplete: ({ user }) => {
  //     // If we now have a user and a stored action,
  //     // perform the original action automatically
  //     if (user && pendingAction) {
  //       handleButtonClick(pendingAction);
  //       setPendingAction(null);
  //     }
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //   },
  // });

  // This is the new, “wrapped” handler that handles login logic
  const handleButtonClickWithLogin = (action: 'BUY' | 'SELL' | 'SEND') => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      connect();
      localStorage.setItem('pendingAction', action);
    } else {
      // setIsOpen(true);
      // Already logged in: open the dialog immediately
      handleButtonClick(action);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (ready && authenticated && activeWallet?.address) {
      const pendingAction = localStorage.getItem('pendingAction') as 'BUY' | 'SELL' | 'SEND' | null;
      if (pendingAction) {
        setTimeout(() => {
          showForm(pendingAction);
          setPendingAction(null);
          localStorage.removeItem('pendingAction');
        }, 1000); // Wait 1000ms for login UI to exit
      }
    }
  }, [ready, authenticated, activeWallet?.address]);

  const showForm = (action: 'BUY' | 'SELL' | 'SEND') => {
    setSelectedTab(action);
    setShowSendForm(action === 'SEND');
    setSelectedMethod(action === 'SELL' ? 'SOL' : 'CARD');
    setIsOpen(true);
  };

  const handleButtonClick = (action: 'BUY' | 'SELL' | 'SEND') => {
    if (!ready) {
      return;
    }

    // If not authenticated, login and store the action
    if (!authenticated || !activeWallet?.address) {
      setPendingAction(action);
      localStorage.setItem('pendingAction', action);
      // login();
      connect()
      return;
    }

    // If already authenticated, proceed immediately
    showForm(action);
    localStorage.removeItem('pendingAction');
    // setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const DesktopDialog = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Content activeWallet={activeWallet} selectedTab={selectedTab} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      <div className="flex flex-col items-start space-y-4">
        <button
          className="cursor-pointer"
          onClick={() => handleButtonClickWithLogin('BUY')}
        >
          BUY
        </button>

        <button
          className="cursor-pointer"
          onClick={() => handleButtonClickWithLogin('SELL')}
        >
          SELL
        </button>

        {/* {isMobile ? <MobileDrawer /> : <DesktopDialog />} */}
        <button
          className="cursor-pointer"
          onClick={() => handleButtonClickWithLogin('SEND')}
        >
          SEND
        </button>

        {isMobile ? (
          <Drawer.Root
            open={isOpen}
            onOpenChange={setIsOpen}
            repositionInputs={false}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
              <Drawer.Content className=" flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-[60] bg-white">
                <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
                <div className="p-4  rounded-t-[10px] flex-1 overflow-auto">
                  <Content
                    activeWallet={activeWallet}
                    selectedTab={selectedTab}
                    onClose={handleClose}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ) : (
          <DesktopDialog />
        )}
      </div>
    </div>
  );
};

const Content = ({
  activeWallet,
  selectedTab,
  onClose,
}: {
  activeWallet: WalletClient | null;
  selectedTab: 'BUY' | 'SELL' | 'SEND';
  onClose: () => void;
}) => {
  if (!activeWallet) {
    return null;
  }

  return (
    <>
      {selectedTab === 'BUY' ? (
        <BuyInterface activeWallet={activeWallet} onClose={onClose} />
      ) : selectedTab == 'SELL' ? (
        <SellInterface activeWallet={activeWallet} onClose={onClose} />
      ) : (
        <SendInterface activeWallet={activeWallet} onClose={onClose} />
      )}
    </>
  );
};
