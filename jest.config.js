module.exports = {
  projects: [
    {
      displayName: 'web',
      testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: '<rootDir>/apps/web',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'api',
      testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>/apps/api',
      moduleNameMapper: {
        '^@api/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'shared',
      testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>/packages/shared',
    },
  ],
  collectCoverageFrom: [
    'apps/**/src/**/*.{ts,tsx}',
    'packages/**/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
