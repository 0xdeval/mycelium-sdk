import MyceliumSDK from "@mycelium-sdk/core";
import { sepolia } from "viem/chains";
import type { WalletRecord } from "./WalletDatabase";
import type { SmartWallet, TokenBalance } from "@mycelium-sdk/core";

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
    if (this.initialized) return;

    try {
      this.sdk = new MyceliumSDK({
        walletsConfig: {
          embeddedWalletConfig: {
            provider: {
              type: "privy",
              providerConfig: {
                appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
                appSecret: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!,
              },
            },
          },
          smartWalletConfig: {
            provider: {
              type: "default",
            },
          },
        },
        chains: [
          {
            chainId: sepolia.id,
            rpcUrl: sepolia.rpcUrls.default.http[0],
            bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
          },
        ],
      });

      this.initialized = true;
      console.log("MyceliumService initialized");
    } catch (error) {
      throw new Error(`Failed to initialize MyceliumService: ${error}`);
    }
  }

  async createWallet() {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    const embeddedWallet = await this.sdk.wallet.createEmbeddedWallet();
    const embeddedWalletId = embeddedWallet.walletId as string;
    console.log("Embedded wallet ID: ", embeddedWalletId);

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
      throw new Error("SDK not initialized");
    }

    const wallet = await this.sdk.wallet.getSmartWalletWithEmbeddedSigner({
      walletId: existingWallet.wallet_id,
    });

    return wallet;
  }

  async getWalletBalance(
    walletId: string
  ): Promise<{ symbol: string; formattedBalance: string }[]> {
    if (!this.sdk) {
      throw new Error("SDK not initialized");
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

  getSDK(): MyceliumSDK | null {
    return this.sdk;
  }
}

export const myceliumService = MyceliumService.getInstance();
