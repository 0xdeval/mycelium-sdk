import type { Address, Hash, LocalAccount } from 'viem';

import type { SupportedChainId } from '@/constants/chains';
import type { TokenBalance } from '@/types/token';
import type { AssetIdentifier } from '@/utils/assets';
import type { TransactionData } from '@/types/transaction';
import type { VaultBalance, VaultTxnResult } from '@/types/protocols/general';

/**
 * Abstract base class for smart wallet implementations
 *
 * @internal
 * @category Wallets
 * @remarks
 * Provides the interface for ERC-4337 compatible wallets
 * Extended by concrete classes such as {@link DefaultSmartWallet}
 */
export abstract class SmartWallet {
  /** LocalAccount used for signing transactions on behalf of this smart wallet */
  abstract signer: LocalAccount;

  /**
   * Returns the deployed or predicted address of this smart wallet
   *
   * @internal
   * @category Addressing
   * @remarks
   * For undeployed wallets this returns the deterministic CREATE2 address
   *
   * @returns Promise resolving to the wallet Ethereum address
   */
  abstract getAddress(): Promise<Address>;

  /**
   * Retrieves balances for all supported tokens held by this smart wallet
   *
   * @internal
   * @category Balances
   * @returns Promise resolving to an array of {@link TokenBalance} entries
   */
  abstract getBalance(): Promise<TokenBalance[]>;

  // TODO: add addSigner method
  // TODO: add removeSigner method

  /**
   * Executes a transaction through the smart wallet
   *
   * @internal
   * @category Transactions
   * @remarks
   * Handles gas sponsorship and ERC-4337 UserOperation creation automatically
   *
   * @param transactionData Transaction data to execute
   * @param chainId Target blockchain chain ID
   * @returns Promise resolving to the transaction {@link Hash}
   */
  abstract send(transactionData: TransactionData, chainId: SupportedChainId): Promise<Hash>;

  /**
   * Executes a batch of transactions through the smart wallet
   *
   * @internal
   * @category Transactions
   * @remarks
   * Transactions are executed in the order they are provided
   * Handles gas sponsorship and ERC-4337 UserOperation creation automatically
   *
   * @param transactionData Array of transaction data objects
   * @param chainId Target blockchain chain ID
   * @returns Promise resolving to the transaction {@link Hash}
   */
  abstract sendBatch(transactionData: TransactionData[], chainId: SupportedChainId): Promise<Hash>;

  /**
   * Prepares transaction data for sending tokens to another address
   *
   * @internal
   * @category Transactions
   * @param amount Human-readable amount to send
   * @param asset Token or asset identifier
   * @param recipientAddress Destination address
   * @returns Promise resolving to prepared {@link TransactionData}
   */
  abstract sendTokens(
    amount: number,
    asset: AssetIdentifier,
    recipientAddress: Address,
  ): Promise<TransactionData>; // TODO: Add a correct type

  /**
   * Deposits funds into a selected protocol vault to start earning yield
   *
   * @internal
   * @category Yield
   * @param amount Amount to deposit in human-readable format
   * @returns Promise resolving to a {@link VaultTxnResult}
   */
  abstract earn(amount: string): Promise<VaultTxnResult>;

  /**
   * Retrieves the balance of deposited funds in the selected protocol vault
   *
   * @internal
   * @category Yield
   * @returns Promise resolving to a {@link VaultBalance} or null if none
   */
  abstract getEarnBalance(): Promise<VaultBalance | null>;

  /**
   * Withdraws a specific amount of shares from the protocol vault
   *
   * @internal
   * @category Yield
   * @param amount Human-readable amount of shares to withdraw
   * @returns Promise resolving to a {@link VaultTxnResult}
   */
  abstract withdraw(amount: string): Promise<VaultTxnResult>;
}
