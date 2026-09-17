import { defineConfig, globalIgnores } from 'eslint/config';
import { globals } from 'eslint-config-zakodium';
import react from 'eslint-config-zakodium/react';
import ts from 'eslint-config-zakodium/ts';
import unicorn from 'eslint-config-zakodium/unicorn';

// openchemlib is two megabytes and does not tree-shake, so a page that only
// reads a formula must not be able to reach it by accident: exactly two files
// import it, and everything else goes through what src/dbe exposes. A type is
// erased at build time and costs the chunk nothing, so a type-only import is
// allowed. It is repeated across the two blocks below rather than written once
// on `src/**`, because a config object setting the same rule again replaces it
// for every file it matches, and the last one would win in silence.
const openchemlibConfinement = {
  group: ['openchemlib', 'openchemlib/*', 'openchemlib-utils'],
  allowTypeImports: true,
  message:
    'Only src/dbe/structure.ts and src/dbe/readMolecule.ts may import openchemlib. Expose what you need through src/dbe.',
};

const openchemlibOwners = [
  'src/dbe/structure.ts',
  'src/dbe/readMolecule.ts',
  'src/dbe/__tests__/**',
  'src/data/__tests__/**',
];

export default defineConfig(
  globalIgnores(['coverage', 'dist', 'playwright-report', 'test-results']),
  ts,
  unicorn,
  react,
  {
    files: ['vite.config.ts', 'vitest.config.ts', 'scripts/**'],
    languageOptions: { globals: { ...globals.nodeBuiltin } },
  },
  {
    files: ['src/**/*.tsx'],
    extends: [react],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@blueprintjs/core',
              importNames: ['Popover'],
              message:
                'Blueprint’s legacy Popover does not position itself under React 19: use PopoverNext.',
            },
          ],
          patterns: [openchemlibConfinement],
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: openchemlibOwners,
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [openchemlibConfinement] },
      ],
    },
  },
  {
    // The arithmetic is the part that has to be right, so it stays runnable in
    // plain Node: vitest covers it with no DOM and no mock, and a worker can
    // import it without dragging React in. `react-cheminfo/core` is
    // framework-free and stays reachable, which is what lets the domain hand
    // back the family's own result types.
    files: ['src/dbe/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'react/*',
                '@preact/signals-react',
                '@preact/signals-react/*',
                '@blueprintjs/*',
                'react-ocl',
                'react-science',
                'react-science/*',
                'react-cheminfo/ui',
                'react-cheminfo/structure',
              ],
              message:
                'src/dbe is pure domain logic: no React, no DOM, no signals. It may use react-cheminfo/core, which is framework-free.',
            },
          ],
        },
      ],
    },
  },
);
