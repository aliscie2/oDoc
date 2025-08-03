import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/frontend'),
      $: resolve(__dirname, './src')
    }
  },
  test: {
    include: ['tests/backend/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**', 
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/frontend/**'
    ],
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/backend/test-setup.ts'],
    testTimeout: 10000,
  }
});