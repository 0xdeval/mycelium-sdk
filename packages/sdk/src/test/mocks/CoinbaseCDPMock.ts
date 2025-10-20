import { vi } from 'vitest';
import type { CoinbaseCDP } from '@/tools/CoinbaseCDP';
import { onRampConfigResponseMock, onRampResponseMock } from '@/test/mocks/ramp/on-ramp';
import { offRampConfigResponseMock, offRampResponseMock } from './ramp/off-ramp';

/**
 * Mock Coinbase CDP: returns an object with vi.fn and correct typing.
 * Allows overriding of default mocked methods if needed.
 * Example:
 *   const mockCoinbaseCDP = createMockCoinbaseCDP({
 *     getOnRampLink: vi.fn().mockResolvedValue(customResponse)
 *   });
 */
export const createMockCoinbaseCDP = (overrides: Partial<CoinbaseCDP> = {}): CoinbaseCDP => {
  return {
    auth: vi.fn<CoinbaseCDP['auth']>().mockResolvedValue('mock-jwt-token'),
    getOnRampLink: vi.fn<CoinbaseCDP['getOnRampLink']>().mockResolvedValue(onRampResponseMock),
    getOnRampConfig: vi
      .fn<CoinbaseCDP['getOnRampConfig']>()
      .mockResolvedValue(onRampConfigResponseMock),
    getOffRampLink: vi.fn<CoinbaseCDP['getOffRampLink']>().mockResolvedValue(offRampResponseMock),
    getOffRampConfig: vi
      .fn<CoinbaseCDP['getOffRampConfig']>()
      .mockResolvedValue(offRampConfigResponseMock),

    ...overrides,
  } as unknown as CoinbaseCDP;
};
