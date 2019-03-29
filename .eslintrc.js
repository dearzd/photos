module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:react/recommended'
	],
	plugins: [
		"react"
	],
	settings: {
		react: {
			version: '16.8.6'
		}
	},
	parser: 'babel-eslint',
	env: {
		browser: true,
		es6: true,
		node: true
	},
	rules: {
		'no-console': 'off',
		semi: [
			'error',
			'always'
		],
		quotes: [
			'error',
			'single'
		]
	}
};
