import type { SparkVaultInfo } from '@/types/protocols/spark';

export const mockVaultInfo: SparkVaultInfo = {
  id: 'sUSDC',
  chain: 'base',
  tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  earnContractAddress: '0x3128a0f7f0ea68e7b7c9b00afa7e41045828e858',
  tokenDecimals: 6,
  apy: 0.048,
  vaultAddress: '0x3128a0f7f0ea68e7b7c9b00afa7e41045828e858',
  underlyingAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  underlyingSymbol: 'USDC',
  underlyingDecimals: 6,
  shareSymbol: 'sUSDC',
  shareDecimals: 18,
};
