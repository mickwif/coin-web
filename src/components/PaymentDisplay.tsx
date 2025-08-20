import { cn } from '@/lib/utils';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

interface PaymentDisplayProps {
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PaymentDisplay = ({
  amount,
  handleAmountChange,
}: PaymentDisplayProps) => {
  const [fontSize, setFontSize] = useState(60);

  useEffect(() => {
    const numericCharCount = amount.replace(/[^0-9]/g, '').length;

    if (numericCharCount >= 5) {
      const scaleFactor = Math.min(1, 5 / numericCharCount);
      const newFontSize = Math.max(30, 60 * scaleFactor);
      setFontSize(newFontSize);
    } else {
      setFontSize(60);
    }
  }, [amount]);

  return (
    <CurrencyInput
      initialAmount={amount}
      fontSize={fontSize}
      symbolLeft="$"
      // symbolRight="CAD"
      handleAmountChange={handleAmountChange}
      amount={amount}
    />
  );
};

interface CurrencyInputProps {
  symbolLeft?: string;
  symbolRight?: string;
  initialAmount?: string;
  fontSize?: number;
  handleAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  amount: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  symbolLeft = '$',
  symbolRight,
  initialAmount = '',
  fontSize = 32,
  handleAmountChange,
  amount,
}) => {
  const [inputWidth, setInputWidth] = useState<number>(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update the hidden span and measure its width on amount or fontSize changes
  useEffect(() => {
    if (spanRef.current) {
      // Use a default value ('0') if the input is empty so the input doesn't collapse.
      spanRef.current.textContent = amount || '0';
      const newWidth = spanRef.current.offsetWidth;
      setInputWidth(newWidth + 2);
    }
  }, [amount, fontSize]);

  return (
    <div className="mb-8 flex items-center justify-center h-[80px] sm:h-[100px] xl:h-[120px]">
      {/* Optional left currency symbol */}
      {symbolLeft && (
        <span className="" style={{ fontSize }}>
          {symbolLeft}
        </span>
      )}

      {/* Container for the input and hidden measurement span */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Hidden span to measure text width */}
        <span
          ref={spanRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: 'hidden',
            whiteSpace: 'pre', // Preserve spaces
            fontSize: `${fontSize}px`,
            fontFamily: 'inherit',
            padding: 0,
          }}
        ></span>

        <input
          ref={inputRef}
          className={cn('   duration-200 ease-in-out outline-none')}
          value={amount}
          onChange={handleAmountChange}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1,
            width: inputWidth, // dynamically calculated width
            textAlign: 'center',
            // padding: '4px 8px',
            // transition fontSize not width
            transitionProperty: 'font-size',
          }}
        />
      </div>

      {/* Optional right currency symbol */}
      {symbolRight && <span className="ml-2 text-xl">{symbolRight}</span>}
    </div>
  );
};
