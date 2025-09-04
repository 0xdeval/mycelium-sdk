export type { SmartWallet } from "@/wallet/base/wallets/SmartWallet";
export type { EmbeddedWallet } from "@/wallet/base/wallets/EmbeddedWallet";
export type { WalletNamespace } from "@/wallet/WalletNamespace";
export type { ChainManager } from "@/tools/ChainManager";
export type { TokenBalance } from "@/types/token";

import { ChainManager } from "@/tools/ChainManager";
import { SmartWalletProvider } from "@/wallet/base/providers/SmartWalletProvider";
import { WalletNamespace } from "@/wallet/WalletNamespace";
import { type MyceliumSDKConfig } from "@/types/sdk";
import { unichain } from "viem/chains";
import { DefaultSmartWalletProvider } from "@/wallet/providers/DefaultSmartWalletProvider";
import { WalletProvider } from "@/wallet/WalletProvider";
import type { EmbeddedWalletProvider } from "@/wallet/base/providers/EmbeddedWalletProvider";
import { PrivyEmbeddedWalletProvider } from "./wallet/providers/PrivyEmbeddedWalletProvider";
import { PrivyClient } from "@privy-io/server-auth";

export class MyceliumSDK {
  public readonly wallet: WalletNamespace;
  private _chainManager: ChainManager;
  // private lendProvider?: LendProvider;
  private embeddedWalletProvider!: EmbeddedWalletProvider;
  private smartWalletProvider!: SmartWalletProvider;

  constructor(config: MyceliumSDKConfig) {
    this._chainManager = new ChainManager(
      config.chains || [
        {
          chainId: unichain.id,
          rpcUrl: unichain.rpcUrls.default.http[0],
        },
      ]
    );

    this.wallet = this.createWalletNamespace(config.walletsConfig);
  }

  /**
   * Get the chain manager instance
   * @returns ChainManager instance for multi-chain operations
   */
  get chainManager(): ChainManager {
    return this._chainManager;
  }

  /**
   * Create the wallet provider instance
   * @param config - Wallet configuration
   * @returns WalletProvider instance
   */
  private createWalletProvider(config: MyceliumSDKConfig["walletsConfig"]) {
    if (config.embeddedWalletConfig.provider.type === "privy") {
      const privyClient = new PrivyClient(
        config.embeddedWalletConfig.provider.providerConfig.appId,
        config.embeddedWalletConfig.provider.providerConfig.appSecret
      );

      this.embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
        // config.embeddedWalletConfig.provider.privyClient,
        privyClient,
        this._chainManager
        // this.lendProvider!
      );
    } else {
      throw new Error(
        `Unsupported embedded wallet provider: ${config.embeddedWalletConfig.provider.type}`
      );
    }

    if (
      !config.smartWalletConfig ||
      config.smartWalletConfig.provider.type === "default"
    ) {
      this.smartWalletProvider = new DefaultSmartWalletProvider(
        this.chainManager
        // this.lend
      );
    } else {
      throw new Error(
        `Unsupported smart wallet provider: ${config.smartWalletConfig.provider.type}`
      );
    }

    const walletProvider = new WalletProvider(
      this.embeddedWalletProvider,
      this.smartWalletProvider
    );

    return walletProvider;
  }

  /**
   * Create the wallet namespace instance
   * @param config - Wallet configuration
   * @returns WalletNamespace instance
   */
  private createWalletNamespace(config: MyceliumSDKConfig["walletsConfig"]) {
    const walletProvider = this.createWalletProvider(config);
    return new WalletNamespace(walletProvider);
  }
}

export default MyceliumSDK;
