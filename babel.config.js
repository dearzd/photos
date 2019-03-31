module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				corejs: 3,
				debug: true,
			}
		],
		'@babel/preset-react'
	],
	plugins: [
		'@babel/plugin-transform-runtime'
	]
};
