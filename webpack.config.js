const merge = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SVGTemplatePlugin = require('./plugins/svg-template-plugin');

function resolveApp(dir) {
	return path.resolve(__dirname, dir);
}

const paths = {
	appBuild: resolveApp('dist'),
	appClient: resolveApp('src/client'),
	appServer: resolveApp('src/server'),
	appResources: resolveApp('src/client/resources'),
	appHtml: resolveApp('src/client/index.html'),
	appEntryJS: resolveApp('src/client/entry.js')
};

const common = {
	entry: paths.appEntryJS,
	output: {
		path: path.resolve(paths.appBuild, 'static'),
		publicPath: '/',
		filename: 'photos.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				include: paths.appClient,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1
						}
					},
					'postcss-loader'
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
	},
};

if (process.env.npm_lifecycle_event === 'start') {
	module.exports = merge(common, {
		mode: 'development',
		plugins: [
			new HtmlWebpackPlugin({
				template: paths.appHtml,
				favicon: path.resolve(paths.appResources, 'favicon.png')
			})
		],
		devServer: {
			hot: true,
			inline: true,
			compress: false,
			open: true,
			port: 9090,
			publicPath: '/',
			proxy: {
				'/': 'http://localhost:3000'
			}
		}
	});
}

if (process.env.npm_lifecycle_event === 'build') {
	module.exports = merge(common, {
		mode: 'production',
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
			new CopyPlugin([{
				from: paths.appServer,
				to: path.resolve(paths.appBuild, 'server')
			}, {
				from: path.resolve(__dirname, './package.json'),
				to: path.resolve(paths.appBuild)
			}]),
			new SVGTemplatePlugin({
				template: path.resolve(__dirname, './plugins/iconsTemplate.html'),
				iconsFolder: path.resolve(paths.appResources, 'icons'),
				filename: 'icons.html'
			})
		],
	});
}
