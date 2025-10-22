import type { VaultInfo } from '@/types/protocols/general';
import type { Address } from 'viem';

export interface SparkVaultInfo extends VaultInfo {
  id: string;
  chain: string;
  earnTokenAddress: Address;
  earnTokenDecimals: number;
  depositTokenSymbol: string;
  earnTokenSymbol: string;
  metadata?: {
    apy?: number;
  };
}

/**
 * @public
 * The result of a Spark vault deposit or withdrawal transaction
 * @category Types
 */
export interface SparkVaultTxnResult {
  /** the boolean value that indicates if the transaction was successful */
  success: boolean;
  /** hash of the operation */
  hash: string;
}

/**
 * @public
 * The info about current user's balance in a Spark vault
 * @category Types
 */
export interface SparkVaultBalance {
  /** amount of shares in sUSDC token that user has in the Spark vault */
  shares: string;
  /**
   *  amount of deposited tokens + earned tokens
   * @remarks
   * To get the amount of earned tokens, you need to store all user's deposits and withdrawals
   * on your side and then subtract the amount of deposited tokens from the `depositedAmount` */
  depositedAmount: string;
  /** detailed info about a Spark vault where a user deposited funds */
  vaultInfo: SparkVaultInfo;
}
