import js from '@eslint/js';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import configPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

// 如果同一個檔案適用多個規則，則適用最後一個
export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          presets: ['@babel/preset-react'],
        },
      },
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: pluginReact.configs.flat['jsx-runtime'],
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  configPrettier,
  {
    // Note: there should be no other properties in this object
    ignores: [
      '**/.*',
      'node_modules/*',
      'public/*',
      'dist/*',
      'build/*',
      '.vite/*',
    ],
  },
]);
