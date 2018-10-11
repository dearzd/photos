const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');

// todo, delete env, polyfill, css-loader, postcss-loader, postcss-loader, postcss-import, postcssprevenv, cssnano in package.json
module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    paths.appEntryJS
  ],
  output: {
    path: paths.appPublic,
    publicPath: '/',
    filename: 'clientBundle.js'
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
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        include: paths.appResources,
        use: [
          {
            //loader: 'raw-loader'
            loader: path.resolve(path.resolve(paths.appClient, 'utils', 'testLoader.js'))
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
      /*{
        test: /\.svg$/,
        include: paths.appResources,
        loader: 'svg-sprite-loader',
        options: {
          symbolId: 'symbol-[name]'
        }
      },*/
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
      favicon: path.resolve(paths.appResources, 'favicon.ico')
    })
  ],
  devServer: {
    contentBase: paths.appHtml,
    hot: true,
    compress: true,
    proxy: {
      '/': 'http://localhost:3000'
    }
  },
  devtool: 'source-map',
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