module.exports = {
    // preset: 'jest-environment-obsidian',
    // testEnvironment: 'jest-environment-obsidian',
    preset: 'ts-jest',
    testEnvironment: 'node',
    
    testMatch: ['**/*.test.ts'],
    setupFiles: ['<rootDir>/setupTests.js'],
    moduleDirectories: [ '', 'src' ]
};