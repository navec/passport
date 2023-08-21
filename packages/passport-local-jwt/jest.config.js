/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
  // projects: ['<rootDir>/jest.unit.config.js'],
  // projects: ['<rootDir>/jest.unit.config.js', '<rootDir>/jest.e2e.config.js'],
};
