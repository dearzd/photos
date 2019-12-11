module.exports = {
	plugins: {
		'postcss-import': {},
		'postcss-preset-env': {
			features: {
				'nesting-rules': true
			},
			importFrom: 'src/client/style/vars.css'
		},
		'cssnano': {}
	}
};
