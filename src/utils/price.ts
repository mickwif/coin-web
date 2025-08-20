import { SOL_MINT, USDC_MINT, YZY_TOKEN } from "./constants";

const COINGECKO_API_BASE = process.env.NEXT_PUBLIC_COINGECKO_API_BASE || '';
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';

interface TokenPrices {
  [key: string]: {
    usd: number;
  };
}

export const getTokenPricesByAddresses = async (token_addresses: string[]): Promise<TokenPrices> => {
  try {
    const url = `${COINGECKO_API_BASE}/simple/token_price/solana?contract_addresses=${token_addresses.join(',')}&vs_currencies=usd`;
    console.log(url);
    const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY,
          accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('API request failed with status:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    throw error;
  }
};

export const getTokenPricesByIds = async (tokens: string[]): Promise<TokenPrices> => {
  try {
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${tokens.join(',')}&vs_currencies=usd`;
    console.log(url);
    const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY,
          accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('API request failed with status:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    throw error;
  }
};

export const getYZYPrice = async (): Promise<number> => {
  const prices = await getTokenPricesByAddresses([YZY_TOKEN.mint.toString()])
  return prices[YZY_TOKEN.mint.toString()].usd
};

// Get prices for all supported tokens
export const getAllTokenPrices = async () => {
  const addresses = [YZY_TOKEN.mint.toString(), SOL_MINT.toString(), USDC_MINT.toString()];
  const prices = await getTokenPricesByAddresses(addresses);
    
  return {
    'YZY': prices[YZY_TOKEN.mint.toString()].usd,
    'SOL': prices[SOL_MINT.toString()].usd,
    'USDC': prices[USDC_MINT.toString()].usd,
  };
};