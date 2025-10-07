import type { BaseProtocol } from '@/protocols/base/BaseProtocol';
import type { Address } from 'viem';

/**
 * Base information that can be used to identify a protocol
 */
export interface ProtocolInfo {
  id: string;
  name: string;
  website: string;
  logo: string;
  supportedChains: number[];
  riskLevel: 'low' | 'medium' | 'high';
  isPremium: boolean;
}

/**
 * Interface with protocol information and instance object
 */
export interface Protocol {
  instance: BaseProtocol;
  info: ProtocolInfo;
}

/**
 * The protocols router config that defines which protocols should be used for an integrator
 */
export interface ProtocolsRouterConfig {
  riskLevel: 'low' | 'medium' | 'high';
  minApy?: number;
  apiKey?: string;
}

/**
 * Must have fields for all protocols vaults
 */
export interface VaultInfo {
  id: string;
  chain: string;
  chainId?: number;
  depositTokenAddress: Address;
  depositTokenDecimals: number;
  vaultAddress: Address;
  earnTokenAddress?: Address;
  earnTokenDecimals?: number;
  metadata?: Record<string, unknown>;
}

export interface VaultBalance {
  shares: string;
  depositedAmount: string;
}

export interface VaultTxnResult {
  hash: string;
  success: boolean;
  error?: string;
}
