module.exports = {
  clearMocks: true,
  coverageDirectory: '../coverage',
  resetMocks: true,
  restoreMocks: true,
  rootDir: './src',
  testEnvironment: 'node',
  preset: 'ts-jest',
  transformIgnorePatterns: ["node_modules/(?!((@open-rpc/spec-types|@open-rpc/spec))/)"],
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: { allowJs: true } }],
  },

};
