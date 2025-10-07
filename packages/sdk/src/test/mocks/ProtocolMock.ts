import { vi } from 'vitest';
import type { Protocol } from '@/types/protocols/general';
import { createMockChainManager } from '@/test/mocks/ChainManagerMock';
import { mockVaultInfo } from '@/test/mocks/protocols/spark';

/**
 * Mock Protocol for testing
 * @description Provides a mock implementation of Protocol for testing purposes
 */
export const createMockProtocol = (): Protocol => {
  const mockChainManager = createMockChainManager();

  return {
    init: vi.fn(),
    chainManager: mockChainManager,
    getVaults: vi.fn().mockResolvedValue([mockVaultInfo]),
    getBestVault: vi.fn().mockResolvedValue(mockVaultInfo),
    fetchDepositedVaults: vi.fn().mockResolvedValue(mockVaultInfo),
    deposit: vi.fn().mockResolvedValue({
      hash: '0x3c36293ab6884794bda1271b570ca9e9b68a406e93486359e7213a30f88c349b',
      success: true,
    }),
    withdraw: vi.fn().mockResolvedValue({
      hash: '0x3c36293ab6884794bda1271b570ca9e9b68a406e93486359e7213a30f88c349b',
      success: true,
    }),
    getBalance: vi
      .fn()
      .mockResolvedValue(100n)
      .mockResolvedValue({ shares: '100', depositedAmount: '100', ppfs: '100' }),
    approveToken: vi
      .fn()
      .mockResolvedValue('0x3c36293ab6884794bda1271b570ca9e9b68a406e93486359e7213a30f88c349b'),
    checkAllowance: vi.fn().mockResolvedValue(100n),
  } as unknown as Protocol;
};
