import { aboutProblems, resolveAbout } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ABOUT } from '../about.ts';

test('the About record is short enough for anyone to read it', () => {
  expect(aboutProblems(ABOUT)).toStrictEqual([]);
});

test('what a visitor can do here is six lines, each starting on a verb', () => {
  expect(ABOUT.can).toHaveLength(6);
  expect(ABOUT.can[0]).toBe(
    'Type a formula and read its DBE, with every element’s contribution shown.',
  );
  expect(ABOUT.can[5]).toBe(
    'Print the contribution table and the valence rules.',
  );
});

test('every borrowed work the site runs on is named, and resolves', () => {
  expect(ABOUT.credits).toStrictEqual([
    'openchemlib',
    'openchemlib-utils',
    'mass-tools',
    'react-mf',
    'react-ocl',
    'ml-xsadd',
    'katex',
    'blueprint',
    'react',
    'vite',
    'react-cheminfo',
    'cheminfo-font',
  ]);

  const about = resolveAbout(ABOUT);

  expect(about.credits.map((credit) => credit.name)).toStrictEqual([
    'OpenChemLib',
    'openchemlib-utils',
    'mass-tools',
    'react-mf',
    'react-ocl',
    'ml-xsadd',
    'KaTeX',
    'Blueprint',
    'React',
    'Vite',
    'react-cheminfo',
    'cheminfo-font',
  ]);
  expect(about.license).toBe('MIT');
  expect(about.repository).toBe('https://github.com/cheminfo/dbe.cheminfo.org');
  expect(about.issues).toBe(
    'https://github.com/cheminfo/dbe.cheminfo.org/issues',
  );
});

test('the formula parser is credited under mass-tools, its own home', () => {
  // `mf-parser` is what reads the formula, and the shared registry names the
  // repository it is published from rather than the package.
  expect(ABOUT.credits).not.toContain('mf-parser');
  expect(ABOUT.credits).toContain('mass-tools');
});

test('why DBE is worth taking off a formula, and where the rule breaks', () => {
  expect(ABOUT.paragraphs).toHaveLength(2);
  expect(ABOUT.paragraphs?.[0]).toContain('rings and pi bonds together');
  expect(ABOUT.paragraphs?.[1]).toContain(
    'every sulfur is divalent and every phosphorus trivalent',
  );
});

test('the platform and the teaching are what the site asks to be cited', () => {
  expect(ABOUT.cite?.map((work) => work.reference.doi)).toStrictEqual([
    '10.2533/chimia.2025.66',
    '10.2533/chimia.2023.683',
  ]);
});
