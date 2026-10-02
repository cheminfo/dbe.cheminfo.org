/**
 * The fraction the sheet opens on, held against the valence table it claims to
 * state.
 *
 * The printed header is the one line a student copies out by hand, so no
 * coefficient on it may be a coefficient somebody typed — and none is: each is
 * `valence − 2`, read out of {@link DEFAULT_VALENCES} for the elements nobody
 * chooses and out of {@link VALENCE_OPTIONS} for sulfur and phosphorus. This
 * recomputes every one of them from both tables, including the two that are
 * zero, and hands both formulas to KaTeX with errors on so a stray brace fails
 * here rather than printing in red on paper.
 */

import katex from 'katex';
import { expect, test } from 'vitest';

import {
  GENERAL_RULE_TEX,
  NUMERATOR_TERMS,
  OPEN_VALENCE_SYMBOLS,
  RULE_GROUPS,
  RULE_LEGEND,
  WRITTEN_RULE_TEX,
  countTex,
  highestFirst,
  numeratorCoefficient,
  termTex,
} from '../rule.ts';
import {
  DEFAULT_VALENCES,
  VALENCE_OPTIONS,
  isOfferedValence,
} from '../valences.ts';

test('a group is one count, and every element in it holds the same valence', () => {
  const wrong: string[] = [];
  let checked = 0;
  for (const group of RULE_GROUPS) {
    const valence = DEFAULT_VALENCES[group.symbols[0] as string];
    for (const symbol of group.symbols) {
      checked++;
      if (DEFAULT_VALENCES[symbol] === undefined) {
        wrong.push(`${group.id}/${symbol}: not in the valence table`);
      } else if (DEFAULT_VALENCES[symbol] !== valence) {
        wrong.push(
          `${group.id}/${symbol}: ${DEFAULT_VALENCES[symbol]}-valent, the group is ${valence}`,
        );
      }
    }
  }
  expect(wrong).toStrictEqual([]);
  expect(checked).toBe(12);
});

test('the numerator writes every element the rule knows, and every valence', () => {
  expect(NUMERATOR_TERMS.map((term) => term.label)).toStrictEqual([
    'S(VI)',
    'P(V)',
    'C',
    'Si',
    'S(IV)',
    'N',
    'P(III)',
    'O',
    'S(II)',
    'H',
    'X',
    'M',
  ]);
  expect(NUMERATOR_TERMS.map((term) => term.coefficient)).toStrictEqual([
    4, 3, 2, 2, 2, 1, 1, 0, 0, -1, -1, -1,
  ]);
});

test('the terms fall from what adds most to what takes away', () => {
  const coefficients = NUMERATOR_TERMS.map((term) => term.coefficient);

  expect(coefficients).toStrictEqual(coefficients.toSorted((a, b) => b - a));
});

test('the numerator is one line, so no term is read as two', () => {
  expect(WRITTEN_RULE_TEX).not.toContain(String.raw`\\`);
  expect(WRITTEN_RULE_TEX).not.toContain('gathered');
});

test('the one unit per molecule closes the rule, after the halving', () => {
  expect(WRITTEN_RULE_TEX.endsWith('}{2} + 1')).toBe(true);
});

test('every coefficient is the valence it is counted at, less two', () => {
  const wrong: string[] = [];
  for (const term of NUMERATOR_TERMS) {
    if (numeratorCoefficient(term.valence) !== term.coefficient) {
      wrong.push(
        `${term.label}: v ${term.valence}, coefficient ${term.coefficient}`,
      );
    }
    for (const symbol of term.symbols) {
      const known =
        term.kind === 'fixed'
          ? DEFAULT_VALENCES[symbol] === term.valence
          : isOfferedValence(symbol, term.valence);
      if (!known) {
        wrong.push(`${term.label}: ${symbol} is not ${term.valence}-valent`);
      }
    }
  }
  expect(wrong).toStrictEqual([]);
  expect(numeratorCoefficient(1)).toBe(-1);
  expect(numeratorCoefficient(6)).toBe(4);
});

test('sulfur and phosphorus bring every valence the site offers, highest first', () => {
  const chosen = NUMERATOR_TERMS.filter((term) => term.kind === 'chosen');
  expect(OPEN_VALENCE_SYMBOLS).toStrictEqual(['S', 'P']);
  let offered = 0;
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    offered += (VALENCE_OPTIONS[symbol] ?? []).length;
  }
  expect(chosen).toHaveLength(offered);
  expect(
    highestFirst(VALENCE_OPTIONS.S ?? []).map((o) => o.valence),
  ).toStrictEqual([6, 4, 2]);
});

test('the fraction carries every term, the charge, and one division by two', () => {
  // Each of the two lines above the bar opens without a `+`, so the first term
  // of each is written differently from the rest.
  const opens = new Set(['C', 'S(VI)']);
  for (const term of NUMERATOR_TERMS) {
    expect(WRITTEN_RULE_TEX, term.label).toContain(
      termTex(term.coefficient, countTex(term.label), opens.has(term.label)),
    );
  }
  // The charge is already in half-DBE units, so it sits above the bar with the
  // rest rather than being halved a second time.
  expect(WRITTEN_RULE_TEX).toContain('+ q');
  expect(WRITTEN_RULE_TEX).toContain(String.raw`\mathrm{DBE} = \frac{`);
  expect(WRITTEN_RULE_TEX).toContain('}{2}');
});

test('the terms worth nothing are written as 0, not left out', () => {
  expect(WRITTEN_RULE_TEX).toContain(String.raw`+ 0\,n_{\mathrm{O}}`);
  expect(WRITTEN_RULE_TEX).toContain(String.raw`+ 0\,n_{\mathrm{S(II)}}`);
});

test('a term is written with its sign, and a leading plus is dropped', () => {
  expect(termTex(2, countTex('C'), true)).toBe(String.raw`2\,n_{\mathrm{C}}`);
  expect(termTex(2, countTex('C'))).toBe(String.raw`+ 2\,n_{\mathrm{C}}`);
  expect(termTex(-1, countTex('H'), true)).toBe(
    String.raw`- 1\,n_{\mathrm{H}}`,
  );
  expect(termTex(0, countTex('O'))).toBe(String.raw`+ 0\,n_{\mathrm{O}}`);
});

test('the legend names every letter the two formulas use, and no other', () => {
  expect(RULE_LEGEND.map((entry) => entry.tex)).toStrictEqual([
    'F',
    'q',
    'n_i',
    'v_i',
    String.raw`n_{\mathrm{S(VI)}}`,
    String.raw`\mathrm{X}`,
    String.raw`\mathrm{M}`,
  ]);
  for (const entry of RULE_LEGEND) {
    expect(entry.meaning.length, entry.tex).toBeLessThanOrEqual(60);
  }
});

test('both formulas are LaTeX KaTeX reads without a complaint', () => {
  const written: string[] = [GENERAL_RULE_TEX, WRITTEN_RULE_TEX];
  for (const entry of RULE_LEGEND) written.push(entry.tex);
  for (const math of written) {
    expect(() =>
      katex.renderToString(math, { throwOnError: true, strict: 'error' }),
    ).not.toThrow();
  }
  expect(written).toHaveLength(9);
});
