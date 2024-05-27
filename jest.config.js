module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/advisor.test.js'],
    clearMocks:true,
    setupFilesAfterEnv: ['./setupTests.js'],
    moduleDirectories: ["node_modules", "__mocks__"]
  };
  