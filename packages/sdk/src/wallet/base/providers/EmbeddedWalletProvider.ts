import type { EmbeddedWallet } from '@/wallet/base/wallets/EmbeddedWallet';

/**
 * Abstract base class for embedded wallet providers
 *
 * @internal
 * @category Wallet Providers
 * @remarks
 * Defines the interface for providers that manage {@link EmbeddedWallet} instances
 * Extended by implementations such as {@link PrivyEmbeddedWalletProvider}
 */
export abstract class EmbeddedWalletProvider {
  /**
   * Creates a new embedded wallet instance
   *
   * @internal
   * @category Creation
   * @remarks
   * Uses the provider’s infrastructure to provision a new embedded wallet ready for signing
   *
   * @returns Promise resolving to a new {@link EmbeddedWallet}
   */
  abstract createWallet(): Promise<EmbeddedWallet>;

  /**
   * Retrieves an existing embedded wallet by its unique identifier
   *
   * @internal
   * @category Retrieval
   * @remarks
   * The wallet must have been created previously through this provider
   *
   * @param params Wallet retrieval parameters
   * @param params.walletId Unique identifier for the embedded wallet
   * @returns Promise resolving to an {@link EmbeddedWallet}
   * @throws Error if no wallet with the specified ID exists
   */
  abstract getWallet(params: { walletId: string }): Promise<EmbeddedWallet>;
}
