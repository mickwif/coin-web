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
      <div className="flex mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b transition-colors uppercase ${
              activeTab === tab.id
                ? 'border-black text-black'
                : 'border-gray-200 text-black/20'
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
            <div className="uppercase">YZY is the currency that powers all transactions and value within the system. EXCLUSIVE MERCH WILL UNLOCK FOR YZY HOLDERS ON YEEZY.COM</div>
            {/* <Apparel /> */}
            <ContactAddress />
            <div className="uppercase"><a href="https://superstack.xyz/" target="_blank">Trade YZY now</a></div>
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
