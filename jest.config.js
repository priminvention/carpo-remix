const config = require('@patract/dev/config/jest');
const fs = require('fs');

module.exports = {
  ...config,
  modulePathIgnorePatterns: ['<rootDir>/build'].concat(
    fs
      .readdirSync('packages')
      .filter((p) => fs.statSync(`packages/${p}`).isDirectory())
      .map((p) => `<rootDir>/packages/${p}/build`)
  ),
  moduleNameMapper: {
    'carpo-core(.*)$': '<rootDir>/packages/extension-core/src/$1',
    'carpo-compiler(.*)$': '<rootDir>/packages/extension-compiler/src/$1',
    'carpo-helper(.*)$': '<rootDir>/packages/helper/src/$1',
    '@carpo-remix/common(.*)$': '<rootDir>/packages/common/src/$1',
    '@carpo-remix/config(.*)$': '<rootDir>/packages/config/src/$1',
    '@carpo-remix/utils(.*)$': '<rootDir>/packages/utils/src/$1',
    '@carpo-remix/react-components(.*)$': '<rootDir>/packages/react-components/src/$1'
  },
  testTimeout: 30000
};
