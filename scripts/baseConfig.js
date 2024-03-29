const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { getThemeVariables } = require('antd/dist/theme');

const findPackages = require('./findPackages');

const NODE_ENV = process.env.NODE_ENV || 'development';

function createWebpack(context) {
  const alias = findPackages().reduce((alias, { dir, name }) => {
    alias[name] = path.resolve(context, `../${dir}/src`);

    return alias;
  }, {});
  const plugins = fs.existsSync(path.join(context, 'public'))
    ? new CopyWebpackPlugin({ patterns: [{ from: 'public' }] })
    : [];

  /** @type {import('webpack').Configuration} */
  const config = {
    context,
    mode: NODE_ENV === 'development' ? 'development' : 'production',
    module: {
      rules: [
        {
          include: /node_modules/,
          test: /\.mjs$/,
          type: 'javascript/auto'
        },
        {
          include: /node_modules/,
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, require.resolve('css-loader')]
        },
        {
          test: /\.less/,
          use: [
            MiniCssExtractPlugin.loader,
            require.resolve('css-loader'),
            {
              loader: require.resolve('less-loader'),
              options: {
                lessOptions: {
                  modifyVars: {
                    ...getThemeVariables({
                      dark: true,
                      compact: true
                    }),
                    'body-background': 'transparent'
                  },
                  javascriptEnabled: true
                }
              }
            }
          ]
        },
        {
          exclude: /node_modules/,
          test: /\.tsx?$/,
          use: [
            'cache-loader',
            {
              loader: 'thread-loader',
              options: {
                workers: require('os').cpus().length - 1
              }
            },
            {
              loader: require.resolve('babel-loader'),
              options: require('../babel.config')
            }
          ]
        },
        {
          test: /\.md$/,
          use: [require.resolve('html-loader'), require.resolve('markdown-loader')]
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                esModule: false,
                name: 'static/[name].[contenthash:8].[ext]'
              }
            }
          ]
        },
        {
          test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                esModule: false,
                name: 'static/[name].[contenthash:8].[ext]'
              }
            }
          ]
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
          use: [
            {
              loader: require.resolve('null-loader')
            }
          ]
        }
      ]
    },
    node: {
      __dirname: false,
      __filename: false
    },
    performance: {
      hints: false
    },
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all'
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    plugins: [
      // new webpack.ProvidePlugin({
      //   Buffer: ['buffer', 'Buffer'],
      //   process: 'process/browser.js'
      // }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(NODE_ENV)
        }
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ].concat(plugins),
    resolve: {
      alias: {
        ...alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify')
      }
    }
  };

  return config;
}

module.exports = createWebpack;
