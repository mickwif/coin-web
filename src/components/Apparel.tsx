import styles from '@/styles/glass.module.css';
import { LockKeyhole } from 'lucide-react';

export const Apparel = () => {
  return (
    <div className="space-y-7">
      {/* 30 days */}
      <p className="mx-auto">EXCLUSIVE MERCH WILL UNLOCK FOR $YZY HOLDERS ON YEEZY.COM</p>

      {/* <div className="relative  mx-auto">
        <div
          className={`${styles['white-grad']} mx-auto  h-72 flex items-center flex-col space-y-1 justify-center relative z-20 p-10`}
          style={{
            backdropFilter: 'blur(6px)',
          }}
        >
          <LockKeyhole size={22} strokeWidth={2.5} />
          <p className="">LOCKED</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-30 p-[2px]">
          <img
            src="/glass-noise.png"
            alt="hoodie"
            className="object-cover w-full h-full"
            style={{ borderRadius: '22px' }}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-8 mt-2 z-0">
          <img src="/grey-clothes.jpg" alt="hoodie" className="object-cover" />
        </div>
      </div> */}
    </div>
  );
};
