import { Connection } from "@solana/web3.js";

interface ConfirmTransactionOptions {
  signature: string;
  lastValidBlockHeight: number;
  [key: string]: any; // we don't care about the rest
}

export const confirmTransaction = (connection: Connection, options: ConfirmTransactionOptions, commitment: "confirmed" | "finalized") => {
  let done = false;
  const txConfirmationPromise = new Promise(resolve => {
    const interval = setInterval(async () => {
      if(done) {
        clearInterval(interval);
        return;
      }
      const tx = await connection.getTransaction(options.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      if(tx) {
        clearInterval(interval);
        done = true;
        if(tx.meta?.err) {
          resolve({
            value: {
              err: tx.meta?.err
            }
          });
        } else {
          resolve({
            value: tx
          });
        }
      }
    }, 1000);
  });

  const blockExceededPromise = new Promise(resolve => {
    const interval = setInterval(async () => {
      if(done) {
        clearInterval(interval);
        return;
      }
      const block = await connection.getBlockHeight();
      if(block > options.lastValidBlockHeight) {
        clearInterval(interval);
        done = true;
        resolve({
          value: {
            err: "BLOCK_EXCEEDED"
          }
        });
      }
    }, 1000);
  });

  return Promise.race([txConfirmationPromise, blockExceededPromise]) as Promise<{ value: any }>;
};