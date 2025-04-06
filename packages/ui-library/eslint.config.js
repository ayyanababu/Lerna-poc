import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import fs from 'fs';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// Load prettier config from .prettierrc.json
const prettierrcPath = path.join(import.meta.dirname, '.prettierrc.json');
const prettierOptions = JSON.parse(fs.readFileSync(prettierrcPath, 'utf8'));

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('airbnb', 'airbnb/hooks'),
  prettierConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      prettier: eslintPluginPrettier,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],
      'prettier/prettier': ['error', prettierOptions],
      'react/jsx-props-no-spreading': 'off',

      // Rest of your rules remain unchanged
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-undef': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: 'arrow-function',
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['src'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      react: {
        version: 'detect',
      },
    },
  },
];