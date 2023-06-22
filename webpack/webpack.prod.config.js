const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const scssLoader = INLINE_CSS
    ? [
      { loader: 'style-loader', options: { injectType: 'styleTag' } },
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
    'loader.js': './src/javascript/loader.js',
    'index.js': './src/javascript/index.js'
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, '../build/javascript'),
    library: 'member-widget',
    libraryTarget: 'umd'
  },
  // output: {
  //   filename: '[name]',
  //   path: path.resolve(__dirname, '../build/javascript')
  // },
  mode: 'production', // production | development
  optimization: {
    minimize: true
  },
  watch: false,
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
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread']
          }
        }
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
    }),
    {
      apply: (compiler) => {
        const buildPath = compiler.options.output.path;

        // hook name
        compiler.hooks.assetEmitted.tap('assetEmittedPlugin', (file, { content, source, outputPath, compilation, targetPath }) => {
          if (file.indexOf(".css") > -1) {
            const fileParts = file.split('/');
            const fileName = fileParts[fileParts.length -1];

            fs.copyFile(buildPath + '/' + file, __dirname + "/../gamification-ux-package-examples/themes/css/theme/" + fileName, function (){});
          }
        });
      }
    }
  ]
};
