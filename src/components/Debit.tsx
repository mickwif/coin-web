import { useState } from 'react';
import Image from 'next/image';
import YeezyCard from '../../public/yeezycard.png';
import { Wallet } from './Wallet';

export const Debit = () => {
    const [email, setEmail] = useState('');
    const [hasJoined, setHasJoined] = useState(false);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isEmailValid = isValidEmail(email);
    const canClick = isEmailValid && !hasJoined;

    const handleJoinWaitlist = () => {
        if (canClick) {
            setHasJoined(true);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (hasJoined) {
            setHasJoined(false);
        }
    };

    return (
      <div>
         {/* <Wallet /> */}
         <div className="-ml-4">
            <Image src={YeezyCard} alt="Yeezy Card" />
         </div>
         <div className="mt-4">
            <input 
              type="text" 
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-none text-sm uppercase" 
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
         </div>
         <div className="mt-5">
            <button
              onClick={handleJoinWaitlist}
              disabled={!canClick}
              className={`flex w-full rounded-md text-sm uppercase items-start ${
                hasJoined 
                  ? 'text-black cursor-default' 
                  : canClick 
                    ? 'text-black cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {hasJoined ? 'Joined' : 'Join waitlist'}
            </button>
         </div>
         <div className="uppercase pt-20">
          YZY Card is the debit instrument for spending YZY and USDC globally. Debit cards will let you access your crypto assets at any location that accepts Visa, cutting out middlemen and fees. These will operate as non-custodial cards that let you spend your crypto in the real world without needing to swap to fiat
         </div>
         <div className="uppercase pt-20">Access tens of millions of locations across the globe at any merchant accepting Visa, taking your crypto wherever you go. Cards can be funded with fiat or any non-custodial wallet, supporting a wide range of crypto assets including YZY, USDC, USDT, and others</div>
      </div>
    );
  };
  