module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    "import/extensions": [
      2,
      "ignorePackages",
      {
        "js": true,
      }
    ],
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "camelcase": "off",
    "import/no-extraneous-dependencies": "off",
    "no-console": "off",
    // "consistent-return": "off",
  },
};
