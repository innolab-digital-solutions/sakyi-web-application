import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import query from '@tanstack/eslint-plugin-query';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

/**
 * ESLint configuration for Next.js + TypeScript + Prettier project.
 *
 * Layered and documented for clarity:
 *   - nextVitals: Next.js web vital rules
 *   - nextTs: Next.js/TypeScript best-practices rules
 *   - prettier: Disables formatting opinions that conflict with Prettier
 *   - query: Recommended linting for TanStack Query usage
 *   - simple-import-sort: Enforces consistent import/export ordering across all JS/TS files
 *   - unused-imports: Removes unused imports on --fix / editor fix-on-save (wraps TS/JS no-unused-vars)
 *   - Global and per-file ignores for tool output and environment files
 */

const eslintConfig = defineConfig([
  // Next.js core web vitals rules (accessibility, performance, etc.)
  ...nextVitals,

  // TypeScript rules from Next.js configuration
  ...nextTs,

  // Ensures Prettier handles all formatting (disables conflicting ESLint rules)
  prettier,

  // TanStack Query lint rules (flat config, recommended)
  ...query.configs['flat/recommended'],

  // Simple import/export sorting for all supported files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // Unused imports: autofix removes import specifiers/lines; unused vars use same ignore patterns as before
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Globally ignore common tool output and environment files/folders
  globalIgnores([
    '.cursor/**',
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
