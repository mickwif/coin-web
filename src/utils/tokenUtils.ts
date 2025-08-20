import { Connection, PublicKey } from '@solana/web3.js';
import { COMMON_TOKENS, YZY_TOKEN, Token } from './constants';
import { getConnection } from './solana';

// Cache for token information
const tokenCache: Map<string, Token> = new Map();
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

// Add periodic update
setInterval(fetchTokenList, CACHE_DURATION);

async function fetchTokenList(): Promise<void> {
  try {
    const response = await fetch('https://api.jup.ag/tokens/v1/tagged/verified');
    const tokens = await response.json();
    
    // Populate cache with new data
    tokens.forEach((token: { address: string; symbol: string; decimals: number }) => {
      tokenCache.set(token.address, {
        symbol: token.symbol,
        mint: token.address,
        decimals: token.decimals,
      });
    });
    
    lastFetchTime = Date.now();
  } catch (error) {
    console.error('Failed to fetch token list:', error);
  }
}

export async function validateTokenMint(mint: string): Promise<Token> {
  // Refresh cache if needed
  if (Date.now() - lastFetchTime > CACHE_DURATION) {
    await fetchTokenList();
  }
  
  // Check cache first
  const cachedToken = tokenCache.get(mint);
  if (cachedToken) {
    return cachedToken;
  }

  throw new Error('Token not found');
}
