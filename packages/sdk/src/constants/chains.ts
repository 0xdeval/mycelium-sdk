import { base, baseSepolia, type Chain } from 'viem/chains';

export const CHAINS_MAP: Record<string, Chain> = {
  base,
  baseSepolia,
};

export const SUPPORTED_CHAIN_IDS = Object.values(CHAINS_MAP).map((c) => c.id);

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
