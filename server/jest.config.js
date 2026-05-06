module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/middlewares/**/*.ts',
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
};
