const path = require('path');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// todo, delete env, polyfill, css-loader, postcss-loader, postcss-loader, postcss-import, postcssprevenv, cssnano in package.json
module.exports = {
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    paths.appEntryJS
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      favicon: path.resolve(paths.appResources, 'favicon.png')
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
  devtool: 'source-map'
};