import {
  Connection,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  AddressLookupTableAccount,
  TransactionInstruction,
  TransactionMessage,
  SendTransactionError,
  Transaction,
  VersionedTransactionResponse
} from "@solana/web3.js";
import { getConnection } from "@/utils/solana";
import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { nullable } from "zod";
import { SOL_MINT, YZY_TOKEN, USDC_MINT } from "./constants";
import { ReferralProvider } from "@jup-ag/referral-sdk";
import { resolve } from "path";
import { confirmTransaction } from "./confirmation";

import { WalletClient } from 'yeezy-wallet-sdk';  
const JUPITER_SWAP_API_URL = process.env.NEXT_PUBLIC_JUPITER_SWAP_API || "https://api.jup.ag/swap/v1";
const MAX_PRIORITY_FEE_LAMPORTS = Math.max(Number(process.env.NEXT_PUBLIC_MAX_PRIORITY_FEE_LAMPORTS || 2000000), 2000000);

// Interface for quote response
interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null | any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
  error?: string;
}

// Interface for swap response
interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
}

// Add minimum fee constant
const MIN_SWAP_FEE_LAMPORTS = 10000; // 10000 lamports = 0.00001 SOL

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 100,
  platformFeeBps: number = 0,
  onlyDirectRoutes: boolean = false,
  asLegacyTransaction: boolean = false,
  isExactOut: boolean = false,
): Promise<QuoteResponse> {
  try {
    const response = await fetch(
      `${JUPITER_SWAP_API_URL}/quote?inputMint=${inputMint}\
&outputMint=${outputMint}\
&amount=${amount}\
&slippageBps=${slippageBps}\
&onlyDirectRoutes=${onlyDirectRoutes}\
&asLegacyTransaction=${asLegacyTransaction}\
&restrictIntermediateTokens=true\
${isExactOut ? `&swapMode=ExactOut` : ''}\
${platformFeeBps !== 0 ? `&platformFeeBps=${platformFeeBps}` : ''}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    console.log("jupiter quote: ", data);
    console.log("route plan len: ", data.routePlan.length);
    return data;
  } catch (error) {
    console.error("Error getting Jupiter quote:", error);
    throw error;
  }
}

function constructSwapBody(
  quoteResponse: QuoteResponse, 
  userPublicKey: string, 
  feeAccount: string | null = null,
  asLegacyTransaction: boolean = false
)
{
  const maxSlippageBps = Math.max(Number(process.env.NEXT_PUBLIC_MAX_SLIPPAGE_BPS || 2000), 300);
  console.log("maxSlippageBps: ", maxSlippageBps);

  const swapBody = {
    quoteResponse: quoteResponse,
    userPublicKey: userPublicKey,
    wrapAndUnwrapSol: true,
    asLegacyTransaction: asLegacyTransaction,

    // ADDITIONAL PARAMETERS TO OPTIMIZE FOR TRANSACTION LANDING
    dynamicComputeUnitLimit: true,
    // dynamicSlippage: true,
    dynamicSlippage: { 
      maxBps: maxSlippageBps
    },
    prioritizationFeeLamports: {
      priorityLevelWithMaxLamports: {
        maxLamports: MAX_PRIORITY_FEE_LAMPORTS,
        priorityLevel: "veryHigh"
      }
    },

    ...(feeAccount && feeAccount !== "" ? { feeAccount } : {})
  };

  console.log("swap body: ", swapBody);
  return swapBody;
}

export async function getJupiterSwapResponse(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
  feeAccount: string | null = null,
  asLegacyTransaction: boolean = false
): Promise<SwapResponse> {
  try {
    const swapBody = constructSwapBody(quoteResponse, userPublicKey, feeAccount, asLegacyTransaction);
    console.log("swap url: ", `${JUPITER_SWAP_API_URL}/swap`);
    const response = await fetch(`${JUPITER_SWAP_API_URL}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    console.log("swap response:", data);
    return data;
  } catch (error) {
    console.error("Error getting Jupiter swap transaction:", error);
    throw error;
  }
}

export async function getJupierSwapInstructionTransaction(
  connection: Connection,
  quoteResponse: QuoteResponse,
  userPublicKey: string,
  feeAccount: string | null = null,
  asLegacyTransaction: boolean = false
)
: Promise<VersionedTransaction> {
  const swapBody = constructSwapBody(quoteResponse, userPublicKey, feeAccount, asLegacyTransaction);
  const instructions = await (
    await fetch(`${JUPITER_SWAP_API_URL}/swap-instructions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapBody),
    })
  ).json();

  if (instructions.error) {
    throw new Error("Failed to get swap instructions: " + instructions.error);
  }

  const {
    tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
    computeBudgetInstructions, // The necessary instructions to setup the compute budget.
    setupInstructions, // Setup missing ATA for the users.
    swapInstruction: swapInstructionPayload, // The actual swap instruction.
    cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
    addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
  } = instructions;

  const deserializeInstruction = (instruction: any) => {
    return new TransactionInstruction({
      programId: new PublicKey(instruction.programId),
      keys: instruction.accounts.map((key: any) => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: Buffer.from(instruction.data, "base64"),
    });
  };

  const getAddressLookupTableAccounts = async (
    keys: string[]
  ): Promise<AddressLookupTableAccount[]> => {
    const addressLookupTableAccountInfos =
      await connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key))
      );

    return addressLookupTableAccountInfos.reduce(
      (acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index];
        if (accountInfo) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
          });
          acc.push(addressLookupTableAccount);
        }

        return acc;
      },
      new Array<AddressLookupTableAccount>()
    );
  };

  const addressLookupTableAccounts: AddressLookupTableAccount[] = [];

  addressLookupTableAccounts.push(
    ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
  );

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(userPublicKey),
    recentBlockhash: blockhash,
    instructions: [
      ...computeBudgetInstructions.map(deserializeInstruction),
      ...setupInstructions.map(deserializeInstruction), //uncomment if needed:
      deserializeInstruction(swapInstructionPayload),
      deserializeInstruction(cleanupInstruction), // uncomment if needed:
    ],
  }).compileToV0Message(addressLookupTableAccounts);
  const transaction = new VersionedTransaction(messageV0);

  return transaction;
}

// Helper to estimate swap transaction fee
export async function estimateSwapFee(
  connection: Connection,
  quoteResponse: QuoteResponse,
  userPublicKey: string
): Promise<number> {
  try {
    // Get swap transaction
    const { swapTransaction, prioritizationFeeLamports, computeUnitLimit } =
      await getJupiterSwapResponse(quoteResponse, userPublicKey);

    // Base fee calculation
    const baseFee = MIN_SWAP_FEE_LAMPORTS;

    // Add prioritization fee if any
    const totalFee = baseFee + prioritizationFeeLamports;

    // Add 50% buffer for compute units and network fluctuation
    const feeWithBuffer = totalFee * 1.5;

    // Return in SOL with minimum fee guarantee
    return Math.max(feeWithBuffer / LAMPORTS_PER_SOL, 0.00001);
  } catch (error) {
    console.error("Error estimating swap fee:", error);
    return 0.00001; // Return 10000 lamports as safe default
  }
}

async function checkBalanceBeforeSwap(connection: Connection, quoteResponse: QuoteResponse, wallet_address: string) {
  // Check if this is a SOL input swap and verify balance
  if (quoteResponse.inputMint === "So11111111111111111111111111111111111111112") {
    const solBalance = await connection.getBalance(
      new PublicKey(wallet_address)
    );
    // For SOL input swaps, we need:
    // 1. The swap amount (inAmount)
    // 2. Transaction fee (~0.000005 SOL)
    // 3. Account rent if needed (~0.002 SOL)
    // 4. Priority fee (0.000001-0.001 SOL)
    const swapAmount = BigInt(quoteResponse.inAmount);
    const txFee = BigInt(5000); // 0.000005 SOL
    const accountRent = BigInt(2000000); // 0.002 SOL
    const priorityFee = BigInt(1000000); // 0.001 SOL max
    const requiredSol = swapAmount + txFee + accountRent + priorityFee;

    if (BigInt(solBalance) < requiredSol) {
      const requiredSolUI = Number(requiredSol) / LAMPORTS_PER_SOL;
      const currentSolUI = solBalance / LAMPORTS_PER_SOL;
      throw new Error(
        `Insufficient SOL balance. Need ${requiredSolUI.toFixed(
          6
        )} SOL (including fees), ` + `have ${currentSolUI.toFixed(6)} SOL`
      );
    }
  } else {
    // For non-SOL input swaps, we still need to check SOL for fees
    const solBalance = await connection.getBalance(
      new PublicKey(wallet_address)
    );
    // Need enough for:
    // 1. Transaction fee (~0.000005 SOL)
    // 2. Account rent if needed (~0.002 SOL)
    // 3. Priority fee (0.000001-0.001 SOL)
    const txFee = BigInt(5000); // 0.000005 SOL
    const accountRent = BigInt(2000000); // 0.002 SOL
    const priorityFee = BigInt(1000000); // 0.001 SOL max
    const requiredFees = txFee + accountRent + priorityFee;

    if (BigInt(solBalance) < requiredFees) {
      const requiredFeesUI = Number(requiredFees) / LAMPORTS_PER_SOL;
      const currentSolUI = solBalance / LAMPORTS_PER_SOL;
      throw new Error(
        `Insufficient SOL for transaction fees. Need ${requiredFeesUI.toFixed(
          6
        )} SOL, ` + `have ${currentSolUI.toFixed(6)} SOL`
      );
    }
  }
}

export async function executeJupiterSwap(
  connection: Connection,
  wallet:  ConnectedSolanaWallet,
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 100,
  sendWithConnection: boolean = true,
): Promise<string> {
  try {
    if (!wallet?.address) {
      throw new Error("Wallet not connected");
    }
    console.log("executeJupiterSwap using wallet:", wallet.address);

    // Get the platform fee bps, 0.8% -> 80 bps
    const platformFeeBps = Number(process.env.NEXT_PUBLIC_SWAP_TRANSACTION_FEE_RATE || 0) * 10000;
    const quoteResponse = await getJupiterQuote(inputMint, outputMint, amount, slippageBps, platformFeeBps);

    return await executeJupiterSwapWithQuote(connection, wallet, quoteResponse, sendWithConnection);
  } catch (error) {
    console.error("Jupiter swap failed:", error);
    throw error;
  }
}

export async function executeJupiterSwapWithQuote(
  connection: Connection,
  wallet:  ConnectedSolanaWallet,
  quoteResponse: QuoteResponse,
  sendWithConnection: boolean = true,
): Promise<string> {
  try {
    if (!wallet?.address) {
      throw new Error("Wallet not connected");
    }
    console.log("executeJupiterSwapWithQuote using wallet:", wallet.address);

    await checkBalanceBeforeSwap(connection, quoteResponse, wallet.address);

    let feeAccount;
    if (process.env.NEXT_PUBLIC_REFERRAL_KEY && process.env.NEXT_PUBLIC_SWAP_TRANSACTION_FEE_RATE) {
      const referralAccount = new PublicKey(process.env.NEXT_PUBLIC_REFERRAL_KEY || '');
      let mintAccount;
      if (quoteResponse.inputMint !== YZY_TOKEN.mint.toString()) {
        mintAccount = new PublicKey(quoteResponse.inputMint);
      } else {
        mintAccount = new PublicKey(quoteResponse.outputMint);
      }
      
      const feeAccounts = PublicKey.findProgramAddressSync(
        [
            Buffer.from("referral_ata"), // A string that signifies the account type, here "referral_ata."
            referralAccount.toBuffer(), //  The public key of the referral account converted into a buffer.
            mintAccount.toBuffer(), // The mint public key, converted into a buffer.
        ],
        new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3") // The public key of the Referral Program
      );
      feeAccount = feeAccounts[0].toBase58();
      console.log("feeAccount: ", feeAccount);
    }

    const swapResponse = await getJupiterSwapResponse(quoteResponse, wallet.address, feeAccount);
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    console.log("transaction", transaction);
    console.log("Transaction length:", Buffer.byteLength(swapTransactionBuf), "bytes");

    let signature;
    if (sendWithConnection) {
      const signed = await wallet.signTransaction(transaction);
      signature = await connection.sendRawTransaction(signed.serialize(), {
        maxRetries: 3,
        skipPreflight: false,
      });
    } else {
      const signed = await wallet.signTransaction(transaction);
      signature = await connection.sendRawTransaction(signed.serialize(), {
        maxRetries: 3,
        skipPreflight: false,
      });
    }
    console.log(signature);

    const confirmation = await confirmTransaction(
      connection,
      {
        signature,
        blockhash: transaction.message.recentBlockhash,
        lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(`Swap failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    console.log("Swap successful:", signature);
    return signature;
  } catch (error) {
    console.error("Jupiter swap failed:", error);
    throw error;
  }
}