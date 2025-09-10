import { base, baseSepolia, mainnet, unichain, sepolia } from "viem/chains";

export const SUPPORTED_CHAIN_IDS = [
  mainnet.id,
  unichain.id,
  base.id,
  baseSepolia.id,
  sepolia.id,
  31337,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
