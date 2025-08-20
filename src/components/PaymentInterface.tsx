// import dynamic from 'next/dynamic';
// import type React from 'react';
// import { LoaderCircleIcon } from 'lucide-react';
// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { executeJupiterSwap } from '@/utils/jupiter';
// import {
//   getConnection,
//   getSOLBalance,
//   getTokenBalance,
//   getYZYBalance,
//   isValidAddress,
// } from '@/utils/solana';
// import { useActiveEmbeddedWallet } from '@/hooks/useActiveEmbeddedWallet';
// import {
//   COMMON_TOKENS,
//   SOL_MINT,
//   USDC_MINT,
//   YZY_TOKEN,
// } from '@/utils/constants';
// import { transferYZY } from '@/utils/solana';
// import { useFundWallet } from '@privy-io/react-auth/solana';
// import { usePrivy } from '@privy-io/react-auth';
// import { useSolBalance } from '@/hooks/useSolBalance';
// import { useYzyBalance } from '@/hooks/useYzyBalance';
// import { useUsdcBalance } from '@/hooks/useUsdcBalance';
// import { useTokenPrices } from '@/hooks/useTokenPrices';
// import { toastSuccess, toastError, toastInfo, toastWarn } from '@/utils/toast';
// import { useSolanaWallets } from '@privy-io/react-auth';
// import { PaymentHeader } from './PaymentHeader';
// import { PaymentDisplay } from './PaymentDisplay';
// import { PaymentAdditionalInfo } from './PaymentAdditionalInfo';
// import { PaymentKeypad } from './PaymentKeypad';
// import { PaymentOptionsModal } from './PaymentOptionsModal';
// import { TokenList } from '@/utils/constants';
// import { sleep } from '@/utils/trading';

// const buyOptions = ['CARD', 'SOL', 'USDC'] as const;
// const sellOptions = ['SOL', 'USDC'] as const;

// interface PaymentInterfaceProps {
//   initialTab: 'BUY' | 'SELL' | 'SEND';
//   showSendForm: boolean;
//   initialMethod: string;
//   onClose: () => void;
//   onOpenMoonpay: (amount: string) => void;
// }

// export default function PaymentInterface({
//   initialTab,
//   showSendForm,
//   initialMethod,
//   onClose,
//   onOpenMoonpay,
// }: PaymentInterfaceProps) {
//   const { login } = usePrivy();

//   const { refetch: refetchSolBalance, isRefetching: isSolBalanceRefetching } =
//     useSolBalance();
//   const { refetch: refetchYzyBalance, isRefetching: isYzyBalanceRefetching } =
//     useYzyBalance();
//   const { refetch: refetchUsdcBalance, isRefetching: isUsdcBalanceRefetching } =
//     useUsdcBalance();
//   const {
//     data: tokenPrices,

//     refetch: refetchTokenPrices,
//   } = useTokenPrices(TokenList.map((token) => token.mint.toString()));

//   const [pending, setPending] = useState(false);
//   const [slippage, setSlippage] = useState(0.5);
//   const activeWallet = useActiveEmbeddedWallet();
//   const [selectedTab, setSelectedTab] = useState<'BUY' | 'SELL' | 'SEND'>(
//     initialTab
//   );
//   const [selectedMethod, setSelectedMethod] = useState(initialMethod);
//   const [amount, setAmount] = useState('0');
//   const [showOptions, setShowOptions] = useState(
//     showSendForm || initialTab === 'SEND'
//   );
//   const [fontSize, setFontSize] = useState(60);
//   const [sendRecipientWalletAddress, setSendRecipientWalletAddress] =
//     useState('');
//   const [nestedDrawerOpen, setNestedDrawerOpen] = useState(false);
//   const [isDesktop, setIsDesktop] = useState(false);

//   const { fundWallet } = useFundWallet();

//   const amountRef = useRef<HTMLInputElement>(null);

//   const [lastUpdate, setLastUpdate] = useState(Date.now());
//   const [forceUpdate, setForceUpdate] = useState(false);

//   const formatNumber = (value: string): string => {
//     const numericValue = value.replace(/[^0-9.]/g, '');
//     const [integerPart, decimalPart] = numericValue.split('.');
//     const formattedIntegerPart = Number(integerPart).toLocaleString('en-US');

//     if (decimalPart === undefined) return formattedIntegerPart;
//     if (decimalPart === '') return `${formattedIntegerPart}.`;
//     return `${formattedIntegerPart}.${decimalPart.slice(0, 2)}`;
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       refetchTokenPrices();
//     }, 20000);
//     return () => {
//       clearInterval(interval);
//     };
//   }, [refetchTokenPrices]);

//   const refetchBalances = () => {
//     refetchSolBalance();
//     refetchUsdcBalance();
//     refetchYzyBalance();
//     setLastUpdate(Date.now());
//   };

//   const isLoading = useMemo(() => {
//     return (
//       pending ||
//       isSolBalanceRefetching ||
//       isUsdcBalanceRefetching ||
//       isYzyBalanceRefetching
//     );
//   }, [
//     pending,
//     isSolBalanceRefetching,
//     isUsdcBalanceRefetching,
//     isYzyBalanceRefetching,
//   ]);

//   useEffect(() => {
//     if (forceUpdate) {
//       refetchBalances();
//       setForceUpdate(false);
//     }
//   }, [forceUpdate, refetchBalances]);

//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     let timeout: NodeJS.Timeout;

//     // if (forceUpdate) {
//     //   // If forceUpdate is true, refetch after 2 seconds
//     //   timeout = setTimeout(() => {
//     //     refetchBalances();
//     //     setForceUpdate(false);
//     //   }, 2000);
//     // }

//     // Set up the regular interval
//     interval = setInterval(() => {
//       const now = Date.now();
//       // Only update if at least 4 seconds have passed since last update
//       if (now - lastUpdate >= 4000) {
//         refetchBalances();
//       }
//     }, 10000); // Check every 10 seconds, but only update if 4 seconds have passed

//     return () => {
//       clearInterval(interval);
//       // if (timeout) clearTimeout(timeout);
//     };
//   }, [
//     refetchSolBalance,
//     refetchUsdcBalance,
//     refetchYzyBalance,
//     forceUpdate,
//     lastUpdate,
//     selectedTab,
//     selectedMethod,
//   ]);

//   useEffect(() => {
//     const numericCharCount = amount.replace(/[^0-9]/g, '').length;

//     if (numericCharCount >= 5) {
//       const scaleFactor = Math.min(1, 5 / numericCharCount);
//       const newFontSize = Math.max(30, 60 * scaleFactor);
//       setFontSize(newFontSize);
//     } else {
//       setFontSize(60);
//     }
//   }, [amount]);

//   useEffect(() => {
//     const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
//     checkDesktop();
//     window.addEventListener('resize', checkDesktop);
//     return () => window.removeEventListener('resize', checkDesktop);
//   }, []);

//   const handleTabChange = (tab: 'BUY' | 'SELL' | 'SEND') => {
//     setSelectedTab(tab);
//     if (tab === 'BUY') {
//       setSelectedMethod(buyOptions[0]);
//     } else if (tab === 'SELL') {
//       setSelectedMethod(sellOptions[0]);
//     } else {
//       setSelectedMethod('');
//     }
//     setAmount('0');
//     setFontSize(60);
//     setShowOptions(tab !== 'SEND' || showOptions);
//   };

//   const handleMethodChange = (method: string) => {
//     setSelectedMethod(method);
//     setShowOptions(false);
//   };

//   const YZY_Price = useMemo(() => {
//     return tokenPrices
//       ? Number(tokenPrices[YZY_TOKEN.mint.toString()]?.price)
//       : 0.01; // default price
//   }, [tokenPrices]);

//   const USD_Price = useMemo(() => {
//     return tokenPrices ? Number(tokenPrices[USDC_MINT.toString()]?.price) : 1;
//   }, [tokenPrices]);

//   const SOL_Price = useMemo(() => {
//     return tokenPrices ? Number(tokenPrices[SOL_MINT.toString()]?.price) : 200; // default price
//   }, [tokenPrices]);

//   const calculateYZYAmount = useCallback((): number => {
//     const inputAmount = Number.parseFloat(amount) || 0;
//     return inputAmount / YZY_Price;
//   }, [YZY_Price, amount]);

//   const calculateMethodAmount = useCallback((): number => {
//     const inputAmount = Number.parseFloat(amount) || 0;

//     if (selectedTab === 'BUY' && selectedMethod !== 'CARD') {
//       const methodPrice = selectedMethod === 'SOL' ? SOL_Price : USD_Price;
//       return inputAmount / methodPrice;
//     } else if (selectedTab === 'SELL') {
//       const methodPrice = selectedMethod === 'SOL' ? SOL_Price : USD_Price;
//       return inputAmount / methodPrice;
//     }
//     return inputAmount;
//   }, [SOL_Price, USD_Price, YZY_Price, amount, selectedMethod, selectedTab]);

//   const isSwap = useMemo(() => {
//     return (
//       (selectedTab === 'BUY' || selectedTab === 'SELL') &&
//       selectedMethod !== 'CARD'
//     );
//   }, [selectedMethod, selectedTab]);

//   const isMoonPay = useMemo(() => {
//     return selectedTab === 'BUY' && selectedMethod === 'CARD';
//   }, [selectedMethod, selectedTab]);

//   const swapFromToken = useMemo(() => {
//     if (selectedTab === 'BUY') {
//       return TokenList.find((token) => token.symbol === selectedMethod);
//     } else {
//       return YZY_TOKEN;
//     }
//   }, [selectedMethod, selectedTab]);

//   const swapToToken = useMemo(() => {
//     if (selectedTab === 'BUY') {
//       return YZY_TOKEN;
//     } else {
//       return TokenList.find((token) => token.symbol === selectedMethod);
//     }
//   }, [selectedMethod, selectedTab]);

//   const fetchFromTokenBalance = useCallback(async () => {
//     let balance = 0;
//     if (!activeWallet || !swapFromToken || !isSwap) return;
//     if (swapFromToken.symbol === 'SOL') {
//       balance = await getSOLBalance(getConnection(), activeWallet.address);
//     } else {
//       balance = await getTokenBalance(
//         getConnection(),
//         activeWallet.address,
//         swapFromToken.mint.toString()
//       );
//     }
//     return balance;
//   }, [activeWallet, swapFromToken, isSwap]);

//   const handleMoonPay = useCallback(async () => {
//     if (!activeWallet) {
//       login();
//       return;
//     }
//     if (Number(amount) < 20) {
//       toastInfo('Minimum amount is $20.');
//       return;
//     }
//     onClose();
//     onOpenMoonpay(amount);
//   }, [activeWallet, amount, onClose, onOpenMoonpay]);

//   const handleSwap = useCallback(async () => {
//     if (!activeWallet) {
//       login();
//       return;
//     }
//     if (!amount) {
//       return;
//     }
//     const connection = getConnection();

//     const fromAmount =
//       selectedTab === 'SELL' ? calculateYZYAmount() : calculateMethodAmount();
//     const fromTokenBalance = await fetchFromTokenBalance();
//     if (Number.isNaN(fromAmount)) {
//       return;
//     }
//     try {
//       setPending(true);

//       if (!swapFromToken || !swapToToken) {
//         throw new Error('Invalid token selection.');
//       }

//       if (!fromTokenBalance || fromTokenBalance < fromAmount) {
//         if (selectedTab === 'BUY') {
//           toastInfo(`Insufficient $${selectedMethod} balance.`);
//           return;
//         } else {
//           toastInfo('Insufficient $YZY balance.');
//           return;
//         }
//       }

//       const txHash = await executeJupiterSwap(
//         connection,
//         activeWallet,
//         swapFromToken.mint.toString(),
//         swapToToken.mint.toString(),
//         Math.floor(Number(fromAmount) * 10 ** swapFromToken.decimals),
//         slippage * 100
//       );
//       setForceUpdate(true);
//       fetchFromTokenBalance();
//       console.log('Transaction successful:', txHash);
//       toastSuccess(
//         `${selectedTab === 'BUY' ? 'Buy' : 'Sell'} $YZY successfully`
//       );
//     } catch (e: any) {
//       console.log('>>>>>>>>>>>>>>>>>>>>>>>>', e);
//       if (
//         e.toString().indexOf('block height exceeded') > -1 ||
//         e.toString().indexOf('confirmation timeout') > -1
//       ) {
//         toastInfo(
//           e +
//             ` Don't worry, this doesn't necessarily mean the transaction has failed. Please check later.`
//         );
//         return;
//       }
//       toastError(e);
//     } finally {
//       setPending(false);
//     }
//   }, [
//     activeWallet,
//     amount,
//     calculateMethodAmount,
//     calculateYZYAmount,
//     handleMoonPay,
//     login,
//     selectedTab,
//     slippage,
//     swapFromToken,
//     swapToToken,
//   ]);

//   const handleSend = useCallback(async () => {
//     if (!activeWallet) {
//       login();
//       return;
//     }
//     if (!amount) {
//       return;
//     }
//     if (!sendRecipientWalletAddress) {
//       toastInfo('Please set a valid recipient');
//       return;
//     }

//     const connection = getConnection();

//     try {
//       setPending(true);

//       const yzyAmount = calculateYZYAmount();
//       if (Number.isNaN(yzyAmount)) {
//         return;
//       }
//       const yzyBalance = await getYZYBalance(connection, activeWallet.address);
//       if (yzyBalance < yzyAmount) {
//         console.warn('Insufficient YZY balance');
//         toastWarn('Insufficient YZY balance');
//         return;
//       }

//       const txHash = await transferYZY(
//         connection,
//         activeWallet,
//         sendRecipientWalletAddress,
//         Number(yzyAmount)
//       );
//       console.log('Transaction successful:', txHash);
//       toastSuccess(`Send $YZY successfully`);
//       setForceUpdate(true);
//     } catch (e: any) {
//       console.log('>>>>>>>>>>>>>>>>>>>>>>>>', e);
//       if (
//         e.toString().indexOf('block height exceeded') > -1 ||
//         e.toString().indexOf('confirmation timeout') > -1
//       ) {
//         toastInfo(
//           e +
//             ` Don't worry, this doesn't necessarily mean the transaction has failed. Please check later.`
//         );
//         return;
//       }
//       toastError(e);
//     } finally {
//       setPending(false);
//     }
//   }, [
//     activeWallet,
//     amount,
//     sendRecipientWalletAddress,
//     login,
//     calculateYZYAmount,
//   ]);

//   const handleConfirm = (actionType: PaymentInterfaceProps['initialTab']) => {
//     if (amount === '0' || Number(amount) === 0) {
//       return;
//     }

//     if (pending) {
//       return;
//     }

//     // Handle the confirmation action here

//     switch (actionType) {
//       case 'BUY':
//         if (isMoonPay) {
//           handleMoonPay();
//         } else {
//           handleSwap();
//         }
//         break;
//       case 'SELL':
//         handleSwap();
//         break;
//       case 'SEND':
//         handleSend();
//         break;
//     }
//   };

//   const handleSendFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setShowOptions(false);
//     setSendRecipientWalletAddress(sendRecipientWalletAddress); // Preserve the entered wallet address
//   };

//   const handleOpenOptions = () => {
//     setNestedDrawerOpen(true);
//   };

//   const getTopSelectorText = () => {
//     if (selectedTab === 'BUY') {
//       return `BUY $YZY WITH ${selectedMethod}`;
//     } else if (selectedTab === 'SELL') {
//       return `SELL $YZY FOR ${selectedMethod}`;
//     } else {
//       return `SENDING $YZY TO WALLET`;
//     }
//   };

//   const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value.replace(/[^0-9.]/g, '');
//     const formattedValue = formatNumber(inputValue);
//     setAmount(formattedValue);
//   };

//   const onNestedDrawerChange = (open: boolean) => {
//     if (!open && selectedTab === 'SEND') {
//       if (
//         !isValidAddress(sendRecipientWalletAddress) ||
//         sendRecipientWalletAddress === activeWallet?.address
//       ) {
//         setSendRecipientWalletAddress('');
//       }
//     }
//     setNestedDrawerOpen(open);
//   };

//   return (
//     <div className="bg-white pb-4 px-4">
//       <div className="mx-auto max-w-sm">
//         {/* Header */}
//         {/* <PaymentHeader
//           getTopSelectorText={getTopSelectorText}
//           handleOpenOptions={handleOpenOptions}
//           formatNumber={formatNumber}
//         /> */}

//         {/* Amount Display */}
//         <PaymentDisplay
//           amount={amount}
//           // fontSize={fontSize}
//           handleAmountChange={handleAmountChange}
//           // amountRef={amountRef}
//         />

//         {/* Additional Info */}
//         <div className="mb-6">
//           <PaymentAdditionalInfo
//             selectedTab={selectedTab}
//             selectedMethod={selectedMethod}
//             amount={amount}
//             setNestedDrawerOpen={setNestedDrawerOpen}
//             sendRecipientWalletAddress={sendRecipientWalletAddress}
//             formatNumber={formatNumber}
//             selectedWallet={activeWallet}
//           />
//         </div>

//         {/* Confirm Button */}
//         <div className="flex items-center justify-center my-8">
//           <button
//             disabled={isLoading}
//             onClick={() => handleConfirm(selectedTab)}
//             className="w-full flex items-center justify-center gap-2 text-center text-black font-semibold sm:py-4 cursor-pointer hover:opacity-70 transition-opacity"
//           >
//             {selectedTab === 'SEND' ? 'SEND' : selectedTab} $YZY
//             {pending && <LoaderCircleIcon className="size-5 animate-spin" />}
//           </button>
//         </div>

//         {/* Numeric Keypad */}
//         {/* <PaymentKeypad
//           onNumberClick={handleNumberClick}
//           onBackspace={handleBackspace}
//         /> */}

//         {/* <PaymentOptionsModal
//           isDesktop={isDesktop}
//           nestedDrawerOpen={nestedDrawerOpen}
//           setNestedDrawerOpen={onNestedDrawerChange}
//           selectedTab={selectedTab}
//           handleTabChange={handleTabChange}
//           handleMethodChange={handleMethodChange}
//           sendRecipientWalletAddress={sendRecipientWalletAddress}
//           setSendRecipientWalletAddress={setSendRecipientWalletAddress}
//           handleSendFormSubmit={handleSendFormSubmit}
//         /> */}

//       </div>
//     </div>
//   );
// }
