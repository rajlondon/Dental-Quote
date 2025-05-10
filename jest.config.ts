import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '@shared/(.*)': '<rootDir>/shared/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;