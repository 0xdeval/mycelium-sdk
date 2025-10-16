import { type Chain, createPublicClient, http, type PublicClient } from 'viem';
import {
  type BundlerClient,
  type SmartAccount,
  createBundlerClient,
} from 'viem/account-abstraction';

import { type SUPPORTED_CHAIN_IDS, type SupportedChainId, CHAINS_MAP } from '@/constants/chains';
import type { ChainConfig } from '@/types/chain';
import { chainById } from '@/utils/chains';
import { logger } from '@/tools/Logger';

/**
 * Service for managing supported blockchain networks and their clients
 *
 * @internal
 * @category Infrastructure
 * @remarks
 * Provides RPC and bundler URL access, creates {@link PublicClient} and {@link BundlerClient} instances
 * Central point for chain-level configuration in the SDK
 */
export class ChainManager {
  /** Public client for the configured chain */
  private publicClient: PublicClient;
  /** Chain configuration */
  private chainConfigs: ChainConfig;
  /** Map of chain names to chain metadata */
  private chainNames: Record<string, Chain>;

  /**
   * Initializes the chain manager with the given configuration
   *
   * @internal
   * @param chains Configuration object for a supported chain
   */
  constructor(chains: ChainConfig) {
    this.chainConfigs = chains;
    this.publicClient = this.createPublicClient(chains);
    this.chainNames = CHAINS_MAP;
  }

  /**
   * Utility to validate if a string is a valid HTTP(S) URL
   *
   * @internal
   * @param url Candidate URL
   * @returns True if valid, false otherwise
   */
  private isValidUrl(url: string): boolean {
    return /^https?:\/\/.+$/.test(url);
  }

  /**
   * Returns a {@link PublicClient} for the given chain ID
   *
   * @internal
   * @category Clients
   * @param chainId Target chain ID
   * @returns {@link PublicClient} instance
   * @throws Error if client is not configured
   */
  getPublicClient(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): PublicClient {
    const client = this.publicClient;
    if (!client) {
      throw new Error(`No public client configured for chain ID: ${chainId}`);
    }
    return client;
  }

  /**
   * Returns a {@link BundlerClient} for the given chain ID
   *
   * @internal
   * @category Clients
   * @param chainId Target chain ID
   * @param account SmartAccount to bind to the bundler client
   * @returns {@link BundlerClient} instance
   * @throws Error if no bundler URL is configured
   */
  getBundlerClient(
    chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
    account: SmartAccount,
  ): BundlerClient {
    const rpcUrl = this.getRpcUrl(chainId);
    const bundlerUrl = this.getBundlerUrl(chainId);
    if (!bundlerUrl) {
      throw new Error(`No bundler URL configured for chain ID: ${chainId}`);
    }

    logger.info('Public client setup:', { bundlerUrl, chainId }, 'ChainManager');
    const client = createPublicClient({
      chain: this.getChain(chainId),
      transport: http(rpcUrl),
    });

    return createBundlerClient({
      account,
      client,
      transport: http(bundlerUrl),
      chain: this.getChain(chainId),
    });
  }

  /**
   * Returns the RPC URL for the given chain ID
   *
   * @internal
   * @category URLs
   * @param chainId Target chain ID
   * @returns RPC URL string
   * @throws Error if chain config is missing or URL is invalid
   */
  getRpcUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): string {
    const chainConfig = this.chainConfigs;
    if (!chainConfig) {
      throw new Error(`No chain config found for chain ID: ${chainId}`);
    }

    if (!this.isValidUrl(chainConfig.rpcUrl)) {
      throw new Error(`Invalid RPC URL for chain ID: ${chainId}`);
    }

    return chainConfig.rpcUrl;
  }

  /**
   * Returns the bundler URL for the given chain ID
   *
   * @internal
   * @category URLs
   * @param chainId Target chain ID
   * @returns Bundler URL string
   * @throws Error if chain config is missing or URL is invalid
   */
  getBundlerUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): string | undefined {
    const chainConfig = this.chainConfigs;
    if (!chainConfig) {
      throw new Error(`No chain config found for chain ID: ${chainId}`);
    }

    if (!this.isValidUrl(chainConfig.bundlerUrl)) {
      throw new Error(`Invalid bundler URL for chain ID: ${chainId}`);
    }
    return chainConfig.bundlerUrl;
  }

  /**
   * Returns the {@link Chain} object for the given chain ID
   *
   * @internal
   * @category Info
   * @param chainId Target chain ID
   * @returns Chain metadata
   * @throws Error if chain is not found
   */
  getChain(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): Chain {
    const chain = chainById[chainId];
    if (!chain) {
      throw new Error(`Chain not found for ID: ${chainId}`);
    }
    return chain;
  }

  /**
   * Returns the currently configured supported chain ID
   *
   * @internal
   * @category Info
   * @returns Supported chain ID
   */
  getSupportedChain() {
    return this.chainConfigs.chainId;
  }

  /**
   * Creates a {@link PublicClient} for a chain
   *
   * @internal
   * @category Clients
   * @param chain Chain configuration
   * @returns PublicClient instance
   */
  private createPublicClient(chain: ChainConfig): PublicClient {
    const chainObject = chainById[chain.chainId];

    const client = createPublicClient({
      chain: chainObject,
      transport: http(chain.rpcUrl),
    });

    return client;
  }

  // TODO: Refactor this code. ChainManager should work with string, not array
  /**
   * Returns a supported chain that was initiated in SDK
   *
   * @internal
   * @category Info
   * @param name Name of the chain
   * @returns Chain ID
   * @throws Error if chain is not found
   */
  getChainIdByName(name: string): SupportedChainId {
    // TODO: strange case
    if (name === 'ethereum') {
      // @ts-ignore
      return this.chainNames['mainnet'].id;
    }
    const chain = this.chainNames[name];
    if (!chain) {
      throw new Error(`Chain not found for name: ${name}`);
    }
    return chain.id;
  }

  /**
   * Returns the name of the chain for the given chain ID
   *
   * @internal
   * @category Info
   * @param chainId Target chain ID
   * @returns Chain name
   * @throws Error if chain is not found
   */
  getChainNameById(chainId: SupportedChainId): string {
    const chain = this.chainNames[chainId];
    if (!chain) {
      throw new Error(`Chain not found for ID: ${chainId}`);
    }
    return chain.name;
  }

  /**
   * Returns all supported chain names
   *
   * @internal
   * @category Info
   * @returns Array of supported chain names
   */
  getSupportedChainNames(): string[] {
    return Object.keys(this.chainNames);
  }

  /**
   * Returns whether the given chain name is supported
   *
   * @internal
   * @category Info
   * @param chainName Name of the chain
   * @returns True if supported
   */
  isChainSupported(chainName: string): boolean {
    return chainName in this.chainNames;
  }
}
