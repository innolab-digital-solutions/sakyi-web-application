import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Vitest configuration for unit and component testing.
 *
 * - Uses jsdom to simulate a browser-like environment.
 * - Includes all .test.ts and .test.tsx files under the tests/ directory.
 * - Fails if no tests are found (passWithNoTests: false).
 * - Enables Vite plugins:
 *   - vite-tsconfig-paths: Supports TypeScript path aliases (from tsconfig).
 *   - @vitejs/plugin-react: Optimizes React components for Vite builds/tests.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    passWithNoTests: false,
  },
});
