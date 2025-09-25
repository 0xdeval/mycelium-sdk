import type { Address, Hash, LocalAccount } from "viem";

import type { SupportedChainId } from "@/constants/chains";
import type { TokenBalance } from "@/types/token";
import type { AssetIdentifier } from "@/utils/assets";
import type { TransactionData } from "@/types/transaction";
import type {
  VaultInfo,
  VaultBalance,
  VaultTransactionResult,
} from "@/types/protocols/beefy";

/**
 * Base smart wallet class
 * @description Abstract base class for smart wallet implementations (ERC-4337 compatible wallets).
 */
export abstract class SmartWallet {
  /** The LocalAccount used for signing transactions on behalf of this smart wallet */
  abstract signer: LocalAccount;

  /**
   * Get the smart wallet's address
   * @description Returns the deployed or predicted address of this smart wallet contract.
   * For undeployed wallets, this returns the deterministic CREATE2 address.
   * @returns Promise resolving to the wallet's Ethereum address
   */
  abstract getAddress(): Promise<Address>;

  /**
   * Get all token balances for this wallet
   * @description Retrieves balances for all supported tokens held by this smart wallet.
   * @returns Promise resolving to an array of token balances with amounts and metadata
   */
  abstract getBalance(): Promise<TokenBalance[]>;

  // TODO: add addSigner method
  // TODO: add removeSigner method

  /**
   * Send a transaction using this smart wallet
   * @description Executes a transaction through the smart wallet, handling gas sponsorship
   * and ERC-4337 UserOperation creation automatically.
   * @param transactionData - The transaction data to execute
   * @param chainId - Target blockchain chain ID
   * @returns Promise resolving to the transaction hash
   */
  abstract send(
    transactionData: TransactionData,
    chainId: SupportedChainId
  ): Promise<Hash>;

  /**
   * Send a batch of transactions using this smart wallet. The order of the transactions is important
   * and it will be used to execute them in the same order.
   * @description Executes a batch of transactions through the smart wallet, handling gas sponsorship
   * and ERC-4337 UserOperation creation automatically.
   * @param transactionData[] - The transaction data array to execute. Order is important.
   * @param chainId - Target blockchain chain ID
   * @returns Promise resolving to the transaction hash
   */
  abstract sendBatch(
    transactionData: TransactionData[],
    chainId: SupportedChainId
  ): Promise<Hash>;

  /**
   * Send tokens to another address
   * @description Prepares transaction data for sending tokens from this smart wallet
   * to a recipient address. Returns transaction data that can be executed via send().
   * @param amount - Amount to send in human-readable format
   * @param asset - Asset identifier for the token to send
   * @param recipientAddress - Destination address for the tokens
   * @returns Promise resolving to prepared transaction data
   */
  abstract sendTokens(
    amount: number,
    asset: AssetIdentifier,
    recipientAddress: Address
  ): Promise<TransactionData>; // TODO: Add a correct type

  /**
   * Start earning yield from depositing to a vault of a selected protocol
   *
   * @param amount - Amount to earn in human-readable format
   * @param chainId - Target blockchain chain ID for a protocol's vault
   * @returns Promise resolving to the transaction hash
   */
  abstract earn(amount: string): Promise<VaultTransactionResult>;

  /**
   * Get the balance of deposited funds to a vault of a selected protocol
   * @returns Promise resolving to the balance of deposited funds to a vault
   */
  abstract getEarnBalance(): Promise<VaultBalance | null>;

  /**
   * Withdraw specific amount from the protocol vault
   * @description Withdraws a specific amount of shares from the protocol vault
   * @param amount - Amount of shares to withdraw
   * @returns Promise resolving to transaction result
   */
  abstract withdraw(amount: string): Promise<VaultTransactionResult>;

}
