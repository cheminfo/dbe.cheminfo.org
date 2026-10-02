/**
 * What a formula is read at, and when it has to be said.
 *
 * A question showing C2H6OS and saying nothing has not asked anything
 * answerable: the number is 0 at S(II) and 1 at S(IV). So the assumption is
 * data the card prints, and these are the cases it is printed for.
 */

import { expect, test } from 'vitest';

import {
  assumptionText,
  chosenAssumptions,
  valenceAssumptions,
  valenceLabel,
} from '../assumptions.ts';

test('only an element whose valence is a choice is an assumption', () => {
  expect(valenceAssumptions('C9H8O4')).toStrictEqual([]);
  expect(valenceAssumptions('C8H10N4O2')).toStrictEqual([]);
  expect(valenceAssumptions('C7H5F3')).toStrictEqual([]);
});

test('sulfur and phosphorus are named, at the valence in force', () => {
  expect(valenceAssumptions('C2H6OS')).toStrictEqual([
    { symbol: 'S', valence: 2, chosen: false },
  ]);
  expect(valenceAssumptions('C2H6OS', { S: 4 })).toStrictEqual([
    { symbol: 'S', valence: 4, chosen: true },
  ]);
  expect(valenceAssumptions('H3O4P', { P: 5 })).toStrictEqual([
    { symbol: 'P', valence: 5, chosen: true },
  ]);
});

test('a formula the rule cannot read assumes nothing', () => {
  expect(valenceAssumptions('')).toStrictEqual([]);
  expect(valenceAssumptions('Zz2')).toStrictEqual([]);
});

test('the clause and the label are what a card prints', () => {
  const assumed = valenceAssumptions('C2H6O5PS', { S: 6, P: 5 });
  expect(assumed.map(valenceLabel)).toStrictEqual(['P(V)', 'S(VI)']);
  expect(assumptionText(assumed)).toBe('the P as P(V) and the S as S(VI)');
  expect(assumptionText([])).toBe('');
  expect(chosenAssumptions(valenceAssumptions('C2H6OS'))).toStrictEqual([]);
  expect(chosenAssumptions(assumed)).toHaveLength(2);
});
