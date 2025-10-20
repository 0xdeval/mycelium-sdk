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
 * @internal
 * The info about a protocol vault
 * @category Types
 * @remarks
 * Generic type that shows the whole list of optional and mandatory fields for a protocol vault
 */
export interface VaultInfo {
  id: string;
  chain: string;
  chainId?: number;
  depositTokenAddress: Address;
  depositTokenDecimals: number;
  depositTokenSymbol?: string;
  vaultAddress: Address;
  earnTokenAddress?: Address;
  earnTokenDecimals?: number;
  earnTokenSymbol?: string;
  metadata?: Record<string, number | string>;
}

/**
 * @public
 * The info about current user's balance in a protocol vault
 * @category Types
 * @remarks
 * The generic type that shows fields that should be present in a protocol vault balance
 */
export interface VaultBalance {
  /** amount of shares in a protocol vault based on a deposited amount */
  shares: string;
  /** amount of deposited tokens in a protocol vault (e.g. sUSDC)*/
  depositedAmount: string;
  /** info about a protocol vault where a user deposited funds */
  vaultInfo: VaultInfo;
}

/**
 * @public
 * The result fields of a protocol vault related transaction
 * @category Types
 * @remarks
 * The generic type that shows fields that should be present for each protocol vault related transaction
 */
export interface VaultTxnResult {
  /** hash of the operation */
  hash: string;
  /** if an operation is successful or not */
  success: boolean;
  /** error message if an operation is not successful */
  error?: string;
}
