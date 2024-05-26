/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		},

		{
			files: ['*.ts'],
			rules: {
				'semi': [2, "always"],
				'@typescript-eslint/no-unused-vars': 0,
				'@typescript-eslint/no-explicit-any': 0,
				'@typescript-eslint/explicit-module-boundary-types': 0,
				'@typescript-eslint/no-non-null-assertion': 0,
				'@typescript-eslint/ban-types': [
					'error',
					{
						"types": {
							"{}": false,
						}
					}
				],
				"prefer-const": 'warn',
				'no-inner-declarations': 'off'
			}
		}
	],
	rules: {
		'semi': [2, "always"],
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/ban-types': [
			'error',
			{
				"types": {
					"{}": false,
				}
			}
		],
		"prefer-const": 'warn',
		'no-inner-declarations': 'off'
	}

};
