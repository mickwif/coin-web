import { useState } from 'react';
import Image from 'next/image';
import YeezyCard from '../../public/yeezycard.png';
import { Wallet } from './Wallet';
import { joinWaitlist } from '../utils/waitlist';

export const Debit = () => {
    const [email, setEmail] = useState('');
    const [hasJoined, setHasJoined] = useState(false);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isEmailValid = isValidEmail(email);
    const canClick = isEmailValid && !hasJoined;

    const handleJoinWaitlist = async () => {
        if (canClick) {
            const success = await joinWaitlist(email);
            if (success) {
                setHasJoined(true);
            }
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
         YZY Card is the debit instrument for spending YZY and USDC at millions of merchants worldwide. It operates as a non-custodial card, enabling direct use of crypto without manual fiat conversion or reliance on middlemen
         </div>
         <div className="uppercase pt-20">YZY Card can be funded with fiat or crypto from any non-custodial wallet, supporting assets like YZY, USDC, USDT, and more</div>
      </div>
    );
  };
  