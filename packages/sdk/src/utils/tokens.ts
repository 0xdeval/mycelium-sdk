import type { Address } from "viem";
import type { SupportedChainId } from "@/constants/chains";
import { SUPPORTED_TOKENS } from "@/constants/tokens";

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Partial<Record<SupportedChainId, Address>>; // chainId -> address
}

/**
 * Find token by address and chain ID
 * @param address Token address
 * @param chainId Chain ID
 * @returns Token symbol or null if not found
 */
export function findTokenByAddress(
  address: Address,
  chainId: SupportedChainId
): string | null {
  const normalizedAddress = address.toLowerCase();

  for (const [symbol, token] of Object.entries(SUPPORTED_TOKENS)) {
    const tokenAddress = token.addresses[chainId];
    if (tokenAddress && tokenAddress.toLowerCase() === normalizedAddress) {
      return symbol;
    }
  }

  return null;
}

/**
 * Get token address for a specific chain
 * @param symbol Token symbol
 * @param chainId Chain ID
 * @returns Token address or null if not supported on that chain
 */
export function getTokenAddress(
  symbol: string,
  chainId: SupportedChainId
): Address | null {
  const token = SUPPORTED_TOKENS[symbol];
  return token?.addresses[chainId] || null;
}
