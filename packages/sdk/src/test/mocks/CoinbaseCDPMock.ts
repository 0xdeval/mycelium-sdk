import { vi } from 'vitest';
import type { CoinbaseCDP } from '@/tools/CoinbaseCDP';
import { onRampResponseMock } from './ramp/on-ramp';

/**
 * Mock Coinbase CDP for testing
 * @description Provides a mock implementation of CoinbaseCDP for testing purposes
 */
export const createMockCoinbaseCDP = (): CoinbaseCDP => {
  return {
    auth: vi.fn().mockResolvedValue('mock-jwt-token'),
    getOnRampLink: vi.fn().mockResolvedValue(onRampResponseMock),
  } as unknown as CoinbaseCDP;
};
