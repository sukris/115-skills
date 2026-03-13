module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    'index.js',
    '!lib/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/test/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html']
};
