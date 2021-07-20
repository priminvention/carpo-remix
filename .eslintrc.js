const base = require('@patract/dev/config/eslint');

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  plugins: [...base.plugins, 'header', 'react-hooks', 'sort-destructure-keys', 'simple-import-sort'],
  ignorePatterns: [
    '.eslintrc.js',
    '.github/**',
    '.vscode/**',
    '.yarn/**',
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json']
  },
  extends: [...base.extends, 'plugin:react/recommended', 'plugin:prettier/recommended'],
  rules: {
    ...base.rules,
    // required as 'off' since typescript-eslint has own versions
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    indent: 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/indent': 'off',
    // specific overrides
    'default-param-last': [0], // conflicts with TS version (this one doesn't allow TS ?)
    'react/prop-types': [0], // this is a completely broken rule
    'padding-line-between-statements': [
      1,
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: 'try', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' }
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-sort-props': [
      1,
      {
        noSortAlphabetically: false
      }
    ],
    'sort-destructure-keys/sort-destructure-keys': [
      1,
      {
        caseSensitive: true
      }
    ],
    // needs to be switched on at some point
    '@typescript-eslint/no-explicit-any': 'off',
    // this seems very broken atm, false positives
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'header/header': 'off',
    'object-curly-newline': 'off',
    'sort-keys': 'off',
    'simple-import-sort/imports': [2, {
      groups: [
        ['^\u0000'], // all side-effects (0 at start)
        ['\u0000$', '^@polkadot.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
        ['^[^/\\.]'], // non-polkadot
        ['^@polkadot'], // polkadot
        ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'] // local (. last)
      ]
    }],
  },
  settings: {
    ...base.settings,
    react: {
      version: 'detect'
    }
  }
};
