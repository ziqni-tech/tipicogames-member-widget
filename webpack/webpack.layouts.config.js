const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// var scssTheme = new RegExp(_THEME + "/.*.scss");
// var layoutsScssTheme = new RegExp("layouts" + "/.*.scss");
module.exports = {
  entry: {
    'ziqni-member-widget.js': [
      './src/javascript/ziqni-member-widget.js',
      './src/scss/' + _THEME + '/style.scss',
      './src/scss/layouts/style.scss'
    ],
    'ziqni-member-widget-selfinit.js': './src/javascript/ziqni-member-widget-selfinit.js',
    'loader.js': './src/javascript/loader.js'
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, '../build/javascript')
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    port: devServer.port,
    contentBase: path.join(__dirname, '..'),
    openPage: 'examples/layouts.html?theme=' + _THEME,
    writeToDisk: true
  },
  optimization: {
    minimize: false
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 600
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|jsSHA\.js)/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|tests)/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/i,
        include: [
          path.resolve(__dirname, '../src/scss/' + _THEME)
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '../css/theme/' + _THEME + '.css'
              // name: '../css/theme/[name].css'
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.scss$/i,
        include: [
          path.resolve(__dirname, '../src/scss/layouts')
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '../css/theme/layouts.css'
              // name: '../css/theme/[name].css'
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'svg-url-loader',
        query: {
          limit: 8192,
          mimetype: 'application/svg+xml'
        }
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader',
        query: {
          limit: 8192
        }
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PRODUCTION': JSON.stringify(PRODUCTION),
      'process.env.LANG': JSON.stringify(LANG),
      'process.env.INLINE_CSS': INLINE_CSS,
      'process.env.THEME': JSON.stringify(_THEME)
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/i18n', to: '../i18n' },
        { from: 'src/images', to: '../images' }
      ]
    })
  ]
};
