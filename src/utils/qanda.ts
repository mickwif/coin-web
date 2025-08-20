import { MOONSHOT_URL, PUBLIC_URL, PUBLIC_URL_HOST } from './constants';

type QA = {
  question: string;
  answer: string;
};

export const qanda: QA[] = [
  {
    question: 'WHAT IS YZY MONEY',
    answer: 'YZY MONEY IS A CONCEPT FOR A NEW FINANCIAL SYSTEM, BUILT ON CRYPTO RAILS',
  },
  {
    question: 'WHAT IS YE PAY',
    answer: 'YE PAY IS A CRYPTO PAYMENTS PROCESSOR THAT REMOVES THE HIGH FEES THAT MERCHANTS ARE ACCUSTOMED TO, ACCEPTING CREDIT CARD AND CRYPTO',
  },
  {
    question: 'WHAT ARE YZY MONEY DEBIT CARDS',
    answer: 'YZY MONEY DEBIT CARDS ARE FINANCIAL INSTRUMENTS FOR SPENDING YZY AND USDC GLOBALLY',
  },
  {
    question: 'WHAT IS THE CONTRACT ADDRESS AND SYMBOL FOR YZY',
    answer: `<div>
      <ul>
        <li><span class="">CONTRACT ADDRESS (CA):</span> ${process.env.NEXT_PUBLIC_YZY_MINT}</li>
        <li><span class="">SYMBOL:</span> YZY</li>
      </ul>
    </div>`,
  },
  {
    question: 'How can I trade YZY',
    answer: `<div>
      <ul>
        <li>YZY WILL TRADE ON METEORA ON SOLANA</li>
        <li>THE OFFICIAL YZY LIQUIDITY POOL IS: ${process.env.NEXT_PUBLIC_YZY_POOL}</li>
        <li>YOU CAN TRADE YZY <a href="https://jup.ag/tokens/${process.env.NEXT_PUBLIC_YZY_MINT}" target="_blank">HERE</a></li>
      </ul>
    </div>`,
  },
  {
    question: 'How to trade on mobile',
    answer: `<div>
      <ul>
        <li>INSTALL THE JUPITER APP FROM THE <a href="https://apps.apple.com/app/id6484069059" target="_blank">APP STORE</a> OR <a href="https://play.google.com/store/apps/details?id=ag.jup.jupiter.android" target="_blank">GOOGLE PLAY</a></li>
        <li>OPEN THE APP AND SEARCH BY ${process.env.NEXT_PUBLIC_YZY_MINT}</li>
        <li>PURCHASE YZY</li>
      </ul>
    </div>`,
  },
  {
    question: 'How do I buy YZY with Card',
    answer: `<div>
      <ul>
        <li>CLICK THE BUY BUTTON ON HOME PAGE</li>
        <li>FUND YOUR ACCOUNT WITH A DEBIT OR CREDIT CARD VIA MOONPAY</li>
        <li>PURCHASE YZY</li>
      </ul>
    </div>`,
  },
  {
    question: `HOW DOES OUR ANTI-SNIPING SYSTEM WORK`,
    answer: `<p>25 CONTRACT ADDRESSES FOR THE YZY HAVE BEEN DEPLOYED, WITH YE SELECTING ONE AT RANDOM FOR THE OFFICIAL YZY. THIS DISSUADES SNIPERS BY MAKING IT A 1/25 CHANCE FOR SELECTION OF THE RIGHT CA, PUTTING POWER BACK INTO THE HANDS OF REAL TRADERS</p>`,
  },
  {
    question: 'WHAT BLOCKCHAIN ARE YZY COINS MINTED ON',
    answer:
      '<p>ALL YZY COINS ARE MINTED ON THE SOLANA BLOCKCHAIN</p>',
  },
  {
    question: 'HOW IS YZY VESTED',
    answer: `<div class="custom-text">
<p>WE USE JUPITER LOCK, AN OPEN-SOURCED AND AUDITED PROTOCOL, TO LOCK AND DISTRIBUTE YZY ON-CHAIN. THIS ENSURES A TRANSPARENT, CLIFF-BASED VESTING SCHEDULE ANYONE CAN VERIFY IN REAL TIME. VESTING TOKENS CAN BE VIEWED VIA THE FOLLOWING LINKS</p>
<div class="tranches" className="tranches">
<a href="${process.env.NEXT_PUBLIC_TRANCHE_1}">TRANCHE 1</a>
<a href="${process.env.NEXT_PUBLIC_TRANCHE_2}">TRANCHE 2</a>
<a href="${process.env.NEXT_PUBLIC_TRANCHE_3}">TRANCHE 3</a>
</div>
</div>`,
  },
  {
    question: 'Are YZY, Ye Pay, and YZY Card affiliated',
    answer: `<p>YZY, YE PAY, AND YZY CARD ARE SEPARATE ENTITIES WITH DIFFERENT PURPOSES</p>`,
  },
  {
    question: 'What else should I know',
    answer: `<p>PLEASE REVIEW IMPORTANT DISCLOSURES REGARDING YZY COIN <a href="/terms" class="">HERE</a></p>`,
  },
];