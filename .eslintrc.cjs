/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	parserOptions: {
		project: 'tsconfig.json',
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},

	// Base config
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	rules: {
		// prettier has some issues with tabs
		'no-mixed-spaces-and-tabs': 'off',

		// eslint has some trouble with prettier semi: false
		'no-extra-semi': 'off',

		// throw responses
		'@typescript-eslint/no-throw-literal': 'off',

		// it's easier to make some functions async even if they do not use await
		'@typescript-eslint/require-await': 'off',

		// it is forbidden but sometimes it makes sense
		'@typescript-eslint/no-non-null-assertion': 'off',

		// it is used by URLSearchParams
		// https://github.com/typescript-eslint/typescript-eslint/issues/5323
		'@typescript-eslint/restrict-template-expressions':
			'off',

		// Too many bugs have been introduced by this
		// it resolves nothing to remove ?.
		'@typescript-eslint/no-unnecessary-condition': 'off',

		// it cannot be used by functions that receives promises like db.$transaction
		'@typescript-eslint/no-floating-promises': 'off',
	},

	overrides: [
		// React
		{
			files: ['**/*.{js,jsx,ts,tsx}'],
			plugins: ['react', 'jsx-a11y'],
			extends: [
				'plugin:react/recommended',
				'plugin:react/jsx-runtime',
				'plugin:react-hooks/recommended',
				'plugin:jsx-a11y/recommended',
			],
			settings: {
				react: {
					version: 'detect',
				},
				formComponents: ['Form'],
				linkComponents: [
					{name: 'Link', linkAttribute: 'to'},
					{name: 'NavLink', linkAttribute: 'to'},
				],
				'import/resolver': {
					typescript: {},
				},
			},
			rules: {
				'jsx-a11y/label-has-associated-control': [
					2,
					{
						labelComponents: ['Label'],
						controlComponents: ['Input', 'Select'],
						depth: 3,
					},
				],
			},
		},

		// Typescript
		{
			files: ['**/*.{ts,tsx}'],
			plugins: ['@typescript-eslint', 'import'],
			parser: '@typescript-eslint/parser',
			settings: {
				'import/internal-regex': '^~/',
				'import/resolver': {
					node: {
						extensions: ['.ts', '.tsx'],
					},
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
			],
			rules: {
				// unnecessary, also shadcn-ui has some issues
				'react/prop-types': 'off',
			},
		},

		// Node
		{
			files: ['.eslintrc.js'],
			env: {
				node: true,
			},
		},
	],
}
