const config = require('@patract/dev/config/babel');

module.exports = {
  ...config,
  plugins: [
    ...config.plugins,
    [
      'import',
      {
        libraryName: 'antd',
        style: true
      }
    ]
  ]
};
