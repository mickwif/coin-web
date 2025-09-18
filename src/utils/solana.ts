import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Commitment,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction as createATAInstruction,
  getAssociatedTokenAddressSync as getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { YZY_TOKEN, SOLANA_RPC_URL, USDC_MINT, Token } from './constants';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { confirmTransaction } from './confirmation';
import { WalletClient } from 'yeezy-wallet-sdk';  ;

export const SOLSCAN_URL = 'https://solscan.io/tx';

const SOLANA_WSS_RPC_URLS =
  process.env.NEXT_PUBLIC_SOLANA_WSS_RPC_URLS?.split(',') || [];

// Connection configuration
const CONNECTION_CONFIG = {
  commitment: 'confirmed' as Commitment,
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
    const blockHashResult = await connection.getLatestBlockhash('confirmed');
    return {
      blockhash: blockHashResult.blockhash,
      lastValidBlockHeight: blockHashResult.lastValidBlockHeight
    };
  } catch (error) {
    console.error('Failed to get blockhash, retrying...', error);
    // Retry once with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const blockHashResult = await connection.getLatestBlockhash('confirmed');
    return {
      blockhash: blockHashResult.blockhash,
      lastValidBlockHeight: blockHashResult.lastValidBlockHeight
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
      const balance = await connection.getBalance(pubKey, 'confirmed');
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

  console.error('All SOL balance fetch attempts failed');
  throw lastError;
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
    const accountInfo = await connection.getAccountInfo(account, 'confirmed');
    const rentExempt = await connection.getMinimumBalanceForRentExemption(0);
    return {
      exists: accountInfo !== null,
      rentExempt,
    };
  } catch (error) {
    console.error('Error checking account:', error);
    return {
      exists: false,
      rentExempt: 0,
    };
  }
};

export const estimateTransactionFee = async (
  connection: Connection,
  fromWallet: ConnectedSolanaWallet,
  toAddress: string
) => {
  try {
    if (!fromWallet || !fromWallet.address) {
      throw new Error('Invalid wallet or wallet not connected');
    }

    const fromPublicKey = new PublicKey(fromWallet.address);
    if (!fromPublicKey) {
      throw new Error('Invalid wallet public key');
    }

    const toPublicKey = new PublicKey(toAddress);

    // Get token accounts
    const fromTokenAccount = getAssociatedTokenAddress(
      YZY_TOKEN.mint,
      fromPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = getAssociatedTokenAddress(
      YZY_TOKEN.mint,
      toPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check accounts and get rent (in parallel)
    const [fromAccountInfo, toAccountInfo] = await Promise.all([
      getAccountRentExempt(connection, fromTokenAccount),
      getAccountRentExempt(connection, toTokenAccount),
    ]);

    // Count required instructions
    let numInstructions = 1; // Start with 1 for the transfer instruction
    if (!fromAccountInfo.exists) numInstructions++;
    if (!toAccountInfo.exists) numInstructions++;

    // Calculate minimum required fee with higher compute units estimate
    const minFee = getMinimumTransactionFee(numInstructions);

    // Calculate rent fees if accounts need to be created
    const rentFees =
      (!fromAccountInfo.exists ? fromAccountInfo.rentExempt : 0) +
      (!toAccountInfo.exists ? toAccountInfo.rentExempt : 0);

    // Add 50% buffer for compute units and network fluctuation
    // const totalEstimatedFee = (minFee + rentFees) * 1.5;
    const totalEstimatedFee = minFee + rentFees;

    // Convert to SOL with minimum fee guarantee
    const estimatedFeeSOL = Math.max(
      totalEstimatedFee / LAMPORTS_PER_SOL,
      0.00002 // Minimum 20000 lamports
    );

    return Math.ceil(estimatedFeeSOL * 1000000) / 1000000; // Round up to 6 decimal places
  } catch (error) {
    console.error('Fee estimation error:', error);
    return 0.00002; // Return 20000 lamports as a safe default
  }
};

const sendTransactionWithRetry = async (connection: Connection, signed: Transaction | VersionedTransaction, fromWallet?: ConnectedSolanaWallet) => {
  let signature;

  if (fromWallet) {
    // Send without retries since we can retry through privy UI
    signature = await fromWallet.sendTransaction(signed, connection, {
      skipPreflight: false,
      maxRetries: 3,
      preflightCommitment: 'confirmed',
    });
    return signature;
  } else {
    // Send with retries
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
          preflightCommitment: "confirmed",
        });
        return signature;
      } catch (error) {
        if (attempt === 2) throw error;
        console.log(`Send attempt ${attempt + 1} failed, retrying...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * Math.pow(2, attempt))
        );
      } 
    }

    throw new Error('Failed to send transaction after retries');
  }
}

// Transfer SOL
export const transferSOL = async (
  connection: Connection,
  fromWallet: ConnectedSolanaWallet,
  toAddress: string,
  amount: number
) => {
  try {
    // Validate wallet first
    if (!fromWallet || !fromWallet.address) {
      throw new Error('Invalid wallet or wallet not connected');
    }

    const fromPublicKey = new PublicKey(fromWallet.address);
    if (!fromPublicKey) {
      throw new Error('Invalid wallet public key');
    }

    const toPublicKey = new PublicKey(toAddress);
    const toAccountInfo = await connection.getAccountInfo(toPublicKey);
    const isNewAccount = !toAccountInfo;

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await getBlockhashWithRetry(connection);

    const tempTx = new Transaction()
    tempTx.recentBlockhash = blockhash;
    tempTx.feePayer = fromPublicKey;
    const [balance, baseFee, rentExemption] = await Promise.all([
      getSOLBalance(connection, fromPublicKey.toString()),
      connection.getFeeForMessage(
        tempTx.compileMessage(),
        'confirmed'
      ),
      isNewAccount ? 
        connection.getMinimumBalanceForRentExemption(0) : 0
    ]);

    const totalCost = (
      amount + 
      ((baseFee.value??MIN_FEE_LAMPORTS) / LAMPORTS_PER_SOL) + 
      (rentExemption / LAMPORTS_PER_SOL)
    );

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
        lamports: Math.floor(amount * LAMPORTS_PER_SOL) + (isNewAccount? rentExemption:0),
      })
    );

    try {
      // Request signature from wallet
      const signed = await fromWallet.signTransaction(transaction);

      const signature = await sendTransactionWithRetry(connection, signed);

      console.log('Transaction sent:', signature);

      // Wait for confirmation
      const confirmation = await confirmTransaction(
        connection,
        {
          signature: signature!,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      if (confirmation.value.err) {
        console.error('Transaction failed:', confirmation.value.err);
        throw new Error(
          'Transaction failed: ' + JSON.stringify(confirmation.value.err)
        );
      }

      return signature;
    } catch (error: any) {
      console.error('Transaction error:', error);
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      // Add more detailed error information
      const errorMessage = error.logs
        ? `Transaction failed: ${error.message}\nLogs: ${JSON.stringify(
            error.logs,
            null,
            2
          )}`
        : error.message;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

// Transfer YZY tokens with versioned transactions
export const transferToken = async (
  connection: Connection,
  fromWallet: ConnectedSolanaWallet,
  toAddress: string,
  amount: number,
  token: Token
) => {
  try {
    if (!fromWallet || !fromWallet.address) {
      throw new Error('Invalid wallet or wallet not connected');
    }

    const fromPublicKey = new PublicKey(fromWallet.address);
    const toPublicKey = new PublicKey(toAddress);

    const tokenMint = new PublicKey(token.mint)

    // Get current SOL balance for fee check
    const solBalance = await getSOLBalance(
      connection,
      fromPublicKey.toString()
    );
    const estimatedFee = await estimateTransactionFee(
      connection,
      fromWallet,
      toAddress
    );

    if (solBalance < estimatedFee) {
      throw new Error(
        `Insufficient SOL for transaction fees. Need ${estimatedFee.toFixed(
          6
        )} SOL, but have ${solBalance.toFixed(6)} SOL`
      );
    }

    // Verify YZY balance first (using raw amount)
    const currentBalance = await getTokenBalance(
      connection,
      fromPublicKey.toString(),
      token.mint
    );
    const symbol = token.symbol;
    if (currentBalance < amount) {
      throw new Error(
        `Insufficient ${symbol} balance. Need ${amount.toFixed(
          3
        )} ${symbol}, but have ${currentBalance.toFixed(3)} ${symbol}`
      );
    }

    // Get token accounts
    const fromTokenAccount = getAssociatedTokenAddress(
      tokenMint,
      fromPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = getAssociatedTokenAddress(
      tokenMint,
      toPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check accounts (in parallel)
    const [fromAccount, toAccount] = await Promise.all([
      connection.getAccountInfo(fromTokenAccount),
      connection.getAccountInfo(toTokenAccount),
    ]);

    // Create instructions array
    const instructions = [];

    // Add ATA creation instructions if needed
    if (!fromAccount) {
      instructions.push(
        createATAInstruction(
          fromPublicKey,
          fromTokenAccount,
          fromPublicKey,
          tokenMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    if (!toAccount) {
      instructions.push(
        createATAInstruction(
          fromPublicKey,
          toTokenAccount,
          toPublicKey,
          tokenMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Add transfer instruction
    const transferAmount = Math.floor(
      amount * Math.pow(10, token.decimals)
    );
    instructions.push(
      createTransferCheckedInstruction(
        fromTokenAccount,
        tokenMint,
        toTokenAccount,
        fromPublicKey,
        BigInt(transferAmount),
        token.decimals
      )
    );

    // Get latest blockhash with retry
    const { blockhash, lastValidBlockHeight } = await getBlockhashWithRetry(connection);

    // Create versioned transaction
    const messageV0 = new TransactionMessage({
      payerKey: fromPublicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    let signature;
    try {
      // Sign transaction
      const signed = await fromWallet.signTransaction(transaction);

      signature = await sendTransactionWithRetry(connection, signed);

      if (!signature) {
        throw new Error('Failed to send transaction after retries');
      }

      // Wait for confirmation with timeout
      const confirmationPromise = confirmTransaction(
        connection,
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Transaction confirmation timeout')),
          30000
        )
      );

      const confirmation: any = await Promise.race([
        confirmationPromise,
        timeoutPromise,
      ]);

      if (confirmation?.value?.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      return signature;
    } catch (error: any) {
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

// Get YZY token balance with retries
export const getYZYBalance = async (
  connection: Connection,
  publicKey: string,
  maxRetries = 3
) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `Fetching YZY balance attempt ${attempt + 1} for ${publicKey}`
      );
      const pubKey = new PublicKey(publicKey);

      // Find all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKey,
        {
          mint: YZY_TOKEN.mint,
        },
        'confirmed'
      );

      // Log raw token accounts data for debugging
      // console.log(
      //   'Raw token accounts:',
      //   JSON.stringify(tokenAccounts, null, 2)
      // );

      // Sum up all YZY balances (in case there are multiple accounts)
      let totalBalance = 0;
      for (const { account } of tokenAccounts.value) {
        if (account.data.parsed.info.mint === YZY_TOKEN.mint.toString()) {
          const rawAmount = account.data.parsed.info.tokenAmount.amount;
          const decimals = account.data.parsed.info.tokenAmount.decimals;
          const uiAmount = Number(rawAmount) / Math.pow(10, decimals);
          console.log(
            `Found YZY balance in account: ${uiAmount} YZY (raw: ${rawAmount}, decimals: ${decimals})`
          );
          totalBalance += uiAmount;
        }
      }

      console.log(`Total YZY balance: ${totalBalance} YZY`);
      return totalBalance;
    } catch (error) {
      console.error(`YZY balance fetch attempt ${attempt + 1} failed:`, error);
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error('All YZY balance fetch attempts failed');
  throw lastError;
};

export const getUSDCBalance = async (
  connection: Connection,
  publicKey: string,
  maxRetries = 3
) => {
  return getTokenBalance(connection, publicKey, USDC_MINT.toString(), maxRetries);
};

export const getTokenBalance = async (
  connection: Connection,
  publicKey: string,
  tokenMint: string,
  maxRetries = 3
) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `Fetching ${tokenMint} balance attempt ${attempt + 1} for ${publicKey}`
      );
      const pubKey = new PublicKey(publicKey);
      const tokenMintKey = new PublicKey(tokenMint);
      // Find all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKey,
        {
          mint: tokenMintKey,
        },
        'confirmed'
      );

      // Log raw token accounts data for debugging
      console.log(
        'Raw token accounts:',
        JSON.stringify(tokenAccounts, null, 2)
      );

      // Sum up all YZY balances (in case there are multiple accounts)
      let totalBalance = 0;
      for (const { account } of tokenAccounts.value) {
        if (account.data.parsed.info.mint === tokenMintKey.toString()) {
          const rawAmount = account.data.parsed.info.tokenAmount.amount;
          const decimals = account.data.parsed.info.tokenAmount.decimals;
          const uiAmount = Number(rawAmount) / Math.pow(10, decimals);
          console.log(
            `Found ${tokenMint} balance in account: ${uiAmount} (raw: ${rawAmount}, decimals: ${decimals})`
          );
          totalBalance += uiAmount;
        }
      }

      console.log(`Total ${tokenMint} balance: ${totalBalance} ${tokenMint}`);
      return totalBalance;
    } catch (error) {
      console.error(
        `${tokenMint} balance fetch attempt ${attempt + 1} failed:`,
        error
      );
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error('All YZY balance fetch attempts failed');
  throw lastError;
};

export async function sendTransaction(
  wallet: ConnectedSolanaWallet, // Privy wallet object
  mint: PublicKey,
  recipient: PublicKey,
  amount: number
) {
  try {
    const connection = getConnection();
    const sender = new PublicKey(wallet.address);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: amount,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

    // Sign with Privy wallet
    const signedTx = await wallet.signTransaction(transaction);

    const signature = await sendTransactionWithRetry(connection, signedTx);

    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
export const isValidAddress = (address: string) => {
  const base58Regex = /^[A-HJ-NP-Za-km-z1-9]*$/;
  try {
    if(!address) return false;
    return base58Regex.test(address) && PublicKey.isOnCurve(new PublicKey(address).toBytes());
  } catch (e) {
    // console.log('Invalid address:', e);
    return false;
  }
};
