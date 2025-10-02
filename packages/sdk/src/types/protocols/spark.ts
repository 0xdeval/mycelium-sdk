import type { VaultInfo } from '@/types/protocols/general';
import type { Address } from 'viem';

export interface SparkVaultInfo extends VaultInfo {
  id: string;
  chain: string;
  earnTokenAddress: Address;
  earnTokenDecimals: number;
  metadata?: {
    apy?: number;
  };
}

export interface SparkVaultTxnResult {
  success: boolean;
  hash: string;
}

export interface SparkVaultBalance {
  shares: string;
  depositedAmount: string;
}
