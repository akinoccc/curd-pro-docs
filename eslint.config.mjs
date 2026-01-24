import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vitest: true,
  vue: true,
  ignores: [
    '**/node_modules/*',
    '**/dist/*',
    '**/.eslint-auto-import.mjs',
    '**/auto-imports.d.ts',
    '**/components.d.ts',
    '**/vite.config.ts.timestamp*',
    '**/.pnpm-store/*',
    '**/locales/**.json',
    '**/language/**.json',
    '**/.gitea/*',
    '**/version.json',
    'apps/api/generated/**',
    'apps/api/prisma/migrations/**',
  ],
}).overrideRules({
  'unused-imports/no-unused-imports': 'warn',
  'antfu/no-top-level-await': 'off',
  'vue/no-dupe-keys': 'off',
  'vue/html-indent': ['error', 2],
  'vue/max-attributes-per-line': ['error', {
    singleline: {
      max: 1,
    },
    multiline: {
      max: 1,
    },
  }],
  'vue/first-attribute-linebreak': ['error', {
    singleline: 'beside',
    multiline: 'below',
  }],
  'ts/no-use-before-define': 'off',
  'ts/no-non-null-asserted-optional-chain': 'warn',
  'no-console': 'off',
  'no-new': 'off',
  'unused-imports/no-unused-vars': 'warn',
  'jsonc/sort-keys': 'off',
  'node/handle-callback-err': 'off',
  'ts/no-unsafe-function-type': 'off',
  'node/prefer-global/process': 'off',

  'vue/component-name-in-template-casing': ['error', 'PascalCase', {
    registeredComponentsOnly: false,
    ignores: [],
  }],
})
