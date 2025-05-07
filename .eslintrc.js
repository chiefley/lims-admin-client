module.exports = {
  extends: ['react-app', 'react-app/jest'],
  plugins: ['import', 'unused-imports'],
  rules: {
    // Original rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/self-closing-comp': 'warn',

    // New import/export related rules
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'import/order': [
      'warn',
      {
        groups: [
          'builtin', // Node.js built-in modules
          'external', // Packages from node_modules
          'internal', // Imports from your internal paths set up in tsconfig
          'parent', // Imports from parent directories
          'sibling', // Imports from sibling files
          'index', // Index file imports
          'object', // Object imports
          'type', // Type imports
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // Ensure imports point to files/modules that can be resolved
    'import/no-unresolved': 'off', // TypeScript takes care of this
    // Make sure named imports correspond to named exports in the referenced module
    'import/named': 'error',
    // Ensure default import names match the name of the exported default in the referenced module
    'import/default': 'error',
    // Ensure imported namespaces contain the properties being used
    'import/namespace': 'error',
    // Prevent importing the default as if it were named
    'import/no-named-as-default': 'warn',
    // Prevent importing names that don't exist in the imported module
    'import/no-named-as-default-member': 'warn',
    // Prevent importing packages with side effects when you don't use any export
    'import/no-unused-modules': 'warn',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {}, // This uses tsconfig.json paths
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
