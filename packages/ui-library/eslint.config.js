import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["*/.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "simple-import-sort": simpleImportSortPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/jsx-no-useless-fragment": "off",
      "react/function-component-definition": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-unstable-nested-components": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^react", "^@?\\w", "^(@arc|arc)", "^(src/)"], ["\n^[./]"]],
        },
      ],
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^React$" },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
      "no-plusplus": "off",
      "func-names": "off",
      "prefer-default-export": "off",
      "prettier/prettier": "error",
      "max-lines": [
        "warn",
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "consistent-return": "error",
      "no-nested-ternary": "error",
      "no-restricted-globals": ["error", "event", "fdescribe"], // Add others as needed
      "no-global-assign": "error",
      "no-shadow": "error",
      "no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", ignoreRestSiblings: true },
      ],
      "import/newline-after-import": ["error", { count: 1 }],
      "prefer-const": [
        "error",
        {
          destructuring: "all",
          ignoreReadBeforeAssign: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^React$",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["PascalCase", "camelCase"], // Accept both for functions
          filter: {
            regex: "^[A-Z]",
            match: true,
          },
        },
        {
          selector: "variable",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          filter: {
            regex: "^[A-Z]",
            match: false,
          },
        },
        {
          selector: "typeLike", // Includes enum, class, interface, typeAlias
          format: ["PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
      ],
      // Assignment & mutation
      "operator-assignment": ["error", "always"],
      "no-param-reassign": [
        "error",
        {
          props: true,
          ignorePropertyModificationsFor: ["draft", "acc", "ctx"],
        },
      ],
      // Shadowing
      "no-shadow": "off", // Disable base rule
      "@typescript-eslint/no-shadow": ["error"],
    },
  },
  {
    files: ["*/.{js,jsx,ts,tsx}"],
    rules: prettier.rules,
  },
];