import type { SparkVaultInfo } from '@/types/protocols/spark';

export const SPARK_VAULT: SparkVaultInfo[] = [
  {
    id: 'sUSDC',
    chain: 'base',
    vaultAddress: '0x3128a0f7f0ea68e7b7c9b00afa7e41045828e858',
    depositTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    depositTokenDecimals: 6,
    earnTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    earnTokenDecimals: 18,
    metadata: {
      apy: 0.048,
    },
  },
];
