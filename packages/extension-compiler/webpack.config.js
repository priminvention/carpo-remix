// @ts-check

'use strict';

const path = require('path');
const findPackages = require('../../scripts/findPackages');

function createWebpack() {
  const context = __dirname;

  const alias = findPackages().reduce((alias, { dir, name }) => {
    alias[name] = path.resolve(context, `../${dir}/src`);

    return alias;
  }, {});

  /** @type {import('webpack').Configuration} */
  const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
      // the bundle is stored in the 'build' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
      path: path.resolve(__dirname, 'build'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2'
    },
    devtool: 'nosources-source-map',
    externals: {
      vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
      // modules added here also need to be added in the .vsceignore file
    },
    resolve: {
      alias: {
        ...alias
      },
      extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(js|mjs|ts|tsx)$/,
          use: [
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: require('@patract/dev/config/babel')
            }
          ]
        }
      ]
    }
  };

  return config;
}

module.exports = createWebpack;
