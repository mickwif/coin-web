
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export type TransactionOrVersionedTransaction<S extends SupportedTransactionVersions> = S extends null | undefined
    ? Transaction
    : Transaction | VersionedTransaction;

export function isVersionedTransaction(
    transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
    return 'version' in transaction;
}


export enum Chain {
  Solana = "solana",
  Ethereum = "ethereum",
}

export enum WalletType {
  EOA = "eoa",
  MPC = "mpc",
}

export enum Custody {
  User = "user",
  Platform = "platform",
}

export enum SocialType {
  Email = "Email",
  Google = "Google",
  Twitter = "Twitter",
}

export type Social = {
  [key in SocialType]: string;
};

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  address: string;
  publicKey: string;
  chain: Chain;
  type: WalletType;
  custody: Custody;
  createdAt: string;
  updatedAt: string;
}

export interface WalletInfo {
  id: string;
  share: string;
  address: string;
  social_links: Social[];
}


export interface SignRequest {
  address: string;
  userId: string;
  message: string;
  network: string;
  requestId: string;
}

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  name: string;
}

export interface SignMessageResponse {
  signature: string;
}

export interface SignTransactionResponse {
  signature: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
