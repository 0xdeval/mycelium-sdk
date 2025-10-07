import type { PrivyClient } from '@privy-io/server-auth';
import { getAddress } from 'viem';

import type { ChainManager } from '@/tools/ChainManager';
import { PrivyWallet } from '@/wallet/PrivyWallet';
import { EmbeddedWalletProvider } from '@/wallet/base/providers/EmbeddedWalletProvider';
import { logger } from '@/tools/Logger';

/**
 * Options for querying all Privy wallets
 *
 * @internal
 * @category Wallets
 */
export interface PrivyProviderGetAllWalletsOptions {
  /** Maximum number of wallets to return */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Embedded wallet provider backed by Privy
 *
 * @internal
 * @category Wallets
 * @remarks
 * Wraps Privy client API for creating, retrieving, and listing wallets
 * Produces {@link PrivyWallet} instances used internally by the SDK
 */
export class PrivyEmbeddedWalletProvider extends EmbeddedWalletProvider {
  /** Privy client instance */
  public privy: PrivyClient;
  /** Manager for supported chains and clients */
  private chainManager: ChainManager;
  /**
   * Creates a new Privy-backed embedded wallet provider
   *
   * @internal
   * @param privyClient Privy client instance
   * @param chainManager Chain and client manager
   */
  constructor(privyClient: PrivyClient, chainManager: ChainManager) {
    super();
    this.privy = privyClient;
    this.chainManager = chainManager;
  }

  /**
   * Creates a new wallet using Privy’s wallet API
   *
   * @internal
   * @category Creation
   * @returns Promise that resolves to a new {@link PrivyWallet} instance
   * @throws Error if wallet creation fails
   */
  async createWallet(): Promise<PrivyWallet> {
    try {
      const wallet = await this.privy.walletApi.createWallet({
        chainType: 'ethereum',
      });

      const walletInstance = new PrivyWallet(
        this.privy,
        wallet.id,
        getAddress(wallet.address),
        this.chainManager,
      );
      return walletInstance;
    } catch (error) {
      logger.error('Failed to create wallet: ', error, 'PrivyEmbeddedWalletProvider');
      throw new Error(`Failed to create wallet: ${error}`);
    }
  }

  /**
   * Retrieves a wallet by its ID via Privy
   *
   * @internal
   * @category Retrieval
   * @param params Parameters containing walletId
   * @returns Promise that resolves to a {@link PrivyWallet} instance
   * @throws Error if the wallet cannot be retrieved
   */
  async getWallet(params: { walletId: string }): Promise<PrivyWallet> {
    try {
      const wallet = await this.privy.walletApi.getWallet({
        id: params.walletId,
      });

      const walletInstance = new PrivyWallet(
        this.privy,
        wallet.id,
        getAddress(wallet.address),
        this.chainManager,
      );
      return walletInstance;
    } catch {
      throw new Error(`Failed to get wallet with id: ${params.walletId}`);
    }
  }

  /**
   * Retrieves all wallets from Privy with optional filtering and pagination
   *
   * @internal
   * @category Retrieval
   * @param options Optional filtering and pagination parameters
   * @returns Promise that resolves to an array of {@link PrivyWallet} instances
   * @throws Error if wallets cannot be retrieved
   */
  async getAllWallets(options?: PrivyProviderGetAllWalletsOptions): Promise<PrivyWallet[]> {
    try {
      const response = await this.privy.walletApi.getWallets({
        limit: options?.limit,
        cursor: options?.cursor,
      });

      return response.data.map((wallet) => {
        const walletInstance = new PrivyWallet(
          this.privy,
          wallet.id,
          getAddress(wallet.address),
          this.chainManager,
        );
        return walletInstance;
      });
    } catch {
      throw new Error('Failed to retrieve wallets');
    }
  }
}
