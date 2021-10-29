const path = require('path');
const glob = require('glob');
const { getThemeVariables } = require('antd/dist/theme');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const findPackages = require('./findPackages');

const DEV_ENV = process.env.NODE_ENV === 'development';

console.log('DEV_ENV', DEV_ENV);
const BUILD_TYPE = process.env.BUILD_TYPE;

const alias = findPackages().reduce((alias, { dir, name }) => {
  alias[name] = path.resolve(__dirname, `../packages/${dir}/src`);

  return alias;
}, {});

const entries = (function () {
  const obj = {};
  const buildPaths =
    BUILD_TYPE === 'view' ? glob.sync(`packages/extension-*/view`) : glob.sync(`packages/extension-*/src`);

  buildPaths.forEach((path) => {
    const name = path.split('/')[1];
    const entryName = `${name}/${BUILD_TYPE}`;

    obj[entryName] = `./${path}`;
  });

  return obj;
})();

module.exports = function () {
  return {
    target: BUILD_TYPE === 'view' ? 'web' : 'node',
    entry: entries,

    output: {
      path: path.resolve(__dirname, '../packages'),
      filename: (pathData) => {
        const pkg = pathData.chunk.name.split('/')[0];

        if (pathData.chunk.name.indexOf('view') > -1) return `${pkg}/build/view.js`;

        return `${pkg}/build/extension.js`;
      },
      library: {
        type: 'umd'
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            'cache-loader',
            {
              loader: 'thread-loader',
              options: {
                workers: require('os').cpus().length - 1,
                poolTimeout: Infinity
              }
            },
            {
              loader: 'babel-loader',
              options: require('../babel.config')
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
                happyPackMode: true
              }
            }
          ]
        },
        {
          test: /\.less$/,
          // exclude: /node_modules/,
          use: [
            DEV_ENV ? 'style-loader' : MiniCssExtractPlugin.loader,
            'cache-loader',
            'css-loader',
            {
              loader: 'less-loader',
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
          include: /node_modules/,
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, require.resolve('css-loader')]
        },
        {
          test: /.(png|jpe?g|gif|svg|webp)$/,
          use: [
            'cache-loader',
            {
              loader: 'url-loader',
              options: {
                limit: 8 * 1024,
                name: DEV_ENV ? 'imgs/[name].[ext]' : 'statics/imgs/[name].[hash:5].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          use: [
            'cache-loader',
            {
              loader: 'url-loader',
              options: {
                query: {
                  limit: 10000,
                  name: DEV_ENV ? 'fonts/[name].[ext]' : 'statics/fonts/[name].[hash:5].[ext]'
                }
              }
            }
          ]
        }
      ]
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        ...alias
        // 'react-dom': '@hot-loader/react-dom'
      },
      symlinks: false
    },

    externals: {
      vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
      // modules added here also need to be added in the .vsceignore file
    },

    stats: 'errors-only',

    plugins: [
      // new HtmlWebpackPlugin({
      //   filename: 'index.html',
      //   template: 'index.html',
      //   cdnPath: config.cdnPath,
      //   minify: {
      //     removeComments: true,
      //     collapseWhitespace: true
      //   }
      // }),
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }),
      new MiniCssExtractPlugin({
        filename: (pathData) => {
          const pkg = pathData.chunk.name.split('/')[0];

          if (pathData.chunk.name.indexOf('view') > -1) return `${pkg}/build/view.css`;

          return `${pkg}/build/extension.css`;
        },
        chunkFilename: DEV_ENV ? '/css/[name].css' : 'statics/css/[name].[contenthash:5].css'
      })
    ]
  };
};
