import { base, baseSepolia, mainnet, unichain, sepolia, type Chain } from 'viem/chains';

export const CHAINS_MAP: Record<string, Chain> = {
  mainnet,
  unichain,
  base,
  baseSepolia,
  sepolia,
};

export const SUPPORTED_CHAIN_IDS = Object.values(CHAINS_MAP).map((c) => c.id);

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
