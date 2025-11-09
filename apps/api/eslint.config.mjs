// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  // Ignora el propio config y artefactos
  { 
  ignores: [
    'eslint.config.mjs',
    'jest.config.cjs',
    '**/*.cjs',
    '**/*.mjs',
    '**/*.js',
    'dist/',
    'node_modules/',
  ],
},

  // Reglas base JS
  eslint.configs.recommended,

  // Presets TS con type-check (flat)
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier (flat)
  eslintPluginPrettierRecommended,

  // Reglas y opciones específicas para nuestros .ts
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
];

