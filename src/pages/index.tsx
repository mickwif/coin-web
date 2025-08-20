import { FAQ } from '@/components/FAQ';
import { Terms } from '@/components/Terms';
import { Narrative } from '@/components/Narrative';

import { Socials } from '@/components/Socials';
import Image from 'next/image';

import { YZYMintComingSoon } from '@/components/YZYMintComingSoon';
import BirdCoin from '../../public/masked-final-logo.webp';
import { BuySellButtons } from '@/components/BuySellButtons';
import { Tabs } from '@/components/Tabs';

export default function Home() {
  const shouldHidePage = process.env.NEXT_PUBLIC_HIDE_PAGE === 'true';
  if (shouldHidePage) return <YZYMintComingSoon />;
  return <Main />;
}

const Main = () => {
  return (
    <div className={`relative text-left text-[0.95rem] `}>
      <div className=" pb-8  max-w-sm mx-auto px-6">
        {/* start above fold */}
        {/* <div className=" flex flex-col "> */}
        <div className="flex flex-col justify-between">
          <div className="flex-grow flex items-center justify-center h-[400px] md:h-[600px]">
            <div className="w-48 h-48 rounded-full">
              <Image src={BirdCoin} alt="new coin" />
            </div>
          </div>

          <div
            className=" 
            flex flex-col gap-16
      z-50 pointer-events-auto
      "
          >
            <BuySellButtons />
            <Narrative />
            <Tabs />
            {/* <Apparel /> */}
            
            <div className="border-t border-gray-200"></div>
            <FAQ />
            {/* <PaymentMethods /> */}
            <div className="flex flex-col gap-10">
              <Terms />
              <Socials />
            </div>
          </div>
        </div>
      </div>

      {/* <YzyCoinScene /> */}
    </div>
  );
};
