import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      'src/components/ui/**/*.tsx',
      'src/components/animate-ui/**/*.tsx',
      'src/app/routes.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Vendored from Animate UI; kept as published.
    files: ['src/hooks/use-controlled-state.tsx', 'src/lib/get-strict-context.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
)
