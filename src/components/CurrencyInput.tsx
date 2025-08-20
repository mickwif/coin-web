import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { TOKEN_DECIMALS, TokenList, TOKENS } from '@/utils/constants';
import { useTokenPrices } from '@/hooks/useTokenPrices';

/**
 * Conversion rates: parent's amount is always in USD.
 * For example, if currency is SOL, then:
 *    1 SOL = 20 USD  →  USD = SOL * 20  and SOL = USD / 20.
 * For YZY, 1 YZY = 0.5 USD.
 */
// const conversionRates = {
//   USD: 1,
//   SOL: 20,
//   YZY: 0.5,
// };

/**
 * Configuration for each currency:
 * - symbol: the currency symbol (or code)
 * - symbolPosition: whether the symbol is shown before or after the number
 * - decimals: the maximum number of decimals allowed in the input
 */
const currencyConfig = {
  USD: {
    symbol: '$',
    symbolPosition: 'prefix',
    decimals: 2,
  },
  USDC: {
    symbol: '$',
    symbolPosition: 'prefix',
    decimals: 2,
  },
  SOL: {
    symbol: 'SOL',
    symbolPosition: 'suffix',
    decimals: TOKEN_DECIMALS.SOL,
  },
  YZY: {
    symbol: 'YZY',
    symbolPosition: 'suffix',
    decimals: TOKEN_DECIMALS.YZY,
  },
};

const MaxLength = 12;

/**
 * A helper function to format a numeric string.
 * It removes any non-digit/period characters, splits into integer and decimal parts,
 * inserts commas into the integer part, and (if present) limits the decimal part to
 * a maximum number of digits. (It also preserves input like "1.".)
 */
const formatCurrencyHelper = (value: string, decimals: number): string => {
  // Remove any non-numeric (except dot) characters.
  const numericValue = value.replace(/[^0-9.]/g, '');
  const [integerPart, decimalPart] = numericValue.split('.');
  // Format the integer part using commas.
  // (If no integer part exists because the user typed ".", we default to "0".)
  let formattedInteger = integerPart
    ? Number(integerPart).toLocaleString('en-US')
    : '0';
  if (decimalPart === undefined) return formattedInteger;
  if (decimalPart === '') return `${formattedInteger}.`;
  return `${formattedInteger}.${decimalPart.slice(0, decimals)}`;
};

/**
 * formatInput formats a value for the input field according to the currency’s
 * allowed decimals. It also ensures that (when commas are removed) the input does
 * not exceed a maximum length.
 */
const formatInput = (
  value: string,
  currency: keyof typeof currencyConfig,
  truncate = true
): string => {
  const decimals = currencyConfig[currency].decimals;
  const formatted = formatCurrencyHelper(value, decimals);
  const rawValue = formatted.replace(/,/g, '');
  if (truncate && rawValue.length >= MaxLength) {
    return formatCurrencyHelper(rawValue.slice(0, MaxLength), decimals);
  }
  return formatted;
};

/**
 * formatDisplay returns the value with the proper currency symbol.
 * For example, USD appears as "$123.45" (symbol prefixed) and YZY as "123.45 YZY" (symbol suffixed).
 */
const formatDisplay = (
  value: string,
  currency: keyof typeof currencyConfig
): string => {
  const config = currencyConfig[currency];
  const formatted = formatInput(value, currency, false);
  return config.symbolPosition === 'prefix'
    ? `${config.symbol}${formatted}`
    : `${formatted} ${config.symbol}`;
};

interface CurrencyInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  /** The alternative currency to use (other than USD). For example: "SOL" or "YZY". */
  currency: 'USDC' | 'YZY';
  hideSwap?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  amount,
  onAmountChange,
  currency,
  hideSwap,
}) => {
  const { data: tokenPrices } = useTokenPrices(
    TokenList.map((token) => token.mint.toString())
  );

  const YZY_PRICE = tokenPrices
    ? Number(tokenPrices[TOKENS.YZY.mint]?.usdPrice ?? 0)
    : 0;

  const SOL_PRICE = tokenPrices
    ? Number(tokenPrices[TOKENS.SOL.mint]?.usdPrice ?? 0)
    : 0;

  const conversionRates = {
    USDC: 1,
    USD: 1,
    SOL: SOL_PRICE,
    YZY: YZY_PRICE,
  };

  // isUSD === true means the user is editing/viewing the USD amount.
  // When false, the input shows the alternative currency amount.
  const [inputValue, setInputValue] = useState(amount);
  const [usdValue, setUsdValue] = useState(amount);
  const [isUSD, setIsUSD] = useState(true);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);
  // const [fontSize, setFontSize] = useState(60);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (spanRef.current) {
      //   console.log(inputValue);
      //   const currentCurrency = isUSD ? 'USD' : currency;
      //   const formattedInput = isUSD ? formatInput(amount, 'USD') : amount;
      // Use a default value ('0') if the input is empty so the input doesn't collapse.
      spanRef.current.textContent = inputValue || '0';

      //   console.log(formattedInput);
      const newWidth = spanRef.current.offsetWidth;
      setInputWidth(newWidth + 8);
    }
  }, [inputValue]);
  // }, [inputValue, fontSize]);

  // useEffect(() => {
  //   // const numericCharCount = amount.replace(/[^0-9]/g, '').length;
  //   const numericCharCount = inputValue.length;

  //   if (numericCharCount >= 5) {
  //     const scaleFactor = Math.min(1, 5 / numericCharCount);
  //     const newFontSize = Math.max(30, 60 * scaleFactor);
  //     setFontSize(newFontSize);
  //   } else {
  //     setFontSize(60);
  //   }
  // }, [inputValue]);

  //   useEffect(() => {
  //     if (isUSD) {
  //       // When in USD mode, format the parent's USD amount.
  //       const formatted = formatInput(amount, 'USD');
  //       setInputValue(formatted);
  //       setUsdValue(amount);
  //     } else {
  //       // When in alternative currency mode, convert the USD amount.
  //       const convRate = conversionRates[currency];
  //       const altValue = (Number.parseFloat(amount) / convRate)
  //         .toFixed(currencyConfig[currency].decimals)
  //         .replace(/\.?0+$/, '');
  //       setInputValue(altValue);
  //       setUsdValue(amount);
  //     }
  //   }, [amount, isUSD, currency, isFocused]);

  // Only update inputValue from parent's amount when not editing.
  useEffect(() => {
    if (!isFocused) {
      if (isUSD) {
        const formatted = formatInput(amount, 'USD');
        setInputValue(formatted);
        setUsdValue(amount);
      } else {
        const convRate = conversionRates[currency];
        const altValue = (Number.parseFloat(amount) / convRate)
          .toFixed(currencyConfig[currency].decimals)
          .replace(/\.?0+$/, '');
        const formattedAlt = formatInput(altValue, currency);
        setInputValue(formattedAlt);
        setUsdValue(amount);
      }
    }
  }, [amount, isUSD, currency, isFocused, conversionRates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isUSD) {
      // Format input as USD.
      const formattedValue = formatInput(value, 'USD');

      setInputValue(formattedValue);
      // Remove commas before updating parent's state.
      const rawUsd = formattedValue.replace(/,/g, '');
      setUsdValue(rawUsd);
      onAmountChange(rawUsd);
    } else {
      // In alternative mode, update the input as-is and convert to USD.
      const formattedValue = formatInput(value, currency);
      setInputValue(formattedValue);
      const numericValue =
        Number.parseFloat(formattedValue.replace(/,/g, '')) || 0;
      const convRate = conversionRates[currency];
      const calculatedUsd = (numericValue * convRate).toFixed(
        //TODO bigNumber
        currencyConfig.USD.decimals
      );
      setUsdValue(calculatedUsd);
      onAmountChange(calculatedUsd);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // When the input loses focus, reformat the value.
  const handleBlur = () => {
    setIsFocused(false);
    if (isUSD) {
      const formatted = formatInput(inputValue, 'USD');
      setInputValue(formatted);
    } else {
      const convRate = conversionRates[currency];
      // Reapply formatting (and conversion from parent's USD) on blur.
      const altValue = (Number.parseFloat(usdValue) / convRate)
        .toFixed(currencyConfig[currency].decimals)
        .replace(/\.?0+$/, '');
      // setInputValue(altValue);
    }
  };

  const swapCurrency = () => {
    // if (isUSD) {
    //   // Switch from USD to the alternative currency.
    //   const convRate = conversionRates[currency];
    //   const altValue = (Number.parseFloat(usdValue) / convRate)
    //     .toFixed(currencyConfig[currency].decimals)
    //     .replace(/\.?0+$/, '');
    //   const formattedAlt = formatInput(altValue, currency);
    //   setInputValue(formattedAlt);
    // } else {
    //   // Switch from alternative back to USD.
    //   const formattedUsd = formatInput(usdValue, 'USD');
    //   setInputValue(formattedUsd);
    // }
    setIsUSD(!isUSD);
  };

  /**
   * getOppositeValue returns the formatted conversion amount:
   * - If the user is editing USD, it shows the converted alternative value.
   * - If editing the alternative currency, it shows the USD amount.
   */
  const getOppositeValue = (): string => {
    if (isUSD) {
      const convRate = conversionRates[currency];
      const altValue = (Number.parseFloat(usdValue) / convRate)
        .toFixed(currencyConfig[currency].decimals)
        .replace(/\.?0+$/, '');
      return formatDisplay(altValue, currency);
    } else {
      return formatDisplay(usdValue, 'USD');
    }
  };

  return (
    <div className="flex items-center justify-center flex-col relative">
      {!hideSwap && (
        <button
          className="absolute w-10 h-10 -right-6 cursor-pointer"
          onClick={swapCurrency}
        >
          <Image
            src="/arrows-up-down-thinner.svg"
            alt="Swap currency"
            width={32}
            height={32}
          />
        </button>
      )}
      <div className="relative flex items-center   text-base">
        {isUSD && (
          <span
            className=" "
            style={
              {
                // fontSize: `${fontSize}px`,
              }
            }
          >
            $
          </span>
        )}

        <span
          ref={spanRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: 'hidden',
            whiteSpace: 'pre', // Preserve spaces
            // fontSize: `${fontSize}px`,
            fontFamily: 'inherit',
            padding: 0,
          }}
        ></span>
        <input
          ref={inputRef}
          id="amount"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          //   placeholder={isUSD ? 'Enter USD amount' : `Enter ${currency} amount`}
          className={cn('  ease-in-out outline-none text-base')}
          style={{
            // fontSize: `${fontSize}px`,
            lineHeight: 1,
            width: inputWidth, // dynamically calculated width
            textAlign: 'center',
            // padding: '4px 8px',
            // transition fontSize not width
            transitionProperty: 'font-size',
          }}
        />

        {!isUSD && (
          <span
            className="ml-3  "
            style={
              {
                // fontSize: `${fontSize}px`,
              }
            }
            // onclick focus input
            onClick={() => inputRef.current?.focus()}
          >
            {currency}
          </span>
        )}
      </div>
      <div className="">
        <span className="  text-center text-black/50">
          {getOppositeValue()}
        </span>
      </div>
      {/* <Button onClick={swapCurrency}>Swap to {isUSD ? currency : 'USD'}</Button> */}
    </div>
  );
};
