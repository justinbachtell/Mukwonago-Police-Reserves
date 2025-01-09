import antfu from "@antfu/eslint-config";
import nextPlugin from '@next/eslint-plugin-next'
import jestDom from 'eslint-plugin-jest-dom'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import playwright from 'eslint-plugin-playwright'
import tailwind from 'eslint-plugin-tailwindcss'
import testingLibrary from 'eslint-plugin-testing-library'

export default antfu(
  {
    // General configuration
    react: true,
    typescript: true,
    ignores: [
      'migrations/**/*',
      'next-env.d.ts',
      '.next/**/*',
      'node_modules/**/*'
    ],

    lessOpinionated: true,
    isInEditor: false,

    stylistic: {
      semi: true
    },

    formatters: {
      css: true
    }
  },
  ...tailwind.configs['flat/recommended'],
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  },
  {
    files: ['**/*.test.ts?(x)'],
    ...testingLibrary.configs['flat/react'],
    ...jestDom.configs['flat/recommended']
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e.ts'],
    ...playwright.configs['flat/recommended']
  },
  {
    // Rules configuration
    rules: {
      // Disable other style rules temporarily
      'style/semi': 'off',
      'style/member-delimiter-style': 'off',
      'style/brace-style': 'off',
      'style/comma-dangle': 'off',
      'style/quote-props': 'off',
      'style/quotes': 'off',
      'style/jsx-quotes': 'off',
      'style/no-mixed-spaces-and-tabs': 'off',
      'style/no-tabs': 'off',
      'style/jsx-closing-tag-location': 'off',
      'style/indent-binary-ops': 'off',
      'style/indent': 'off',
      'style/arrow-parens': 'off',
      'style/jsx-indent-props': 'off',
      '@typescript-eslint/arrow-parens': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'style/operator-linebreak': 'off',
      'arrow-parens': 'off',
      'style/multiline-ternary': 'off',
      'style/jsx-curly-newline': 'off',
      'style/jsx-wrap-multilines': 'off',
      'style/eol-last': 'off',

      // Disable perfectionist rules temporarily
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-jsx-props': 'off',

      // Disable React-specific rules
      'react/no-unstable-context-value': 'off',
      'react-dom/no-missing-button-type': 'off',
      'react/no-array-index-key': 'off',

      // Disable other strict rules
      'antfu/no-top-level-await': 'off',
      'react/prefer-destructuring-assignment': 'off',
      'node/prefer-global/process': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'ts/no-redeclare': 'off',
      'ts/no-use-before-define': 'off',
      'react-refresh/only-export-components': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/heading-has-content': 'off',
      'react/no-dangerously-set-innerhtml': 'off',
      'react-dom/no-dangerously-set-innerhtml': 'off',
      'react/no-nested-components': 'off',
      'ts/ban-ts-comment': 'off',
      'no-console': 'off',
      'ts/consistent-type-definitions': 'off',
      'test/prefer-lowercase-title': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'ts/no-require-imports': 'warn'
    }
  }
)
