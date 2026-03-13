module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    'index.js',
    '!lib/**/*.test.js'
  ],
  coverageThreshold: {
    // 全局阈值：目前只有 cookie-store 有测试，其他模块待补充
    'lib/storage/cookie-store.js': {
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
