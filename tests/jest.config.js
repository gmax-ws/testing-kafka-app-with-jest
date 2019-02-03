const config = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  roots: [
    '<rootDir>/src'
  ],
  verbose: true,
  testEnvironment: 'node'
};

module.exports = config;
