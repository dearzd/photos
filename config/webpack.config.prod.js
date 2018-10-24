const path = require('path');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SVGTemplatePlugin = require('../plugins/svg-template-plugin');

module.exports = {
  entry: paths.appEntryJS,
  performance: {
    maxEntrypointSize: 1024 * 1024,
    maxAssetSize: 1024 * 1024
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: paths.appClient,
        loader: 'eslint-loader',
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      favicon: path.resolve(paths.appResources, 'favicon.png'),
      hash: true,
      minify: {
        collapseWhitespace: true
      }
    }),
    new SVGTemplatePlugin({
      template: path.resolve(__dirname, '../plugins/iconsTemplate.html'),
      iconsFolder: path.resolve(paths.appResources, 'icons'),
      filename: 'icons.html'
    })
  ],
};