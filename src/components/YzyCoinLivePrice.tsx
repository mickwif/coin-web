import { useTokenPrices } from '@/hooks/useTokenPrices';
import { TokenList, TOKENS } from '@/utils/constants';
import Image from 'next/image';

import BirdCoin from '../../public/masked-final-logo.webp';
export const YzyCoinLivePrice = () => {
  return (
    <div className="flex justify-center items-center space-x-2 font-mono">
      {/* <Image
        src={SpinningCoin}
        alt="YZY Logo"
        className="rounded-full object-cover h-9 w-9"
      /> */}
      <div className="h-8 w-8">
        <Image src={BirdCoin} alt="YZY Logo" />
      </div>
      <span className=" ">
        <Price />
      </span>
    </div>
  );
};

const Price = () => {
  const { data: tokenPrices, isLoading: loadingTokenPrices } = useTokenPrices(
    TokenList.map((token) => token.mint.toString())
  );

  if (tokenPrices === undefined) return null;

  const yzyPrice = Number(tokenPrices[TOKENS.YZY.mint]?.usdPrice).toFixed(2);

  if (loadingTokenPrices) {
    return <span>Loading...</span>;
  }

  return <span>${yzyPrice}</span>;
};
