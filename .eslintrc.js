module.exports = {
  parser: '@babel/eslint-parser',
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Add custom rules here
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
