import { beforeEach, expect, test } from 'vitest';

import { DISPLAY_FLAGS, DISPLAY_FLAG_KEYS } from '../displayFlags.ts';
import { COUNT_RANGE, SEED_RANGE } from '../ranges.ts';
import {
  DEFAULT_TAB,
  NAV_TAB_IDS,
  TAB_IDS,
  TAB_LABELS,
  isTabId,
} from '../tabs.ts';
import {
  adoptStructureFormula,
  clearCalculator,
  loadStructure,
  resetValences,
  setCount,
  setFormula,
  setSeed,
  setStructure,
  setValence,
  view,
} from '../view.ts';

beforeEach(() => {
  clearCalculator();
  resetValences();
});

test('the bar lists four pages, and the site routes five', () => {
  expect(NAV_TAB_IDS).toStrictEqual([
    'calculator',
    'learn',
    'exercises',
    'reference',
  ]);
  expect(TAB_IDS).toHaveLength(5);
  expect(TAB_IDS.at(-1)).toBe('about');
  expect(DEFAULT_TAB).toBe('calculator');
  expect(Object.keys(TAB_LABELS)).toHaveLength(5);
});

test('a page name is narrowed, and a near miss is refused', () => {
  expect(isTabId('calculator')).toBe(true);
  expect(isTabId('exercises')).toBe(true);
  expect(isTabId('exercise')).toBe(false);
  expect(isTabId('')).toBe(false);
});

test('the three layers are named once, and the working is on by default', () => {
  expect(DISPLAY_FLAG_KEYS).toStrictEqual([
    'breakdown',
    'highlight',
    'hydrogens',
  ]);
  expect(DISPLAY_FLAGS.map((meta) => meta.key)).toStrictEqual([
    ...DISPLAY_FLAG_KEYS,
  ]);
  expect(
    DISPLAY_FLAGS.filter((meta) => meta.initial).map((meta) => meta.key),
  ).toStrictEqual(['breakdown', 'highlight']);
});

test('the formula box follows the drawing until the student types in it', () => {
  setStructure('CS(C)=O', 'C2H6OS');

  expect(view.calculator.structure.value).toBe('CS(C)=O');
  expect(view.calculator.formula.value).toBe('C2H6OS');

  setFormula('C2H6O2S');

  expect(view.calculator.formulaSource.value).toBe('typed');

  // The next stroke leaves the typed formula alone: it is the input the
  // comparison on screen is about.
  setStructure('CS(C)(=O)=O', 'C2H6O2S');

  expect(view.calculator.formula.value).toBe('C2H6O2S');

  adoptStructureFormula('C2H6O2S');

  expect(view.calculator.formulaSource.value).toBe('structure');
});

test('the canvas is reloaded by a link or a click, never by a stroke', () => {
  const start = view.calculator.editorRevision.value;

  setStructure('c1ccccc1');

  expect(view.calculator.editorRevision.value).toBe(start);

  loadStructure('c1ccccc1');

  expect(view.calculator.editorRevision.value).toBe(start + 1);

  clearCalculator();

  expect(view.calculator.editorRevision.value).toBe(start + 2);
  expect(view.calculator.structure.value).toBe('');
  expect(view.calculator.formula.value).toBe('');
});

test('a formula or a structure longer than a link may carry is cut', () => {
  setFormula('C'.repeat(300));

  expect(view.calculator.formula.value).toHaveLength(200);

  loadStructure('C'.repeat(500));

  expect(view.calculator.structure.value).toHaveLength(400);
});

test('a valence is chosen per element, and put back all at once', () => {
  setValence('S', 6);
  setValence('P', 5);

  expect(view.valences.value).toStrictEqual({ S: 6, P: 5 });

  resetValences();

  expect(view.valences.value).toStrictEqual({});
});

test('a number a control asks for beyond the ceiling is clamped there too', () => {
  setCount(400);

  expect(view.exercises.count.value).toBe(COUNT_RANGE.maximum);

  setCount(0);

  expect(view.exercises.count.value).toBe(COUNT_RANGE.minimum);

  setCount(Number.NaN);

  expect(view.exercises.count.value).toBe(COUNT_RANGE.initial);

  setSeed(-5);

  expect(view.exercises.seed.value).toBe(SEED_RANGE.minimum);

  // No seed at all is not seed zero: it is the curated deck rather than a
  // generated series.
  setSeed(null);

  expect(view.exercises.seed.value).toBe(null);
});
