import type { SupportedChainId } from '@/constants/chains';
import type { Address } from 'viem';
import type { VaultInfo } from '@/types/protocols/general';

export interface BeefyVaultInfo extends VaultInfo {
  id: string;
  name: string;
  token: string;
  tokenAddress: Address;
  tokenDecimals: number;
  metadata?: {
    apy?: number;
    tvl?: number;
    fees?:
      | {
          performance: {
            total: number;
            call: number;
            strategist: number;
            treasury: number;
            stakers: number;
          };
          withdraw: number;
          lastUpdated: number;
        }
      | number;
  };
  oracle: string;
  assets: string[];
  status: 'active' | 'eol';

  earnContractAddress: Address;
  earnedToken: string;
  earnedTokenAddress: Address;
  oracleId: string;
  createdAt: number;
  platformId: string;
  risks: string[];
  strategyTypeId: string;
  network: string;
  zaps: Array<{
    strategyId: string;
  }>;
  isGovVault: boolean;
  type: string;
  chain: string;
  chainId?: SupportedChainId;
  strategy: Address;
  pricePerFullShare: string;
  lastHarvest: number;
  buyTokenUrl?: string;
  lendingOracle?: {
    provider: string;
    address: Address;
  };
  migrationIds?: string[];
}

export interface BeefyVaultTxnResult {
  hash: string;
  success: boolean;
  error?: string;
}

export interface BeefyVaultBalance {
  shares: string;
  ppfs?: string;
  depositedAmount: string;
}
