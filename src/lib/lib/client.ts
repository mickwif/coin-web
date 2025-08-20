import axios, { AxiosInstance } from 'axios';
import {
  Chain,
  Wallet,
  WalletType,
  Custody,
  UserSession,
  Social,
  SocialType,
  WalletInfo,
  SignRequest,
  TransactionOrVersionedTransaction,
  SupportedTransactionVersions,
  isVersionedTransaction,
} from './types';
import { Storage } from './storage';
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { modalManager } from './modal';
import bs58 from 'bs58';

interface SolanaCluster {
  name: 'mainnet-beta' | 'devnet';
  rpcUrl: string;
}

export interface WalletProviderConfig {
  baseURL: string;
  solanaCluster: SolanaCluster;
}

export class WalletClient {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private social: Social | null = null;
  private selectedWalletId: string | null = null;
  private connection: Connection | null = null;
  private solanaCluster: SolanaCluster;
  private walletInfo: WalletInfo | null = null;

  constructor(config: WalletProviderConfig) {
    this.solanaCluster = config.solanaCluster;
    this.api = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // this.api.interceptors.request.use((config) => {
    //   if (this.accessToken) {
    //     //@ts-ignore
    //     config.headers = {
    //       ...config.headers,
    //       Authorization: `Bearer ${this.accessToken}`,
    //     };
    //   }
    //   return config;
    // });

    this.connection = new Connection(config.solanaCluster.rpcUrl);
  }

  private setAccessToken(token: string, social: Social) {
    this.accessToken = token;
    this.social = social;
    Storage.saveAccessToken(token, social);
  }

  private setWallet(wallet: WalletInfo | null) {
    this.walletInfo = wallet;
  }

  private getAccessToken(): string | null {
    return this.accessToken || Storage.getAccessToken();
  }

  private getSocial(): Social | null {
    return this.social || Storage.getSocial();
  }

  private getSolanaCluster(): SolanaCluster {
    return this.solanaCluster;
  }

  getWallet(): WalletInfo | null {
    return this.walletInfo;
  }

  get address(): string | null {
    return this.walletInfo?.address || null;
  }

  get id(): string | null {
    return this.walletInfo?.id || null;
  }

  get social_links(): Social[] | null {
    return this.walletInfo?.social_links || null;
  }

  async reconnect(): Promise<WalletInfo | null> {
    //TODO check if cookie exists, or we need to call reconnect every time when page reload
    try {
      const wallet = await this.getSession();
      this.setWallet(wallet);
      return wallet;
    } catch (error) {
      // Storage.clear();
      return null;
    }
  }

  disconnect() {
    this.accessToken = null;
    this.selectedWalletId = null;
    Storage.clear();
  }

  async signMessage(message: string): Promise<string> {
    try {
      if (!this.walletInfo) {
        throw new Error('No wallet info');
      }
      const signRequest: SignRequest = {
        userId: this.walletInfo.id,
        address: this.walletInfo.address,
        message: bs58.encode(new TextEncoder().encode(message)),
        network: 'Solana',
        requestId: Math.random().toString(36).substring(7), // Generate a random ID
      };
      const response = await this.api.post<{ signature: string }>(
        `/sign`,
        signRequest,
        {
          withCredentials: true,
        }
      );
      const { signature } = response.data;
      return signature;
      // return response.data.data.signature;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to sign message'
      );
    }
  }

  async signTransaction(
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> {
    try {
      if (!this.walletInfo) {
        throw new Error('No wallet info');
      }
      if (!this.connection) {
        throw new Error('No rpc connection');
      }

      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();
      if (isVersionedTransaction(transaction)) {
        transaction.message.recentBlockhash = blockhash;
      } else {
        transaction.recentBlockhash = blockhash;
      }

      const signRequest: SignRequest = {
        userId: this.walletInfo.id,
        address: this.walletInfo.address,
        message: bs58.encode(
          isVersionedTransaction(transaction)
            ? transaction.message.serialize()
            : transaction.serializeMessage()
        ),
        network: 'Solana',
        requestId: Math.random().toString(36).substring(7), // Generate a random ID
      };
      const response = await this.api.post<{ signature: string }>(
        `/sign`,
        signRequest,
        {
          withCredentials: true,
        }
      );
      const { signature } = response.data;

      // Add the signature to the transaction
      transaction.addSignature(
        new PublicKey(this.walletInfo.address),
        Buffer.from(bs58.decode(signature))
      );

      // Return the fully signed and serialized transaction
      return transaction;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to sign transaction'
      );
    }
  }

  async sendTransaction(transaction: Uint8Array): Promise<string> {
    if (!this.connection) {
      throw new Error('No rpc connection');
    }

    try {
      const signature = await this.connection.sendRawTransaction(transaction, {
        maxRetries: 3,
        skipPreflight: false,
      });
      return signature;
    } catch (error) {
      throw error;
    }
  }

  async getWallets(): Promise<Wallet[]> {
    try {
      const response = await this.api.get<{ data: Wallet[] }>('/wallets');
      return response.data.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get wallets'
      );
    }
  }

  async sendEmailVerificationCode(email: string) {
    await this.api.post('/send_verification', {
      email,
    });
  }

  async verifyEmailVerificationCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<WalletInfo | null> {
    const data = {
      type: 'Email',
      data: {
        network: 'Solana',
        email,
        code,
      },
    };
    const response = await this.api.post('/login', data, {
      withCredentials: true,
    });
    const wallet = response.data;
    this.setWallet(wallet);
    return wallet;
  }

  async twitterLogin(params: {
    code: string;
    redirect_uri: string;
    code_verifier: string | null;
  }): Promise<WalletInfo | null> {
    const data = {
      type: 'TwitterOAuth',
      data: {
        network: 'Solana',
        ...params,
      },
    };
    const response = await this.api.post('/login', data, {
      withCredentials: true,
    });

    const wallet = response.data;
    this.setWallet(wallet);
    return wallet;
  }

  async googleLogin(params: {
    code: string;
    redirect_uri: string;
  }): Promise<WalletInfo | null> {
    const data = {
      type: 'GoogleOAuth',
      data: {
        network: 'Solana',
        ...params,
      },
    };
    const response = await this.api.post('/login', data, {
      withCredentials: true,
    });

    const wallet = response.data;
    this.setWallet(wallet);
    return wallet;
  }

  async getSession(): Promise<WalletInfo> {
    const response = await this.api.get('/session', {
      withCredentials: true,
    });
    return response.data;
  }

  async logout() {
    await this.api.post('/logout', {}, { withCredentials: true });
    this.setWallet(null);
  }

  async getOAuth2ClientId(provider: string): Promise<string> {
    const response = await this.api.get(`/oauth_id/${provider}`);
    return response.data.client_id;
  }

  setSelectedWallet(walletId: string) {
    this.selectedWalletId = walletId;
  }

  getSelectedWallet(): string | null {
    return this.selectedWalletId;
  }
}
