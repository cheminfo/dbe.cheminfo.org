/**
 * What the formula rule answers, held against the numbers the drawings count.
 *
 * Every expectation here is a value openchemlib printed for the same molecule,
 * so a change to the rule shows up as a disagreement with a structure rather
 * than as a test that was edited to match. The three that carry the site are
 * sulfur, phosphorus and the charge: each is pinned at more than one valence,
 * and the charge is pinned together with `mf-parser`'s opposite answer, because
 * the next reader's first instinct will be to make the two agree.
 */

import { MF } from 'mf-parser';
import { expect, test } from 'vitest';

import { dbeFromFormula, dbeOfFormula } from '../formula.ts';
import type { ValenceChoices } from '../types.ts';

/**
 * The number the rule gives, throwing when the formula was refused: a refusal
 * has its own tests, and a silently skipped case proves nothing.
 */
function dbeOf(mf: string, valences?: ValenceChoices): number {
  const reading = dbeFromFormula(
    mf,
    valences === undefined ? {} : { valences },
  );
  if (!reading.ok) throw new Error(`${mf}: ${reading.problem.message}`);
  return reading.value.dbe;
}

test('the CHNOX formulas read the way the reference card writes them', () => {
  const cases: ReadonlyArray<readonly [string, number]> = [
    ['C6H6', 4],
    ['C6H14', 0],
    ['C6H12', 1],
    ['C2H2', 2],
    ['C2H4', 1],
    ['C6H12O6', 1],
    ['C2H6O', 0],
    ['C3H6O', 1],
    ['C8H10N4O2', 6],
    ['C9H8O4', 6],
    ['C7H5F3', 4],
    ['C6H5Cl', 4],
    ['CH2Cl2', 0],
    ['C2H4Br2', 0],
    ['CH2I2', 0],
    ['C5H5N', 4],
    ['C2H3N', 2],
    ['C10H8', 7],
    ['C14H10', 10],
    ['C8H8', 5],
    ['C10H16', 3],
    ['CO2', 2],
    ['H4Si', 0],
    ['H3BO3', 0],
  ];
  for (const [mf, expected] of cases) {
    expect([mf, dbeOf(mf)]).toStrictEqual([mf, expected]);
  }
});

test('sulfur answers a different number at each of its three valences', () => {
  expect([
    dbeOf('C2H6S'),
    dbeOf('C2H6OS'),
    dbeOf('C2H6OS', { S: 4 }),
    dbeOf('C2H6OS', { S: 6 }),
    dbeOf('C2H6O2S'),
    dbeOf('C2H6O2S', { S: 6 }),
    dbeOf('CH4O3S', { S: 6 }),
    dbeOf('H2O4S', { S: 6 }),
  ]).toStrictEqual([0, 0, 1, 2, 0, 2, 2, 2]);
});

test('a negative number is sulfur hexafluoride saying the valence is wrong', () => {
  expect([dbeOf('F6S'), dbeOf('F6S', { S: 6 })]).toStrictEqual([-2, 0]);
});

test('phosphorus moves by exactly one, because it expands by one', () => {
  expect([
    dbeOf('C3H9P'),
    dbeOf('C18H15P'),
    dbeOf('C18H15OP'),
    dbeOf('C18H15OP', { P: 5 }),
    dbeOf('H3O4P'),
    dbeOf('H3O4P', { P: 5 }),
    dbeOf('C3H9O4P', { P: 5 }),
  ]).toStrictEqual([0, 12, 12, 13, 0, 1, 1]);
});

test('selenium and arsenic repeat the sulfur and phosphorus story', () => {
  expect([
    dbeOf('C2H6OSe'),
    dbeOf('C2H6OSe', { Se: 4 }),
    dbeOf('C18H15As'),
    dbeOf('C18H15OAs', { As: 5 }),
  ]).toStrictEqual([0, 1, 12, 13]);
});

test('an ion adds half its charge, so it agrees with the drawing', () => {
  expect([
    dbeOf('NH4+'),
    dbeOf('CH6N(+)'),
    dbeOf('CH3O(-)'),
    dbeOf('C2H3O2(-)'),
    dbeOf('CO3(--)'),
  ]).toStrictEqual([0, 0, 0, 1, 1]);
});

test('the charge row is plus the charge, where mf-parser subtracts it', () => {
  const ammonium = dbeFromFormula('NH4+');
  const acetate = dbeFromFormula('C2H3O2(-)');
  if (!ammonium.ok || !acetate.ok) {
    throw new Error('both formulas are readable');
  }

  expect([
    ammonium.value.charge,
    ammonium.value.chargeHalf,
    ammonium.value.dbe,
    acetate.value.charge,
    acetate.value.chargeHalf,
    acetate.value.dbe,
  ]).toStrictEqual([1, 1, 0, -1, -1, 1]);

  // The drawings count 0 and 1. mf-parser answers -1 and 2 because it takes the
  // charge away instead, which is why `getInfo().unsaturation` is never read.
  expect([
    new MF('NH4+').getInfo().unsaturation,
    new MF('C2H3O2(-)').getInfo().unsaturation,
  ]).toStrictEqual([-1, 2]);
});

test('a dot is worth a whole unit, so a hydrate is not its lump', () => {
  const hydrate = dbeFromFormula('C6H12O6.H2O');
  if (!hydrate.ok) throw new Error('a hydrate is readable');
  expect([hydrate.value.fragments, hydrate.value.dbe]).toStrictEqual([2, 1]);
  expect(dbeOf('C6H14O7')).toBe(0);
});

test('deuterium is hydrogen, whichever way it is written', () => {
  const labelled = dbeFromFormula('C6H5D');
  if (!labelled.ok) throw new Error('C6H5D is readable');
  expect([
    labelled.value.mf,
    labelled.value.atoms,
    labelled.value.dbe,
  ]).toStrictEqual(['C6H5[2H]', { C: 6, H: 6 }, 4]);
  expect(dbeOf('C6H5[2H]')).toBe(4);
});

test('a half means an odd number of bonds, and is never rounded away', () => {
  const radical = dbeFromFormula('CH3');
  if (!radical.ok) throw new Error('CH3 is readable');
  expect([radical.value.dbe, radical.value.whole]).toStrictEqual([0.5, false]);
  expect(dbeOf('CH5')).toBe(-0.5);
});

test('the breakdown states every term of the sum it draws', () => {
  const reading = dbeFromFormula('C2H6OS', { valences: { S: 4 } });
  if (!reading.ok) throw new Error('C2H6OS is readable');
  const { terms, half, dbe, ambiguous } = reading.value;

  expect(
    terms.map((term) => [
      term.symbol,
      term.count,
      term.valence,
      term.contribution,
      term.half,
      term.dbe,
      term.chosen,
    ]),
  ).toStrictEqual([
    ['C', 2, 4, 2, 4, 2, false],
    ['H', 6, 1, -1, -6, -3, false],
    ['O', 1, 2, 0, 0, 0, false],
    ['S', 1, 4, 2, 2, 1, true],
  ]);
  expect([half, dbe, ambiguous]).toStrictEqual([0, 1, ['S']]);
  expect(terms.map((term) => term.options.length)).toStrictEqual([0, 0, 0, 3]);
});

test('a formula that cannot be counted says why, and gives no number', () => {
  const empty = dbeFromFormula(' ');
  const malformed = dbeFromFormula('C6H6)');
  const metal = dbeFromFormula('FeCl2');
  if (empty.ok || malformed.ok || metal.ok) {
    throw new Error('none of these three is countable');
  }

  expect([empty.problem.kind, empty.problem.message]).toStrictEqual([
    'empty',
    'Type a molecular formula, such as C6H6.',
  ]);
  expect([malformed.problem.kind, malformed.problem.unknown]).toStrictEqual([
    'syntax',
    [],
  ]);
  expect([metal.problem.kind, metal.problem.unknown]).toStrictEqual([
    'unsupported',
    ['Fe'],
  ]);
  expect(metal.problem.message).toBe(
    'Fe is not an element this rule can assume a bond count for, so this formula has no degree of unsaturation. Draw the structure instead: a drawing states its own bond counts.',
  );
});

test('dbeOfFormula hands back the number, or nothing at all', () => {
  expect([
    dbeOfFormula('C6H6'),
    dbeOfFormula('C2H6OS', { valences: { S: 6 } }),
    dbeOfFormula('FeCl2'),
    dbeOfFormula(''),
  ]).toStrictEqual([4, 2, null, null]);
});
