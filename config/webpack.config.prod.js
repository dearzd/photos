const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: paths.appEntryJS,
  output: {
    path: paths.appPublic,
    publicPath: '/',
    filename: 'clientBundle.js'
  },
  performance: {
    maxEntrypointSize: 1024 * 1024,
    maxAssetSize: 1024 * 1024
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: paths.appClient,
        loader: 'babel-loader',
        options: {
          presets: ['react']
        }
      },
      {
        test: /\.(js|jsx)$/,
        include: paths.appClient,
        loader: 'eslint-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        include: paths.appResources,
        use: [
          {
            loader: 'raw-loader'
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
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      favicon: path.resolve(paths.appResources, 'favicon.png'),
      minify: {
        collapseWhitespace: true
      }
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
  }
};