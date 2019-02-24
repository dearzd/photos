const merge = require('webpack-merge');
const devConfig = require('./webpack.config.dev');
const prodConfig = require('./webpack.config.prod');
const path = require('path');
const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = {
  mode: process.env.NODE_ENV,
  output: {
    path: path.resolve(paths.appBuild, 'static'),
    publicPath: '/',
    filename: 'client.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: paths.appClient,
        loader: 'babel-loader',
        options: {
          presets: ['react']
          //plugins: ['transform-object-rest-spread']
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        include: paths.appResources,
        use: [
          {
            loader: 'svg-children-loader',
            options: {
              extractAttributes: ['viewBox']
            }
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                {removeTitle: true},
                {removeStyleElement: true},
                {removeAttrs: {attrs: '(stroke|fill|class)'}},
                {removeDimensions: true},
                {removeUselessDefs: true},
                {removeViewBox: false},
                {convertPathData: true}
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ],
  resolve: {
    extensions: ['.js', '.css', '.svg'],
    alias: {
      containers: path.resolve(paths.appClient, 'containers'),
      components: path.resolve(paths.appClient, 'components'),
      actions: path.resolve(paths.appClient, 'actions'),
      reducers: path.resolve(paths.appClient, 'reducers'),
      utils: path.resolve(paths.appClient, 'utils'),
      style: path.resolve(paths.appClient, 'style'),
      resources: paths.appResources
    }
  },
};

if (process.env.npm_lifecycle_event=== 'start') {
  module.exports = merge(common, devConfig);
}

if (process.env.npm_lifecycle_event=== 'build') {
  module.exports = merge(common, prodConfig);
}