import { MOONSHOT_URL } from '@/utils/constants';
import Link from 'next/link';

export const PaymentMethods = () => {
  return (
    <div className="pt-4 space-y-7 flex flex-col">
      <Link href={MOONSHOT_URL}>
        <p className=" ">BUY WITH MOONSHOT</p>
      </Link>
    </div>
  );
};
