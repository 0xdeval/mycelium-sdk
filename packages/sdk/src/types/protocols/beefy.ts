import type { SupportedChainId } from "@/constants/chains";
import type { Address } from "viem";

export interface VaultInfo {
  id: string;
  name: string;
  token: string;
  tokenAddress: Address;
  tokenDecimals: number;
  earnContractAddress: Address;
  earnedToken: string;
  earnedTokenAddress: Address;
  oracle: string;
  oracleId: string;
  status: "active" | "paused" | "deprecated";
  createdAt: number;
  platformId: string;
  assets: string[];
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

export interface VaultTransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

export interface VaultBalance {
  shares: string;
  ppfs?: string;
  depositedAmount: string;
}
