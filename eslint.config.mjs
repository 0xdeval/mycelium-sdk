import { includeIgnoreFile } from '@eslint/compat';
import jsPlugin from '@eslint/js';
import nextJsPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.next/',
      '.next/**',
      '**/.next/',
      '**/.next/**',
      '.vercel/',
      'wallets.db',
      'pnpm-lock.yaml',
      '*.db',
      'packages/frontend/.next/**',
    ],
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  jsPlugin.configs.recommended,

  {
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-function': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },

  { files: ['**/*.{js,mjs}'], ...tseslint.configs.disableTypeChecked },

  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    plugins: { react: reactPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-deprecated': 'error',
    },
  },

  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'off',
    },
  },

  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextJsPlugin },
    rules: {
      ...nextJsPlugin.configs.recommended.rules,
      ...nextJsPlugin.configs['core-web-vitals'].rules,
    },
  },

  {
    rules: {
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      'no-implicit-coercion': 'off',
      'max-len': 'off',
      'object-shorthand': 'off',
    },
  },

  {
    files: ['packages/sdk/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['packages/blockchain/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
    },
  },
];
