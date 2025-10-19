import type { WalletRecord } from '@/libs/WalletsDatabase';
import {
  MyceliumSDK,
  type OnRampUrlResponse,
  type SmartWallet,
  type VaultBalance,
  type VaultTxnResult,
} from '@mycelium-sdk/core';

export class MyceliumService {
  private static instance: MyceliumService;
  private sdk: MyceliumSDK | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): MyceliumService {
    if (!MyceliumService.instance) {
      MyceliumService.instance = new MyceliumService();
    }
    return MyceliumService.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.sdk = new MyceliumSDK({
        integratorId: process.env.NEXT_PUBLIC_INTEGRATOR_ID!,
        walletsConfig: {
          embeddedWalletConfig: {
            provider: {
              type: 'privy',
              providerConfig: {
                appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
                appSecret: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!,
              },
            },
          },
          smartWalletConfig: {
            provider: {
              type: 'default',
            },
          },
        },
        chain: {
          chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
          rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
          bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
        },
        protocolsRouterConfig: {
          riskLevel: 'low',
        },
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MyceliumService: ${error}`);
    }
  }

  async createWallet() {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    const embeddedWallet = await this.sdk.wallet.createEmbeddedWallet();
    const embeddedWalletId = embeddedWallet.walletId as string;

    const wallet = await this.sdk.wallet.createSmartWallet({
      owners: [embeddedWallet.address],
      signer: await embeddedWallet.account(),
    });

    return {
      walletId: embeddedWalletId,
      walletAddress: await wallet.getAddress(),
    };
  }

  async getWallet(existingWallet: WalletRecord): Promise<SmartWallet> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId: existingWallet.wallet_id,
    });

    return wallet;
  }

  async getWalletBalance(
    walletId: string,
  ): Promise<{ symbol: string; formattedBalance: string }[]> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const tokens = await wallet.getBalance();

    return tokens.map((token) => {
      return {
        symbol: token.symbol,
        formattedBalance: token.totalFormattedBalance,
      };
    });
  }

  async getOnRampLink(walletId: string): Promise<OnRampUrlResponse> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/onramp-success`;

    const onRampQuote: OnRampUrlResponse = await wallet.topUp('100', redirectUrl, 'USDC', 'USD');

    return onRampQuote;
  }

  async earn(walletId: string, amount: string): Promise<VaultTxnResult> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const transactionResult = await wallet.earn(amount);
    return transactionResult;
  }

  async getEarnBalance(walletId: string): Promise<VaultBalance | null> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const balance = await wallet.getEarnBalance();
    return balance;
  }

  async withdraw(walletId: string, amount: string): Promise<VaultTxnResult> {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const transactionResult = await wallet.withdraw(amount);
    return transactionResult;
  }
}

export const myceliumService = MyceliumService.getInstance();
