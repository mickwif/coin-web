import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { executeJupiterSwap, executeJupiterSwapWithQuote, getJupiterQuote } from "./jupiter";
import { SOL_MINT, TOKENS, USDC_MINT } from "./constants";
import { getSOLBalance, getUSDCBalance } from "./solana";
import { toastWarn } from "./toast";
import { WalletClient } from 'clique-wallet-sdk';  

const TRANSFER_UPPER_LIMIT = 0.05;
const TRANSFER_MIDDLE_LIMIT = 0.02;
const TRANSFER_LOWER_LIMIT = 0.01;

const MIN_USDC_BALANCE = 5;

const INSUFFICIENT_FUNDS_ERROR = 'Insufficient funds, please buy SOL';

export async function validateAndTransferStateWithRetry(
    connection: Connection,
    wallet: WalletClient
  ): Promise<void> {
    // if (wallet.walletClientType !== 'privy') {
    //   console.log("Wallet is not privy, skipping");
    //   return;
    // }

    const RETRY_DELAY_MS = 1000;
    
    while (true) {
        try {
            await validateAndTransferState(connection, wallet);
            break; // Exit loop if successful
        } catch (error) {
            if (error instanceof Error && error.message.includes(INSUFFICIENT_FUNDS_ERROR)) {
                console.log("Insufficient funds, need to buy SOL later");
                return;
            }
            console.error('Validation and transfer failed, retrying in 1000ms:', error);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}

// Main state validation and transfer function
async function validateAndTransferState(
  connection: Connection,
  wallet: WalletClient
): Promise<void> {
  console.log('validateAndTransferState', wallet.address);

  // if (wallet.walletClientType !== 'privy') {
  //   console.log("Wallet is not privy, skipping");
  //   return;
  // }

  if (!wallet?.address) {
    throw new Error("Wallet not connected");
  }

  const solBalanceInSol = await getSOLBalance(connection, wallet.address);

  // Case 1: SOL balance >= TRANSFER_UPPER_LIMIT, swap excess to USDC
  if (solBalanceInSol >= TRANSFER_UPPER_LIMIT) {
    // Leave TRANSFER_MIDDLE_LIMIT SOL
    const amountToSwap = solBalanceInSol - TRANSFER_MIDDLE_LIMIT;
    const amountInLamports = Math.floor(amountToSwap * LAMPORTS_PER_SOL);
    
    try {
      await executeJupiterSwap(connection, wallet, SOL_MINT.toString(), USDC_MINT.toString(), amountInLamports, 50);
      console.log(`Swapped ${amountToSwap.toFixed(4)} SOL to USDC`);
    } catch (error) {
      console.error("Failed to swap SOL to USDC:", error);
      throw error;
    }
  }
  // Case 2: SOL balance <= TRANSFER_LOWER_LIMIT, check USDC balance
  else if (solBalanceInSol <= TRANSFER_LOWER_LIMIT) {
    const usdcBalanceInUsd = await getUSDCBalance(connection, wallet.address);
    const requiredSol = TRANSFER_MIDDLE_LIMIT - solBalanceInSol;

    if (usdcBalanceInUsd >= MIN_USDC_BALANCE) {
      const usdc_decimals = TOKENS.USDC.decimals;
      const requiredSolInLamports = Math.floor(requiredSol * LAMPORTS_PER_SOL);
      
      try {
        // Get the platform fee bps, 0.8% -> 80 bps
        const platformFeeBps = Number(process.env.NEXT_PUBLIC_SWAP_TRANSACTION_FEE_RATE || 0) * 10000;
        const quoteResponse = await getJupiterQuote(
            USDC_MINT.toString(),
            SOL_MINT.toString(),
            requiredSolInLamports,
            50,
            platformFeeBps,
            false,
            false,
            true
        );

        // Convert quote amount to USDC decimals
        const requiredUsdcAmount = Number(quoteResponse.inAmount) / (10 ** usdc_decimals);
        
        // Check if we have enough USDC
        if (usdcBalanceInUsd < requiredUsdcAmount) {
          console.log(`Insufficient USDC balance. Need ${requiredUsdcAmount.toFixed(2)} USDC, have ${usdcBalanceInUsd.toFixed(2)} USDC`);
          throw new Error(INSUFFICIENT_FUNDS_ERROR);
        }

        await executeJupiterSwapWithQuote(connection, wallet, quoteResponse);
      } catch (error) {
        console.error("Failed to swap USDC to SOL:", error);
        throw error;
      }
    } else {
      console.log(`Insufficient USDC balance (< ${MIN_USDC_BALANCE}), please buy SOL`);
      throw new Error(INSUFFICIENT_FUNDS_ERROR);
    }
  } else {
    console.log("SOL balance is within acceptable range (0.01 - 0.05)");
  }
}
