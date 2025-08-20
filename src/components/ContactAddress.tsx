import { useState } from 'react';
import { Apparel } from './Apparel';

export const ContactAddress = () => {
  const [isCopied, setIsCopied] = useState(false);

  const address = process.env.NEXT_PUBLIC_YZY_MINT;

  const copyContractAddress = () => {
    // copy the ca and scroll down

    navigator.clipboard.writeText(address ?? '');

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-1">
        <p onClick={copyContractAddress} className="cursor-pointer">
          {isCopied ? 'COPIED' : 'CONTRACT ADDRESS'}
        </p>
        <p onClick={copyContractAddress} className="break-all text-black/20 cursor-pointer">
          {address}
        </p>
    </div>
  );
};
