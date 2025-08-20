import dynamic from 'next/dynamic';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentProps,
  useCallback,
} from 'react';

const MoonPayBuyWidget = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayBuyWidget),
  { ssr: false }
);

type MoonPayComponentProps = ComponentProps<typeof MoonPayBuyWidget>;

type MoonPayContextType = {
  setIsVisible: (isVisible: boolean) => void;
  isVisible: boolean;
  setWalletAddress: (walletAddress: string) => void;
  setBaseCurrencyAmount: (amount: string) => void;
};

const MoonPayContext = createContext<MoonPayContextType>({
  setIsVisible: (isVisible: boolean) => {},
  setWalletAddress: (walletAddress: string) => {},
  setBaseCurrencyAmount: (amount: string) => {},
  isVisible: false,
});

export const MoonPayProviderWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [baseCurrencyAmount, setBaseCurrencyAmount] = useState('');

  const handleGetSignature = useCallback(async (url: string): Promise<string> => {
    console.log('signing url:', url);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/moonpay/sign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log('signature:', data.signature);
      return data.signature;
    } else {
      throw new Error('Error fetching signed URL...');
    }
  }, []);

  

  return (
    <MoonPayContext.Provider value={{ setWalletAddress, setBaseCurrencyAmount, setIsVisible, isVisible }}>
      <MoonPayBuyWidget
        baseCurrencyCode={'usd'}
        baseCurrencyAmount={baseCurrencyAmount}
        currencyCode={'sol'}
        defaultCurrencyCode={'sol'}
        lockAmount='true'
        onLogin={async () => console.log('Customer logged in!')}
        walletAddress={walletAddress}
        onUrlSignatureRequested={handleGetSignature}
        variant='overlay'
        visible={isVisible}
        className="pointer-events-auto"
      />
      {children}
    </MoonPayContext.Provider>
  );
};

export const useMoonPay = () => useContext(MoonPayContext);
