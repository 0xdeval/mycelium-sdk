import { type Chain, createPublicClient, http, type PublicClient } from 'viem';
import {
  type BundlerClient,
  type SmartAccount,
  createBundlerClient,
} from 'viem/account-abstraction';

import { type SUPPORTED_CHAIN_IDS, type SupportedChainId, CHAINS_MAP } from '@/constants/chains';
import type { ChainConfig } from '@/types/chain';
import { chainById } from '@/utils/chains';

/**
 * Chain Manager Service
 * @description Manages public clients and chain infrastructure for the Verbs SDK.
 * Provides utilities for accessing RPC and bundler URLs, and creating clients for supported chains.
 */
export class ChainManager {
  /** Map of chain IDs to their corresponding public clients */
  private publicClient: PublicClient;
  /** Configuration for each supported chain */
  private chainConfigs: ChainConfig;
  /** Map of chain names to their corresponding chain IDs */
  private chainNames: Record<string, Chain>;

  /**
   * Initialize the ChainManager with chain configurations
   * @param chains - Array of chain configurations
   */
  constructor(chains: ChainConfig) {
    this.chainConfigs = chains;
    this.publicClient = this.createPublicClient(chains);
    this.chainNames = CHAINS_MAP;
  }

  /**
   * Get public client for a specific chain
   * @param chainId - The chain ID to retrieve the public client for
   * @returns PublicClient instance for the specified chain
   * @throws Error if no client is configured for the chain ID
   */
  getPublicClient(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): PublicClient {
    const client = this.publicClient;
    if (!client) {
      throw new Error(`No public client configured for chain ID: ${chainId}`);
    }
    return client;
  }

  /**
   * Get bundler client for a specific chain
   * @param chainId - The chain ID to retrieve the bundler client for
   * @param account - SmartAccount to use with the bundler client
   * @returns BundlerClient instance for the specified chain
   * @throws Error if no bundler URL is configured for the chain ID
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

    console.log('Public client setup:', { bundlerUrl, chainId });
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
   * Get RPC URL for a specific chain
   * @param chainId - The chain ID to retrieve the RPC URL for
   * @returns RPC URL as a string
   * @throws Error if no chain config is found for the chain ID
   */
  getRpcUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): string {
    const chainConfig = this.chainConfigs;
    if (!chainConfig) {
      throw new Error(`No chain config found for chain ID: ${chainId}`);
    }
    return chainConfig.rpcUrl;
  }

  /**
   * Get bundler URL for a specific chain
   * @param chainId - The chain ID to retrieve the bundler URL for
   * @returns Bundler URL as a string or undefined if not configured
   * @throws Error if no chain config is found for the chain ID
   */
  getBundlerUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): string | undefined {
    const chainConfig = this.chainConfigs;
    if (!chainConfig) {
      throw new Error(`No chain config found for chain ID: ${chainId}`);
    }
    return chainConfig.bundlerUrl;
  }

  /**
   * Get chain information for a specific chain ID
   * @param chainId - The chain ID to retrieve information for
   * @returns Chain object containing chain details
   */
  getChain(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]): Chain {
    const chain = chainById[chainId];
    if (!chain) {
      throw new Error(`Chain not found for ID: ${chainId}`);
    }
    return chain;
  }

  /**
   * Get all supported chain IDs
   * @returns Array of supported chain IDs
   */
  getSupportedChain() {
    return this.chainConfigs.chainId;
  }

  /**
   * Create public clients for all configured chains
   * @param chains - Array of chain configurations
   * @returns Map of chain IDs to their corresponding public clients
   * @throws Error if a chain is not found or already configured
   */
  private createPublicClient(chain: ChainConfig): PublicClient {
    const chainObject = chainById[chain.chainId];

    const client = createPublicClient({
      chain: chainObject,
      transport: http(chain.rpcUrl),
    });

    return client;
  }

  /**
   * Get chain ID by name
   * @param name - Chain name to get the ID for
   * @returns Chain ID
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
   * Get all supported chain names
   * @returns Array of supported chain names
   */
  getSupportedChainNames(): string[] {
    return Object.keys(this.chainNames);
  }

  /**
   * Check if chain is supported
   * @param chainName - Chain name to check
   * @returns True if chain is supported
   */
  isChainSupported(chainName: string): boolean {
    return chainName in this.chainNames;
  }
}
