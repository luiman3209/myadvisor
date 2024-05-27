module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    clearMocks:true,
    setupFilesAfterEnv: ['./setupTests.js'],
    moduleDirectories: ["node_modules", "__mocks__"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
    coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/config/", "/routes/auth.js", "/routes/admin.js"]
  };
  