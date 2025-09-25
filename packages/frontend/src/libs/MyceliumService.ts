import type { WalletRecord } from './WalletDatabase';
import MyceliumSDK, {
  type SmartWallet,
  type VaultBalance,
  type VaultTransactionResult,
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
    console.log('=== MyceliumService.init() called ===');
    if (this.initialized) {
      return;
    }

    try {
      this.sdk = new MyceliumSDK({
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
          chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!) as any,
          rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
          bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
        },
        protocolsRouterConfig: {
          riskLevel: 'medium',
        },
      });
      // const protocol = (this.sdk as any).protocol;
      // if (protocol && protocol.instance) {
      //   await protocol.instance.init((this.sdk as any).chainManager);
      // }
      this.initialized = true;
      console.log('MyceliumService initialized');
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
    console.log('Embedded wallet ID: ', embeddedWalletId);

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

    console.log('all tokens info:', tokens);

    return tokens.map((token) => {
      return {
        symbol: token.symbol,
        formattedBalance: token.totalFormattedBalance,
      };
    });
  }

  async earn(walletId: string, amount: string): Promise<VaultTransactionResult> {
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

  async withdraw(walletId: string, amount: string): Promise<VaultTransactionResult> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId,
    });

    const transactionResult = await wallet.withdraw(amount);
    return transactionResult;
  }
}

export const myceliumService = MyceliumService.getInstance();
