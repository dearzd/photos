module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				corejs: {
					version: 3,
					proposals: false /* EcmaScript proposals, default is false */
				},
				debug: false,
			}
		],
		'@babel/preset-react'
	],
	plugins: [
		'@babel/plugin-transform-runtime'
	]
};
