module.exports = {
	roots: ['<rootDir>/src'],
	projects: ['<rootDir>'],
	preset: 'ts-jest',
	moduleFileExtensions: ['js', 'ts'],
	moduleNameMapper: {
		'(.+).js$': '$1',
	},
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
			},
		],
	},
	testMatch: ['**/__tests__/**/*.spec.(ts|js)'],
	testEnvironment: 'node',
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	coverageDirectory: './coverage/',
	collectCoverage: false,
	// verbose: true,
}
