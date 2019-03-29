module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				corejs: '2.x'
			}
		],
		[
			'@babel/preset-react',
			{
				useBuiltIns: true
			}
		]
	]
};
