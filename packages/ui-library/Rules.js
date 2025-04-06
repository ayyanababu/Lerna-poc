
// should have
// standard rules
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['./base.js'].map(require.resolve),
  plugins: ['react', 'simple-import-sort', 'import'],
  rules: {
    'simple-import-sort/imports': [
      'error',
      {
        groups: [['^react', '^@?\\w', '^(@arc|arc)', '^(src/)'], ['\n^[./]']]
      }
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': 0,
    'react/jsx-no-useless-fragment': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unstable-nested-components': 'off',
    'func-names': 0,
    'no-console': 'off',
    'react/prop-types': 'off'
  }
};




// must have
// base rules
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint-config-airbnb',
    'eslint-config-airbnb/hooks',
    'eslint-config-airbnb-typescript',
    'eslint-config-prettier'
  ].map(require.resolve),
  plugins: ['eslint-plugin-prettier'],
  rules: {
    'no-plusplus': 'off',
    'react/require-default-props': 'off',
    'max-lines': [
      'warn',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }
    ]
  },
  overrides: [
    {
      files: ['*.test.tsx', '*.cy.ts', '*.test.ts', '*.test.js'],
      rules: {
        'max-lines': 'off'
      }
    }
  ]
};


// index.js
module.exports = {
  extends: ['./rules/standard'].map(require.resolve),
  rules: {}
};




"dependencies": {
    "eslint": "^8.3.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-config-airbnb-typescript": "^17.0.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-config-react-app": "^7.0.1",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-react": "^7.32.1",
    "eslint-plugin-simple-import-sort": "^10.0.0",
    "eslint-webpack-plugin": "^3.1.1",
    "prettier": "^2.8.7"
  },

