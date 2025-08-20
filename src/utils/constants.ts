import { PublicKey } from '@solana/web3.js';

export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'mainnet-beta';
// Token mint addresses
export const SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112'
);
export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);
export const USDT_MINT = new PublicKey(
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
);

export const TOKEN_DECIMALS = {
  SOL: 9,
  USDC: 6,
  USDT: 6,
  YZY: 6,
};

// TODO: replace it with real KANYE TOKEN info
export const YZY_TOKEN = {
  symbol: process.env.NEXT_PUBLIC_YZY_SYMBOL,
  mint: new PublicKey(process.env.NEXT_PUBLIC_YZY_MINT || ''),
  decimals: parseInt(process.env.NEXT_PUBLIC_YZY_DECIMALS || ''),
  coinGeckoId: process.env.NEXT_PUBLIC_YZY_COINGECKO_ID,
} as const;

export const COMMON_TOKENS = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
  },
  // {
  //   symbol: 'USDT',
  //   mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  //   decimals: 6
  // }
] as const;

export const TOKENS = {
  SOL: {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
  },
  USDC: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
  },
  YZY: {
    symbol: 'YZY',
    mint: process.env.NEXT_PUBLIC_YZY_MINT!, // TODO
    decimals: 6,
  },
};

export const TokenList = [...COMMON_TOKENS, YZY_TOKEN] as const;

export type Token = {
  symbol: string;
  mint: string;
  decimals: number;
};

export const SUPPORT_EMAIL = 'tokensupport@yeezy.com';
export const MOONSHOT_URL = 'https://moonshot.money/yeezy';
export const TWITTER_URL = 'https://x.com/yzy_tkn';
export const DISCORD_URL = 'https://discord.gg';
export const PUBLIC_URL_HOST = 'MONEY.YEEZY.COM';
export const PUBLIC_URL = `https://${PUBLIC_URL_HOST}`;
