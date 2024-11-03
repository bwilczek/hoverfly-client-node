module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.ts'],
  transform: {
    '^.+.tsx?$': ['ts-jest', { useESM: true }],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/utils/",
  ],
  testTimeout: 30000,
  maxConcurrency: 1,
  // setupFilesAfterEnv: ["<rootDir>/tests/utils/setup.ts"],
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
