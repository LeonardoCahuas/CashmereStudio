

export const env = {
  es6: true,
  node: true, // Includi l'ambiente Node.js
};
export const parserOptions = {
  ecmaVersion: 2018,
};
export const rules = {
  'no-restricted-globals': ['error', 'name', 'length'],
  'prefer-arrow-callback': 'error',
  quotes: ['error', 'double', { allowTemplateLiterals: true }],
};
export const overrides = [
  {
    files: ['**/*.spec.*'],
    env: {
      mocha: true,
    },
    rules: {},
  },
];
export const globals = {};
