import js from '@eslint/js'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import tseslint from 'typescript-eslint'

// ESLint allows one severity per rule, and we want two thresholds: a nudge at
// 300 lines and a hard stop at 800. So the core `max-lines` rule is registered
// a second time under a local plugin name and each copy gets its own limit.
const fileSize = {
  rules: { 'max-lines': builtinRules.get('max-lines') },
}

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/.turbo/**', '**/next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'file-size': fileSize },
    rules: {
      'file-size/max-lines': ['warn', { max: 300 }],
      'max-lines': ['error', { max: 800 }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
