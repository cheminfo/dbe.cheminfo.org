/**
 * The two numbers side by side: when they agree, when they do not, and what
 * the callout says about it.
 *
 * The nitro group is the control. Nitrogen cannot expand its octet, so
 * openchemlib stores the charge-separated form and the formula's trivalent
 * nitrogen is exactly right — which is what makes the sulfoxide and the
 * phosphate read as chemistry rather than as a tool being unreliable.
 */

import { expect, test } from 'vitest';

import { compareDbe, reconcilingValences } from '../compare.ts';
import { dbeFromFormula } from '../formula.ts';
import { readMolecule } from '../readMolecule.ts';
import { dbeFromStructure } from '../structure.ts';
import type { DbeComparison, ValenceChoices } from '../types.ts';

/** The two readings of one molecule, compared. */
function compare(
  mf: string,
  smiles: string,
  valences?: ValenceChoices,
): DbeComparison {
  const formula = dbeFromFormula(
    mf,
    valences === undefined ? {} : { valences },
  );
  const drawing = readMolecule(smiles);
  if (!formula.ok || !drawing.ok) {
    throw new Error(`${mf} and ${smiles} both read`);
  }
  return compareDbe(formula.value, dbeFromStructure(drawing.molecule));
}

test('a sulfoxide differs by one, and the sulfur is named for it', () => {
  const sulfoxide = compare('C2H6OS', 'CS(C)=O');
  expect([
    sulfoxide.formula.dbe,
    sulfoxide.structure.dbe,
    sulfoxide.difference,
    sulfoxide.agree,
    sulfoxide.sameFormula,
    sulfoxide.reconciling,
  ]).toStrictEqual([0, 1, 1, false, true, { S: 4 }]);
  expect(sulfoxide.explanation).toBe(
    'The drawing counts 1 and the formula 0, because the S is drawn making 4 bonds and the table counts it at 2 — count it as S(IV) and the two agree.',
  );
});

test('a sulfone differs by two, so it is not an off-by-one', () => {
  const sulfone = compare('C2H6O2S', 'CS(C)(=O)=O');
  expect([
    sulfone.difference,
    sulfone.agree,
    sulfone.reconciling,
  ]).toStrictEqual([2, false, { S: 6 }]);
  expect(sulfone.explanation).toBe(
    'The drawing counts 2 and the formula 0, because the S is drawn making 6 bonds and the table counts it at 2 — count it as S(VI) and the two agree.',
  );
});

test('a phosphate differs by one, because phosphorus expands by one', () => {
  const phosphate = compare('C3H9O4P', 'COP(=O)(OC)OC');
  expect([
    phosphate.formula.dbe,
    phosphate.structure.dbe,
    phosphate.difference,
    phosphate.reconciling,
  ]).toStrictEqual([0, 1, 1, { P: 5 }]);
  expect(phosphate.explanation).toBe(
    'The drawing counts 1 and the formula 0, because the P is drawn making 5 bonds and the table counts it at 3 — count it as P(V) and the two agree.',
  );
});

test('nitro agrees, which is the whole contrast', () => {
  const nitrobenzene = compare('C6H5NO2', 'O=[N+]([O-])c1ccccc1');
  expect([
    nitrobenzene.formula.dbe,
    nitrobenzene.structure.dbe,
    nitrobenzene.difference,
    nitrobenzene.agree,
    nitrobenzene.reconciling,
  ]).toStrictEqual([5, 5, 0, true, null]);
  expect(nitrobenzene.explanation).toBe(
    'Both count 5: the formula assumes the bond counts the drawing actually has.',
  );
});

test('switching the valence closes the gap the callout pointed at', () => {
  const reconciled = compare('C2H6OS', 'CS(C)=O', { S: 4 });
  expect([
    reconciled.agree,
    reconciled.difference,
    reconciled.formula.dbe,
  ]).toStrictEqual([true, 0, 1]);
  expect(reconciled.explanation).toBe(
    'Both count 1: the formula assumes the bond counts the drawing actually has.',
  );
});

test('the ylide drawing agrees with the formula, which answered it all along', () => {
  const ylide = compare('C2H6OS', 'C[S+](C)[O-]');
  expect([ylide.formula.dbe, ylide.structure.dbe, ylide.agree]).toStrictEqual([
    0,
    0,
    true,
  ]);
});

test('two different molecules are said to be two different molecules', () => {
  const mismatched = compare('C6H6', 'c1ccc2ccccc2c1');
  expect([
    mismatched.sameFormula,
    mismatched.agree,
    mismatched.difference,
  ]).toStrictEqual([false, false, 3]);
  expect(mismatched.explanation).toBe(
    'The drawing is C10H8 and the formula is C6H6, so the two numbers are not about the same molecule.',
  );
});

test('a sextet cation and a radical each explain their own gap', () => {
  const cation = compare('CH3(+)', '[CH3+]');
  expect([cation.difference, cation.reconciling]).toStrictEqual([-1, null]);
  expect(cation.explanation).toBe(
    'The drawing counts 0 and the formula 1: the rule adds half a bond per unit of positive charge, and this cation makes one bond fewer instead — a carbenium centre has six electrons, not eight.',
  );

  const radical = compare('CH3', '[CH3]');
  expect([
    radical.formula.dbe,
    radical.structure.dbe,
    radical.difference,
  ]).toStrictEqual([0.5, 0, -0.5]);
  expect(radical.explanation).toBe(
    'The drawing counts 0 and the formula 0.5: an unpaired electron leaves an odd number of bonds, and half of an odd number is a half.',
  );
});

test('reconciling takes the least expanded valence that works', () => {
  const sulfoxide = compare('C2H6OS', 'CS(C)=O');
  const sulfone = compare('C2H6O2S', 'CS(C)(=O)=O');
  const thioether = compare('C2H6S', 'CSC');
  const benzene = compare('C6H6', 'c1ccccc1');

  expect([
    reconcilingValences(sulfoxide.formula, sulfoxide.structure),
    reconcilingValences(sulfone.formula, sulfone.structure),
    reconcilingValences(thioether.formula, thioether.structure),
    reconcilingValences(benzene.formula, benzene.structure),
  ]).toStrictEqual([{ S: 4 }, { S: 6 }, {}, null]);
});

test('sulfur and phosphorus in one molecule are reconciled together', () => {
  const both = compare('C3H9O6PS', 'COP(=O)(OC)OS(C)(=O)=O');
  expect([
    both.sameFormula,
    both.structure.dbe,
    both.formula.dbe,
    both.difference,
    both.reconciling,
  ]).toStrictEqual([true, 3, 0, 3, { P: 5, S: 6 }]);
});
