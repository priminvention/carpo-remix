const path = require('path');
const baseConfig = require('../../scripts/baseConfig');
const { merge } = require('webpack-merge');

const context = __dirname;

module.exports = merge(baseConfig(context), {
  entry: [path.resolve(__dirname, 'view/index.tsx')],
  output: {
    filename: '[name].js',
    path: path.join(context, 'dist'),
    publicPath: '/'
  },
  devtool: process.env.BUILD_ANALYZE ? 'source-map' : false
});
