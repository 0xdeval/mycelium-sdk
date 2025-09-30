export type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';
export type { EmbeddedWallet } from '@/wallet/base/wallets/EmbeddedWallet';
export type { WalletNamespace } from '@/wallet/WalletNamespace';
export type { ChainManager } from '@/tools/ChainManager';
export type { TokenBalance } from '@/types/token';
export type { VaultTransactionResult, VaultBalance } from '@/types/protocols/beefy';

import { ChainManager } from '@/tools/ChainManager';
import type { SmartWalletProvider } from '@/wallet/base/providers/SmartWalletProvider';
import { WalletNamespace } from '@/wallet/WalletNamespace';
import { type MyceliumSDKConfig } from '@/types/sdk';
import { base } from 'viem/chains';
import { DefaultSmartWalletProvider } from '@/wallet/providers/DefaultSmartWalletProvider';
import { WalletProvider } from '@/wallet/WalletProvider';
import type { EmbeddedWalletProvider } from '@/wallet/base/providers/EmbeddedWalletProvider';
import { PrivyEmbeddedWalletProvider } from './wallet/providers/PrivyEmbeddedWalletProvider';
import { PrivyClient } from '@privy-io/server-auth';
import { ProtocolRouter } from '@/router/ProtocolRouter';
import type { Protocol } from '@/types/protocols/general';
import { logger } from '@/tools/Logger';

export { BeefyProtocol } from './protocols/implementations/BeefyProtocol';

export class MyceliumSDK {
  public readonly wallet: WalletNamespace;
  private _chainManager: ChainManager;
  private embeddedWalletProvider!: EmbeddedWalletProvider;
  private smartWalletProvider!: SmartWalletProvider;
  private protocol: Protocol;

  constructor(config: MyceliumSDKConfig) {
    this._chainManager = new ChainManager(
      config.chain || {
        chainId: base.id,
        rpcUrl: base.rpcUrls.default.http[0],
        bundlerUrl: 'https://public.pimlico.io/v2/8453/rpc',
      },
    );

    if (!config.chain) {
      logger.warn(
        'No chain config provided, using default public RPC and Bundler URLs',
        'MyceliumSDK',
      );
    }

    const protocolsRouterConfig = config.protocolsRouterConfig || {
      riskLevel: 'medium',
    };

    // protocolsRouterConfig is the abstract settings that are clear for a dev, e.g. risk level, basic apy, etc
    this.protocol = this.findProtocol(protocolsRouterConfig);

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
   * Find a protocol instance that was recommended by the smart router based on the given config
   * @description Find a protocol instance that was recommended by the smart router based on the given config
   * @param config Return a protocol provider instance that was recommended by the smart router based on the given config
   */
  private findProtocol(config: MyceliumSDKConfig['protocolsRouterConfig']): Protocol {
    // 1. Create a smart router with the given config
    // 2. Smart router will fetch available protocols
    // 3. Smart router will find the best protocol based on the given config
    // 4. Smart router should somehow save selected protocols here for future use of this particular integrator
    // 5. Smart router will return the best protocol here

    const protocolRouter = new ProtocolRouter(config!, this.chainManager);

    const protocol: Protocol = protocolRouter.recommend();

    // Right now we have a protocol instance to manage a protocol instance + all protocol info

    // Initialize the selected protocol
    protocol.instance.init(this.chainManager);

    return protocol;
  }

  /**
   * Create the wallet provider instance
   * @param config - Wallet configuration
   * @returns WalletProvider instance
   */
  private createWalletProvider(config: MyceliumSDKConfig['walletsConfig']) {
    if (config.embeddedWalletConfig.provider.type === 'privy') {
      const privyClient = new PrivyClient(
        config.embeddedWalletConfig.provider.providerConfig.appId,
        config.embeddedWalletConfig.provider.providerConfig.appSecret,
      );

      this.embeddedWalletProvider = new PrivyEmbeddedWalletProvider(
        privyClient,
        this._chainManager,
      );
    } else {
      throw new Error(
        `Unsupported embedded wallet provider: ${config.embeddedWalletConfig.provider.type}`,
      );
    }

    if (!config.smartWalletConfig || config.smartWalletConfig.provider.type === 'default') {
      this.smartWalletProvider = new DefaultSmartWalletProvider(this.chainManager, this.protocol);
    } else {
      throw new Error(
        `Unsupported smart wallet provider: ${config.smartWalletConfig.provider.type}`,
      );
    }

    const walletProvider = new WalletProvider(
      this.embeddedWalletProvider,
      this.smartWalletProvider,
    );

    return walletProvider;
  }

  /**
   * Create the wallet namespace instance
   * @param config - Wallet configuration
   * @returns WalletNamespace instance
   */
  private createWalletNamespace(config: MyceliumSDKConfig['walletsConfig']) {
    const walletProvider = this.createWalletProvider(config);
    return new WalletNamespace(walletProvider);
  }
}

export default MyceliumSDK;
