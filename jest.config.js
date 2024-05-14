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
        '!src/server.ts',
        '!src/config/index.ts',
        '!tests/**',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'html', 'lcov'],
};
