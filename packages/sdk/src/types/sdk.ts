import type { ChainConfig } from '@/types/chain';
import type { ProtocolsRouterConfig } from '@/types/protocols/general';

/**
 * Mycelium SDK configuration
 * @description Configuration object for initializing the Mycelium SDK
 * @example
 * ```ts
 * {
 *   walletsConfig: {
 *     embeddedWalletConfig: {
 *       provider: {
 *         type: 'privy',
 *         providerConfig: {
 *           appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
 *           appSecret: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!,
 *         },
 *       },
 *     },
 *     smartWalletConfig: {
 *       provider: {
 *         type: 'default',
 *       },
 *     },
 *   },
 *   chain: {
 *     chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
 *     rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
 *     bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
 *   },
 *   protocolsRouterConfig: {
 *     riskLevel: 'low',
 *   },
 * }
 * ```
 */
export interface MyceliumSDKConfig {
  /**
   * Wallet configuration
   * @remarks
   * Settings for embedded wallets and smart account providers. Currently support only Privy provider with their API keys
   * */
  walletsConfig: WalletConfig;
  /**
   * Chains to use for the SDK
   * @remarks
   * If no rpcUrl, bundlerUrl and chain id are not provided, the SDK will use Base chain by default and its public RPC and Bundler URLs
   * */
  chain?: ChainConfig;
  /**
   * Protocols router configuration with different protocol based params
   * @remarks
   * If an integrator is not provided any requirements, `low` risk level protocols will be used by default
   */
  protocolsRouterConfig?: ProtocolsRouterConfig;
}

/**
 * Wallet configuration
 * @description Configuration for wallet providers
 */
export type WalletConfig = {
  /** Embedded wallet configuration */
  embeddedWalletConfig: EmbeddedWalletConfig;
  /** Smart wallet configuration for ERC-4337 infrastructure */
  smartWalletConfig: SmartWalletConfig;
};

/**
 * Embedded wallet configuration
 * @description Configuration for embedded wallets / signers
 */
export interface EmbeddedWalletConfig {
  /** Wallet provider for account creation, management, and signing */
  provider: EmbeddedWalletProviderConfig;
}

/**
 * Smart Wallet configuration
 * @description Configuration for ERC-4337 smart wallets.
 */
export interface SmartWalletConfig {
  /** Wallet provider for smart wallet management */
  provider: SmartWalletProvider;
}

/**
 * Smart wallet provider configurations
 * @description Union type supporting multiple wallet provider implementations
 */
export type SmartWalletProvider = DefaultSmartWalletProvider;

/**
 * Default smart wallet provider configuration
 * @description Built-in provider smart wallet provider.
 */
export interface DefaultSmartWalletProvider {
  type: 'default';
}

/**
 * Embedded wallet provider configurations
 * @description Union type supporting multiple embedded wallet providers
 */
export type EmbeddedWalletProviderConfig = PrivyEmbeddedWalletProviderConfig;

/** Privy embedded wallet provider configuration */
export interface PrivyEmbeddedWalletProviderConfig {
  /** Embedded wallet provider type */
  type: 'privy';
  /** Privy client provider config */
  providerConfig: {
    /** Privy params */
    appId: string;
    /** Privy party app secret */
    appSecret: string;
  };
}
