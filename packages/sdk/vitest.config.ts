import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    testTimeout: 30_000,
    fileParallelism: false,
    include: ['src/**/*.{test,spec}.ts'],
  },
});
