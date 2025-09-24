import type { TokenInfo } from '@/utils/tokens';
import { mainnet, unichain, base, baseSepolia, sepolia } from 'viem/chains';

export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    addresses: {
      [mainnet.id]: '0x0000000000000000000000000000000000000000',
      [unichain.id]: '0x0000000000000000000000000000000000000000',
      [base.id]: '0x0000000000000000000000000000000000000000',
      [baseSepolia.id]: '0x0000000000000000000000000000000000000000',
      [sepolia.id]: '0x0000000000000000000000000000000000000000',
    },
  },
  USDC: {
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    addresses: {
      [mainnet.id]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      [unichain.id]: '0x078d782b760474a361dda0af3839290b0ef57ad6',
      [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      [sepolia.id]: '0xf08A50178dfcDe18524640EA6618a1f965821715',
      [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
};
