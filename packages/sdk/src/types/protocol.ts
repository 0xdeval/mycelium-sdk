import type { Address, LocalAccount } from "viem";
import type { SupportedChainId } from "@/constants/chains";
import type { SmartWallet } from "@/wallet/base/wallets/SmartWallet";
// Base interface for all protocols
export interface ProtocolInfo {
  id: string;
  name: string;
  website: string;
  logo: string;
  supportedChains: number[];
  riskLevel: "low" | "medium" | "high";
}

// Base interface for vaults/pools
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
  migrationIds: string[];
  risks: string[];
  strategyTypeId: string;
  network: string;
  zaps: Array<{
    strategyId: string;
  }>;
  isGovVault: boolean;
  type: string;
  chain: string;
  strategy: Address;
  pricePerFullShare: string;
  lastHarvest: number;
}

// Transaction result for vault operations
export interface VaultTransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

// Balance information for vault
// export interface VaultBalance {
//   balance: string;
//   shares: string;
//   value: string;
// }
export interface VaultBalance {
  shares: string;
  ppfs?: string;
  depositedAmount: string;
}

// Base operations
export interface VaultOperations {
  deposit(
    amount: string,
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId,
    smartWallet: SmartWallet
  ): Promise<VaultTransactionResult>;
  withdraw(
    shares: string,
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId,
    smartWallet: SmartWallet
  ): Promise<VaultTransactionResult>;
  withdrawAll(
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId,
    smartWallet: SmartWallet
  ): Promise<VaultTransactionResult>;
  getBalance(
    vaultInfo: VaultInfo,
    walletAddress: Address,
    chainId: SupportedChainId
  ): Promise<VaultBalance>;
}
