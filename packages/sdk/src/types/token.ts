import type { SupportedChainId } from '@/constants/chains';

/**
 * @internal
 * @category Types
 * @description Detailed token balance information
 *
 */
export interface TokenBalance {
  symbol: string;
  totalBalance: bigint;
  totalFormattedBalance: string;
  chainBalances: Array<{
    chainId: SupportedChainId;
    balance: bigint;
    formattedBalance: string;
  }>;
}
