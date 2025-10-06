import type { Address, LocalAccount } from 'viem';
import type { WebAuthnAccount } from 'viem/account-abstraction';
import type { SmartWallet } from '@/wallet/base/wallets/SmartWallet';

/**
 * Abstract base class for smart wallet providers
 *
 * @internal
 * @category Wallet Providers
 * @remarks
 * Defines the interface for factories that create and manage {@link SmartWallet} instances
 * Extended by implementations such as {@link DefaultSmartWalletProvider}
 */
export abstract class SmartWalletProvider {
  /**
   * Creates a new smart wallet instance that will be deployed on first transaction
   *
   * @internal
   * @category Creation
   * @remarks
   * Address is calculated deterministically using owners and nonce
   *
   * @param params Wallet creation parameters
   * @param params.owners Array of wallet owners (addresses or WebAuthn accounts)
   * @param params.signer Local account used for signing
   * @param params.nonce Optional nonce for address derivation, default 0
   * @returns Promise resolving to a {@link SmartWallet} instance
   */
  abstract createWallet(params: {
    owners: Array<Address | WebAuthnAccount>;
    signer: LocalAccount;
    nonce?: bigint;
  }): Promise<SmartWallet>;

  /**
   * Returns a smart wallet instance for an already deployed contract
   *
   * @internal
   * @category Retrieval
   * @remarks
   * Use when the wallet address is already known
   *
   * @param params Wallet retrieval parameters
   * @param params.walletAddress Deployed smart wallet address
   * @param params.signer Local account to operate the wallet
   * @param params.ownerIndex Optional index of signer in the owners list, default 0
   * @returns A {@link SmartWallet} instance
   */
  abstract getWallet(params: {
    walletAddress: Address;
    signer: LocalAccount;
    ownerIndex?: number;
  }): SmartWallet;

  /**
   * Predicts the deterministic address of a smart wallet
   *
   * @internal
   * @category Addressing
   * @remarks
   * Uses CREATE2 with owners and nonce to calculate the wallet address
   *
   * @param params Prediction parameters
   * @param params.owners Array of wallet owners (addresses or WebAuthn accounts)
   * @param params.nonce Optional nonce, default 0
   * @returns Promise resolving to the predicted {@link Address}
   */
  abstract getWalletAddress(params: {
    owners: Array<Address | WebAuthnAccount>;
    nonce?: bigint;
  }): Promise<Address>;
}
