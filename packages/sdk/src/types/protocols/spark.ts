import type { Address } from 'viem';

export interface SparkVaultInfo {
  id: string;
  chain: string;
  tokenAddress: Address;
  earnContractAddress: Address;
  tokenDecimals?: number;
  apy?: number;
  vaultAddress: Address;
  underlyingAddress: Address;
  underlyingSymbol: string;
  underlyingDecimals: number;
  shareSymbol: string;
  shareDecimals: number;
}

export interface SparkVaultTransactionResult {
  success: boolean;
  hash: string;
}

export interface SparkVaultBalance {
  shares: string;
  depositedAmount: string;
}
