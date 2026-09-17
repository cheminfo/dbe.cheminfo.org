/**
 * The table of bond counts, and what a link is allowed to change in it.
 *
 * Two properties carry the rest: a choice the site does not offer is ignored
 * rather than obeyed, so a link written before an option was renamed still
 * opens on a number; and the `standard` flag of an option is read back from the
 * defaults rather than written twice, so the table and the default cannot
 * drift apart.
 */

import { expect, test } from 'vitest';

import {
  DEFAULT_VALENCES,
  METAL_ELEMENTS,
  VALENCE_ELEMENTS,
  VALENCE_OPTIONS,
  VALENCE_PRESETS,
  ambiguousElements,
  isOfferedValence,
  metalsIn,
  presetOf,
  resolveValences,
} from '../valences.ts';

test('the shared table counts sulfur at two and phosphorus at three', () => {
  expect([
    DEFAULT_VALENCES.C,
    DEFAULT_VALENCES.H,
    DEFAULT_VALENCES.D,
    DEFAULT_VALENCES.N,
    DEFAULT_VALENCES.O,
    DEFAULT_VALENCES.S,
    DEFAULT_VALENCES.P,
    DEFAULT_VALENCES.Se,
    DEFAULT_VALENCES.As,
    DEFAULT_VALENCES.B,
    DEFAULT_VALENCES.Si,
    DEFAULT_VALENCES.Ca,
  ]).toStrictEqual([4, 1, 1, 3, 2, 2, 3, 2, 3, 3, 4, 2]);
  expect(DEFAULT_VALENCES.Fe).toBeUndefined();
});

test('a choice lies over the defaults and leaves everything else alone', () => {
  const expanded = resolveValences({ S: 6, P: 5 });
  expect([expanded.S, expanded.P, expanded.C, expanded.O]).toStrictEqual([
    6, 5, 4, 2,
  ]);
  expect(resolveValences()).toStrictEqual(DEFAULT_VALENCES);
  expect(resolveValences({})).toStrictEqual(DEFAULT_VALENCES);
});

test('a valence the site does not offer is ignored, not obeyed', () => {
  const nonsense = resolveValences({ S: 3, P: 9, N: 5, Fe: 6 });
  expect([nonsense.S, nonsense.P, nonsense.N, nonsense.Fe]).toStrictEqual([
    2,
    3,
    3,
    undefined,
  ]);
});

test('an element is offered exactly the valences its options list', () => {
  expect(VALENCE_ELEMENTS).toStrictEqual(['S', 'P', 'Se', 'As']);
  expect(
    VALENCE_ELEMENTS.map((symbol) =>
      (VALENCE_OPTIONS[symbol] ?? []).map((option) => option.valence),
    ),
  ).toStrictEqual([
    [2, 4, 6],
    [3, 5],
    [2, 4, 6],
    [3, 5],
  ]);
  expect([
    isOfferedValence('S', 4),
    isOfferedValence('S', 3),
    isOfferedValence('P', 5),
    isOfferedValence('N', 3),
    isOfferedValence('C', 4),
  ]).toStrictEqual([true, false, true, false, false]);
});

test('exactly one option per element is the one the table assumes', () => {
  expect(
    VALENCE_ELEMENTS.map((symbol) => {
      const options = VALENCE_OPTIONS[symbol] ?? [];
      const standard = options.filter((option) => option.standard);
      return [
        symbol,
        standard.length,
        standard[0]?.valence,
        DEFAULT_VALENCES[symbol],
      ];
    }),
  ).toStrictEqual([
    ['S', 1, 2, 2],
    ['P', 1, 3, 3],
    ['Se', 1, 2, 2],
    ['As', 1, 3, 3],
  ]);
  expect(VALENCE_OPTIONS.S?.map((option) => option.label)).toStrictEqual([
    'S(II)',
    'S(IV)',
    'S(VI)',
  ]);
  expect(VALENCE_OPTIONS.S?.[2]).toStrictEqual({
    valence: 6,
    label: 'S(VI)',
    seenIn: 'sulfone, sulfonic acid, sulfate',
    example: 'C2H6O2S',
    standard: false,
  });
});

test('the ambiguous elements of a formula are the ones a chip can change', () => {
  expect([
    ambiguousElements({ C: 2, H: 6, O: 1, S: 1 }),
    ambiguousElements({ C: 3, H: 9, O: 4, P: 1 }),
    ambiguousElements({ C: 2, H: 7, O: 4, P: 1, S: 1 }),
    ambiguousElements({ C: 6, H: 6 }),
    ambiguousElements({ S: 0 }),
  ]).toStrictEqual([['S'], ['P'], ['S', 'P'], [], []]);
});

test('a metal is named so the page can say what it assumed', () => {
  expect(METAL_ELEMENTS).toStrictEqual(['Li', 'Na', 'K', 'Ca']);
  expect([
    metalsIn({ Na: 1, Cl: 1 }),
    metalsIn({ Ca: 1, Cl: 2 }),
    metalsIn({ Li: 1, K: 1, Na: 1 }),
    metalsIn({ C: 6, H: 6 }),
  ]).toStrictEqual([['Na'], ['Ca'], ['Li', 'Na', 'K'], []]);
});

test('a preset is recognised from the choices it stands for', () => {
  expect(VALENCE_PRESETS.map((preset) => preset.id)).toStrictEqual([
    'table',
    'expanded',
  ]);
  expect(VALENCE_PRESETS[1]?.choices).toStrictEqual({
    S: 6,
    P: 5,
    Se: 6,
    As: 5,
  });
  expect([
    presetOf({}),
    presetOf({ S: 2, P: 3 }),
    presetOf({ S: 6, P: 5, Se: 6, As: 5 }),
    presetOf({ S: 4 }),
    presetOf({ S: 6, P: 5 }),
  ]).toStrictEqual(['table', 'table', 'expanded', null, null]);
});
