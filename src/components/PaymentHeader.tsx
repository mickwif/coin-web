import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { TokenList, YZY_TOKEN } from '@/utils/constants';

interface PaymentHeaderProps {
  getTopSelectorText: () => string;
  handleOpenOptions: () => void;
  formatNumber: (value: string) => string;
}

export function PaymentHeader({
  getTopSelectorText,
  handleOpenOptions,
  formatNumber,
}: PaymentHeaderProps) {
  const {
    data: tokenPrices,
    isLoading: isLoadingTokenPrices,
    isRefetching,
  } = useTokenPrices(TokenList.map((token) => token.mint.toString()));

  return (
    <>
      <div
        onClick={handleOpenOptions}
        className="w-full mb-4 flex justify-end items-center cursor-pointer"
      >
        <span className="mr-2">{getTopSelectorText()}</span>
        <ChevronRight className="h-4 w-4" />
      </div>

      {/* Logo, $YZY text, and Live Price */}
      <div className="flex justify-between items-center mb-4 -ml-2">
        <div className="flex items-center">
          <Image
            src="/coin-anim.webp"
            alt="YZY Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="ml-2 text-base">$YZY</span>
        </div>
        <div className="">
          {isLoadingTokenPrices || isRefetching
            ? 'Loading...'
            : `${formatNumber(
                Number(
                  tokenPrices?.[YZY_TOKEN.mint.toString()]?.usdPrice ?? 0
                ).toFixed(2)
              )}`}
        </div>
      </div>
    </>
  );
}
