import type { Address, LocalAccount, WalletClient } from 'viem';

import type { SupportedChainId } from '@/constants/chains';

/**
 * Abstract base class for embedded wallet implementations
 *
 * @internal
 * @category Wallets
 * @remarks
 * Provides a standard interface for embedded wallets (Privy, Dynamic, etc.)
 * Can be used as a signer for smart wallets when the embedded wallet is an owner
 */
export abstract class EmbeddedWallet {
  /** Ethereum address of the wallet */
  public readonly address: Address;
  /** Optional provider-specific wallet identifier */
  public readonly walletId?: string;

  /**
   * Creates an embedded wallet instance
   *
   * @internal
   * @param address Ethereum address of the wallet
   * @param walletId Optional provider-specific identifier
   */
  constructor(address: Address, walletId?: string) {
    this.address = address;
    this.walletId = walletId;
  }

  /**
   * Returns a {@link LocalAccount} that can sign transactions and messages
   *
   * @internal
   * @category Accounts
   * @remarks
   * Useful for smart wallet operations if the embedded wallet is included as an owner
   *
   * @returns Promise resolving to a {@link LocalAccount}
   */
  abstract account(): Promise<LocalAccount>;

  /**
   * Returns a {@link WalletClient} for interacting with contracts on a specific chain
   *
   * @internal
   * @category Accounts
   * @param chainId Target chain ID
   * @returns Promise resolving to a {@link WalletClient} configured for the given chain
   */
  abstract walletClient(chainId: SupportedChainId): Promise<WalletClient>;
}
