module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'services/**/src/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapping: {
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  }
};