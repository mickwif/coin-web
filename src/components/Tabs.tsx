'use client';

import { useState } from 'react';
import { ContactAddress } from '@/components/ContactAddress';
import { Allocation } from '@/components/Allocation';
import { Apparel } from '@/components/Apparel';
import { Debit } from '@/components/Debit';
import { Pay } from '@/components/Pay';

export const Tabs = () => {
  const [activeTab, setActiveTab] = useState('YZY');

  const tabs = [
    { id: 'YZY', label: 'YZY' },
    { id: 'Ye Pay', label: 'Ye Pay' },
    { id: 'YZY Card', label: 'YZY Card' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex mb-8 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 font-medium transition-colors uppercase ${
              activeTab === tab.id
                ? 'text-black'
                : 'text-black/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-20">
        {activeTab === 'YZY' && (
          <>
            <div className="uppercase">YZY is the currency that powers all transactions within Yeezy Money</div>
            {/* <Apparel /> */}
            <ContactAddress />
            <div className="uppercase"><a href={`https://jup.ag/tokens/${process.env.NEXT_PUBLIC_YZY_MINT}`} target="_blank">Trade YZY now</a></div>
            <div className="uppercase">
            <a
              href="https://jup.ag/mobile"
              target="_blank"
              onClick={(e) => {
                e.preventDefault();

                const ua = navigator.userAgent || navigator.vendor;
                const isIOS = /iPad|iPhone|iPod/.test(ua);
                const isAndroid = /android/i.test(ua);

                const iosStore = "https://apps.apple.com/app/id6484069059";
                const androidStore = "https://play.google.com/store/apps/details?id=ag.jup.jupiter.android";
                const universal = "https://jup.ag/mobile";

                if (!isIOS && !isAndroid) {
                  window.open(iosStore, "_blank", "noopener");
                  return;
                }

                const timeout = setTimeout(() => {
                  window.location.href = isIOS ? iosStore : androidStore;
                }, 900);

                window.location.href = universal;

                window.addEventListener("pagehide", () => clearTimeout(timeout), { once: true });
                window.addEventListener("visibilitychange", () => {
                  if (document.visibilityState === "hidden") clearTimeout(timeout);
                }, { once: true });
              }}
            >
              Trade on Mobile
            </a>
          </div>

            <Allocation />
          </>
        )}

        {activeTab === 'Ye Pay' && (
          <>
            <Pay />
          </>
        )}

        {activeTab === 'YZY Card' && (
          <>
            <Debit />
          </>
        )}
      </div>
    </div>
  );
};