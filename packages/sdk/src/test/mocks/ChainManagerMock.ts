import { vi } from 'vitest';
import type { ChainManager } from '@/tools/ChainManager';
import type { PublicClient } from 'viem';
import type { SupportedChainId } from '@/constants/chains';

export const createMockChainManager = (): ChainManager => {
  const mockPublicClient = {
    readContract: vi.fn(),
  } as unknown as PublicClient;

  return {
    getPublicClient: vi.fn().mockReturnValue(mockPublicClient),
    getRpcUrl: vi.fn().mockReturnValue('https://mock-rpc-url.com'),
    getBundlerUrl: vi.fn().mockReturnValue('https://mock-bundler-url.com'),
    getChain: vi.fn().mockReturnValue({
      id: 8453,
      name: 'Base',
      network: 'base',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://mock-rpc-url.com'] } },
    }),
    getSupportedChain: vi.fn().mockReturnValue(8453 as SupportedChainId),
    getChainIdByName: vi.fn().mockReturnValue(8453 as SupportedChainId),
    getSupportedChainNames: vi.fn().mockReturnValue(['base', 'ethereum']),
    isChainSupported: vi.fn().mockReturnValue(true),
  } as unknown as ChainManager;
};
