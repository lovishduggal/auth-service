/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageProvider: 'v8',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/*.ts', // Exclude specific file
        '!src/config/index.ts', // Exclude specific file
        '!tests/**',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'html', 'lcov'],
};
