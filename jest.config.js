module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.ts'],
  transform: {
    '^.+.tsx?$': ['ts-jest', { useESM: true }],
  },
  testTimeout: 30000,
  maxConcurrency: 1,
  // setupFilesAfterEnv: ["<rootDir>/lib/setupTests.ts"],
  reporters: [
    'default',
    ['./node_modules/jest-html-reporter', {
      pageTitle: 'E2E Test Report',
      outputPath: '/tmp/test-report.html',
      includeFailureMsg: true,
      includeStackTrace: false
    }],
  ],
}
