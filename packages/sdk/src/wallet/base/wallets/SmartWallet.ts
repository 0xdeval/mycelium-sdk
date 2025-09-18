import type { Address, Hash, LocalAccount } from "viem";

import type { SupportedChainId } from "@/constants/chains";
import type { TokenBalance } from "@/types/token";
import type { AssetIdentifier } from "@/utils/assets";
import type { TransactionData } from "@/types/transaction";

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

  //   /**
  //    * Withdraw tokens from this smart wallet to a fiat
  //    * @description Prepares an off ramp link to withdraw tokens from this smart wallet
  //    * to a fiat account (bank account)
  //    * @param amount - Amount to withdraw in human-readable format
  //    * @param asset - Asset identifier for the token to withdraw
  //    * @param bankAccount - Destination bank account for the tokens
  //    * @returns Promise resolving to prepared transaction data
  //    */
  //   abstract withdrawTokens(
  //     amount: number,
  //     asset: AssetIdentifier,
  //     bankAccount: string
  //   ): Promise<string>; // TODO: Add a correct type
}
