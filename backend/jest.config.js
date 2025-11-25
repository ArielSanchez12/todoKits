export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|qrcode|mongoose|express-validator|pusher)/)'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/server.js',
    '!src/config/**',
    '!src/middlewares/**'
  ],
  moduleFileExtensions: ['js'],
  testTimeout: 30000,
  verbose: true,
};