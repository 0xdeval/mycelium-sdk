import { vi } from 'vitest';

global.fetch = vi.fn() as unknown as typeof fetch;

global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
