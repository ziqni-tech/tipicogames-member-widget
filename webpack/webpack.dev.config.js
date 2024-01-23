const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const ie11BabeLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: 'false',
          targets: {
            browsers: '> 1%, IE 11, not dead',
          },
        }
      ]
    ]
  }
};

const scssLoader = INLINE_CSS
    ? [
      {
        loader: 'style-loader',
        options: { injectType: 'styleTag' }
      },
      'css-loader',
      'sass-loader'
    ]
    : [
      {
        loader: 'file-loader',
        options: {
          name: '../css/theme/' + _THEME + '.css'
        }
      },
      'sass-loader'
    ];

module.exports = {
  entry: {
    'ziqni-member-widget.js': INLINE_CSS ? [
      './src/javascript/ziqni-member-widget.js',
    ] : [
      './src/javascript/ziqni-member-widget.js',
      './src/scss/' + _THEME + '/style.scss'
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
    openPage: 'examples/' + _THEME + '.html',
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
        use: scssLoader
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
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          precompileOptions: {
            knownHelpersOnly: false
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PRODUCTION': JSON.stringify(PRODUCTION),
      'process.env.LANG': JSON.stringify(LANG),
      'process.env.INLINE_CSS': INLINE_CSS,
      'process.env.THEME': JSON.stringify(_THEME)
    }),
    // new BundleAnalyzerPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/i18n', to: '../i18n' },
        { from: 'src/images', to: '../images' },
        { from: 'src/cl-black-theme/images', to: '../cl-black-theme/images' }
      ]
    })
  ]
};
