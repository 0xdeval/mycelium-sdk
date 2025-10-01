import type { VaultInfo } from '@/types/protocols/beefy';

export const mockVaultInfo: VaultInfo = {
  id: 'beefy-usdc-vault',
  name: 'Beefy USDC Vault',
  token: 'USDC',
  tokenAddress: '0xA0b86a33E6441b8c4C8C0E4c8b8c4C8C0E4c8b8c4',
  tokenDecimals: 6,
  earnContractAddress: '0xB1c86a33E6441b8c4C8C0E4c8b8c4C8C0E4c8b8c4',
  earnedToken: 'mooUSDC',
  earnedTokenAddress: '0xC2c86a33E6441b8c4C8C0E4c8b8c4C8C0E4c8b8c4',
  oracle: 'tokens',
  oracleId: 'USDC',
  status: 'active',
  createdAt: Date.now(),
  platformId: 'beefy',
  assets: ['USDC'],
  risks: ['smart-contract'],
  strategyTypeId: 'single',
  network: 'base',
  zaps: [],
  isGovVault: false,
  type: 'vault',
  chain: 'base',
  chainId: 8453,
  strategy: '0xD3c86a33E6441b8c4C8C0E4c8b8c4C8C0E4c8b8c4',
  pricePerFullShare: '1000000000000000000',
  lastHarvest: Date.now(),
  apy: 0.05,
  tvl: 1000000,
  fees: {
    lastUpdated: 123123123,
    performance: {
      call: 0.05,
      stakers: 0.01,
      strategist: 0.03,
      total: 0.1,
      treasury: 0.01,
    },
    withdraw: 0,
  },
};

export const mockApiResponses = {
  vaults: [mockVaultInfo],
  apy: { 'beefy-usdc-vault': 0.05 },
  fees: {
    'beefy-usdc-vault': {
      performance: { total: 0.1, call: 0.05, strategist: 0.03, treasury: 0.01, stakers: 0.01 },
      withdraw: 0,
      lastUpdated: 123123123,
    },
  },
  tvl: { 8453: { 'beefy-usdc-vault': 1000000 } },
};
