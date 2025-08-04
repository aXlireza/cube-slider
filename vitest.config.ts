import path from 'path';
import { defineConfig } from 'vitest/config';

process.env.SKIP_POSTCSS = '1';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    environment: 'jsdom'
  }
});
