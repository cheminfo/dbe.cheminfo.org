/**
 * The fraction the calculator draws, with one formula's numbers in it.
 *
 * The sulfone below is the whole subject in one reading: `C2H6O2S` counts 2
 * with its sulfur at six bonds and 0 with it at two, and the fraction has to
 * carry **both** branches — the one in force counted, the other two written and
 * not counted — because a reader who only sees the branch the tool took cannot
 * see that there was a branch.
 *
 * Every number asserted here is the one `formula.ts` computed; nothing in
 * `fraction.ts` adds anything up a second time.
 */

import katex from 'katex';
import { expect, test } from 'vitest';

import { dbeFromFormula } from '../formula.ts';
import type { FormulaFraction, FractionTerm } from '../fraction.ts';
import { formulaFraction } from '../fraction.ts';
import type { ValenceChoices } from '../types.ts';

test('a sulfone carries all three sulfur valences, the one in force counted', () => {
  const fraction = fractionOf('C2H6O2S', { S: 6 });

  expect(written(fraction)).toStrictEqual([
    String.raw`+4 \times 1 S(VI) counted chosen`,
    String.raw`+2 \times 2 C counted`,
    String.raw`+2 \times 1 S(IV)`,
    String.raw`+0 \times 2 O counted`,
    String.raw`+0 \times 1 S(II)`,
    String.raw`-1 \times 6 H counted`,
  ]);
  expect(fraction.fragments).toBe(1);
  expect(fraction.half).toBe(2);
  expect(fraction.dbe).toBe(2);
});

test('the same formula at the standard table counts the other sulfur term', () => {
  const fraction = fractionOf('C2H6O2S', {});

  expect(written(fraction)).toStrictEqual([
    String.raw`+4 \times 1 S(VI)`,
    String.raw`+2 \times 2 C counted`,
    String.raw`+2 \times 1 S(IV)`,
    String.raw`+0 \times 2 O counted`,
    String.raw`+0 \times 1 S(II) counted`,
    String.raw`-1 \times 6 H counted`,
  ]);
  expect(fraction.half).toBe(-2);
  expect(fraction.dbe).toBe(0);
});

test('an element with no choice of valence gets one term, counted', () => {
  const fraction = fractionOf('C6H6', {});

  expect(written(fraction)).toStrictEqual([
    String.raw`+2 \times 6 C counted`,
    String.raw`-1 \times 6 H counted`,
  ]);
  expect(fraction.dbe).toBe(4);
});

test('the charge is a term above the bar, and it is added', () => {
  const acetate = fractionOf('C2H3O2(-)', {});
  const ammonium = fractionOf('NH4+', {});

  expect(written(acetate).at(-1)).toBe('-1 charge counted');
  expect(acetate.half).toBe(0);
  expect(acetate.dbe).toBe(1);

  expect(written(ammonium).at(-1)).toBe('+1 charge counted');
  expect(ammonium.dbe).toBe(0);
  expect(fractionOf('CH3O(-)', {}).dbe).toBe(0);
});

test('a neutral formula writes no charge term at all', () => {
  const labels = fractionOf('C9H8O4', {}).terms.map((term) => term.label);
  expect(labels).toStrictEqual(['C', 'O', 'H']);
});

test('the terms fall from the one worth most to the one that takes away', () => {
  const labels = fractionOf('C7H5NO3S', { S: 6 }).terms.map(
    (term) => term.label,
  );
  expect(labels).toStrictEqual(['S(VI)', 'C', 'S(IV)', 'N', 'O', 'S(II)', 'H']);
});

test('a formula of one element gets one term, counted', () => {
  const fraction = fractionOf('H2', {});
  expect(written(fraction)).toStrictEqual([String.raw`-1 \times 2 H counted`]);
});

test('selenium brings its own valences, although the rule leaves it unnamed', () => {
  const labels = fractionOf('C2H6O2Se', { Se: 6 }).terms.map(
    (term) => term.label,
  );
  expect(labels).toStrictEqual(['Se(VI)', 'C', 'Se(IV)', 'O', 'Se(II)', 'H']);
  expect(fractionOf('C2H6O2Se', { Se: 6 }).dbe).toBe(2);
});

test('every expression a fraction holds is LaTeX KaTeX reads without a complaint', () => {
  const written: string[] = [];
  for (const mf of ['C2H6O2S', 'C2H3O2(-)', 'C18H15OP', 'C6H12O6.(H2O)5']) {
    const fraction = fractionOf(mf, { S: 6, P: 5 });
    for (const term of fraction.terms) written.push(term.tex);
  }
  for (const math of written) {
    expect(() =>
      katex.renderToString(math, { throwOnError: true, strict: 'error' }),
    ).not.toThrow();
  }
  expect(written).toHaveLength(18);
});

/**
 * The fraction for a formula read at given valences.
 * @param mf - The formula.
 * @param valences - What to count the ambiguous elements at.
 * @returns The fraction.
 * @throws {Error} When the formula has no reading, which no case here uses.
 */
function fractionOf(mf: string, valences: ValenceChoices): FormulaFraction {
  const reading = dbeFromFormula(mf, { valences });
  if (!reading.ok) throw new Error(`${mf}: ${reading.problem.message}`);
  return formulaFraction(reading.value);
}

/**
 * Each term as one line: its sign, its arithmetic, what it counts, and the two
 * marks the calculator draws it by.
 * @param fraction - The fraction.
 * @returns One string per term.
 */
function written(fraction: FormulaFraction): string[] {
  const lines: string[] = [];
  for (const term of fraction.terms) lines.push(line(term));
  return lines;
}

function line(term: FractionTerm): string {
  const marks: string[] = [];
  if (term.counted) marks.push('counted');
  if (term.chosen) marks.push('chosen');
  return [`${term.sign}${term.tex}`, term.label, ...marks].join(' ');
}
