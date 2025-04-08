import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    // Disable react-scripts' built-in ESLint configuration
    ignores: ['node_modules/**', 'build/**'],
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      import: importPlugin,
      prettier: prettierPlugin
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unstable-nested-components': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // Import rules
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',

      // Simple import sort rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react', '^@?\\w', '^(@arc|arc)', '^(src/)'], ['\n^[./]']]
        }
      ],
      'simple-import-sort/exports': 'error',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      '@typescript-eslint/ban-ts-comment': 'off',

      // General rules
      'no-plusplus': 'off',
      'func-names': 'off',
      'no-console': 'off',
      'prefer-default-export': 'off',
      'prettier/prettier': 'error',

      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true
        }
      ]
    }
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: prettier.rules
  }
];
