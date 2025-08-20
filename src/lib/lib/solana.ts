import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Commitment,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";

// const SOLANA_WSS_RPC_URLS = import.meta.env.VITE_SOLANA_WSS_RPC_URLS;
// const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL;

//TODO: get config
const SOLANA_WSS_RPC_URLS =
  process.env.NEXT_PUBLIC_SOLANA_WSS_RPC_URLS?.split(',') || [];
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

const CONNECTION_CONFIG = {
  commitment: "confirmed" as Commitment,
  confirmTransactionInitialTimeout: 60000,
  disableRetryOnRateLimit: false,
  wsEndpoint:
    SOLANA_WSS_RPC_URLS[Math.floor(Math.random() * SOLANA_WSS_RPC_URLS.length)],
};

// Get Solana connection with better configuration
export const getConnection = () => {
  const connection = new Connection(SOLANA_RPC_URL!, CONNECTION_CONFIG);

  // Test the connection
  // connection
  //   .getSlot()
  //   .then(() => console.log("RPC connection successful"))
  //   .catch((err) => console.error("RPC connection failed:", err));

  return connection;
};

const getBlockhashWithRetry = async (connection: Connection) => {
  try {
    const blockHashResult = await connection.getLatestBlockhash("confirmed");
    return {
      blockhash: blockHashResult.blockhash,
      lastValidBlockHeight: blockHashResult.lastValidBlockHeight,
    };
  } catch (error) {
    console.error("Failed to get blockhash, retrying...", error);
    // Retry once with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const blockHashResult = await connection.getLatestBlockhash("confirmed");
    return {
      blockhash: blockHashResult.blockhash,
      lastValidBlockHeight: blockHashResult.lastValidBlockHeight,
    };
  }
};

// Minimum fee in lamports (10000 lamports = 0.00001 SOL)
const MIN_FEE_LAMPORTS = 10000;

// Helper to get minimum transaction fee based on instruction count
const getMinimumTransactionFee = (numInstructions: number) => {
  const numSignatures = 1; // One for the payer
  const baseFee = numSignatures * MIN_FEE_LAMPORTS;
  const writeLockFee = (numInstructions + 1) * MIN_FEE_LAMPORTS; // +1 for fee payer
  const computeUnitsFee = 200000; // Estimate compute units for token operations
  return baseFee + writeLockFee + computeUnitsFee;
};

// Helper to check if an account exists and get rent
const getAccountRentExempt = async (
  connection: Connection,
  account: PublicKey
) => {
  try {
    const accountInfo = await connection.getAccountInfo(account, "confirmed");
    const rentExempt = await connection.getMinimumBalanceForRentExemption(0);
    return {
      exists: accountInfo !== null,
      rentExempt,
    };
  } catch (error) {
    console.error("Error checking account:", error);
    return {
      exists: false,
      rentExempt: 0,
    };
  }
};

// Get SOL balance with retries
export const getSOLBalance = async (
  connection: Connection,
  publicKey: string,
  maxRetries = 3
) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `Fetching SOL balance attempt ${attempt + 1} for ${publicKey}`
      );
      const pubKey = new PublicKey(publicKey);
      const balance = await connection.getBalance(pubKey, "confirmed");
      console.log(
        `SOL balance fetched successfully: ${balance / LAMPORTS_PER_SOL} SOL`
      );
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error(`SOL balance fetch attempt ${attempt + 1} failed:`, error);
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("All SOL balance fetch attempts failed");
  throw lastError;
};

export const getTransferSOLTx = async (
  fromWallet: string,
  toAddress: string,
  amount: number
) => {
  const fromPublicKey = new PublicKey(fromWallet);
  if (!fromPublicKey) {
    throw new Error("Invalid wallet public key");
  }
  const connection = getConnection();
  const toPublicKey = new PublicKey(toAddress);
  const toAccountInfo = await connection.getAccountInfo(toPublicKey);
  const isNewAccount = !toAccountInfo;

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await getBlockhashWithRetry(
    connection
  );

  const tempTx = new Transaction();
  tempTx.recentBlockhash = blockhash;
  tempTx.feePayer = fromPublicKey;
  const [balance, baseFee, rentExemption] = await Promise.all([
    getSOLBalance(connection, fromPublicKey.toString()),
    connection.getFeeForMessage(tempTx.compileMessage(), "confirmed"),
    isNewAccount ? connection.getMinimumBalanceForRentExemption(0) : 0,
  ]);

  const totalCost =
    amount +
    (baseFee.value ?? MIN_FEE_LAMPORTS) / LAMPORTS_PER_SOL +
    rentExemption / LAMPORTS_PER_SOL;

  if (balance < totalCost) {
    throw new Error(
      `Insufficient balance. Need ${totalCost.toFixed(
        4
      )} SOL (including fees), but have ${balance.toFixed(4)} SOL`
    );
  }

  // Create a simple transfer transaction
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPublicKey;

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports:
        Math.floor(amount * LAMPORTS_PER_SOL) +
        (isNewAccount ? rentExemption : 0),
    })
  );

  return transaction;
};
