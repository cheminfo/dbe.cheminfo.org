/**
 * The rule the sheet opens on, held against the valence table it claims to
 * state.
 *
 * The printed header is the one line a student copies out by hand, so no
 * coefficient on it may be a coefficient somebody typed: every group is
 * recomputed from {@link DEFAULT_VALENCES}, every sulfur and phosphorus line
 * from {@link VALENCE_OPTIONS}, and both formulas are handed to KaTeX with
 * errors on, so a stray brace fails here rather than printing in red on paper.
 */

import katex from 'katex';
import { expect, test } from 'vitest';

import {
  GENERAL_RULE_TEX,
  OPEN_VALENCE_SYMBOLS,
  RULE_GROUPS,
  RULE_LEGEND,
  WRITTEN_RULE_TEX,
  contributionTex,
  valenceTerms,
} from '../rule.ts';
import { DEFAULT_VALENCES, VALENCE_OPTIONS } from '../valences.ts';

test('every group is worth what the valence table makes its elements worth', () => {
  const wrong: string[] = [];
  let checked = 0;
  for (const group of RULE_GROUPS) {
    for (const symbol of group.symbols) {
      checked++;
      const valence = DEFAULT_VALENCES[symbol];
      if (valence === undefined) {
        wrong.push(`${group.id}/${symbol}: not in the valence table`);
      } else if ((valence - 2) / 2 !== group.contribution) {
        wrong.push(
          `${group.id}/${symbol}: worth ${(valence - 2) / 2}, written ${group.contribution}`,
        );
      }
    }
  }
  expect(wrong).toStrictEqual([]);
  expect(checked).toBe(12);
});

test('the written rule leaves out oxygen, which is the group worth nothing', () => {
  const zero = RULE_GROUPS.filter((group) => group.contribution === 0);
  expect(zero.map((group) => group.symbols)).toStrictEqual([['O']]);
  expect(WRITTEN_RULE_TEX).not.toContain(String.raw`n_{\mathrm{O}}`);
});

test('the written rule carries every other group, and both open valences', () => {
  expect(WRITTEN_RULE_TEX).toContain(
    String.raw`+ n_{\mathrm{C}} + n_{\mathrm{Si}}`,
  );
  expect(WRITTEN_RULE_TEX).toContain(String.raw`+ \tfrac{1}{2}n_{\mathrm{N}}`);
  expect(WRITTEN_RULE_TEX).toContain(
    String.raw`- \tfrac{1}{2}\left(n_{\mathrm{H}} + n_{\mathrm{X}} + n_{\mathrm{M}}\right)`,
  );
  expect(OPEN_VALENCE_SYMBOLS).toStrictEqual(['S', 'P']);
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    expect(WRITTEN_RULE_TEX, symbol).toContain(
      String.raw`\frac{v_{\mathrm{${symbol}}} - 2}{2}\,n_{\mathrm{${symbol}}}`,
    );
  }
});

test('an open valence is never also written as a fixed group', () => {
  const fixed = RULE_GROUPS.flatMap((group) => group.symbols);
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    expect(fixed, symbol).not.toContain(symbol);
  }
});

test('sulfur and phosphorus carry every valence the site offers', () => {
  expect(valenceTerms('S')).toStrictEqual([
    { label: 'S(II)', valence: 2, contribution: 0, tex: '0' },
    { label: 'S(IV)', valence: 4, contribution: 1, tex: '+1' },
    { label: 'S(VI)', valence: 6, contribution: 2, tex: '+2' },
  ]);
  expect(valenceTerms('P')).toStrictEqual([
    {
      label: 'P(III)',
      valence: 3,
      contribution: 0.5,
      tex: String.raw`+\tfrac{1}{2}`,
    },
    {
      label: 'P(V)',
      valence: 5,
      contribution: 1.5,
      tex: String.raw`+\tfrac{3}{2}`,
    },
  ]);
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    expect(valenceTerms(symbol).length, symbol).toBe(
      (VALENCE_OPTIONS[symbol] ?? []).length,
    );
  }
  expect(valenceTerms('C')).toStrictEqual([]);
});

test('a contribution is written as the stacked half a chemist writes', () => {
  expect([
    contributionTex(1),
    contributionTex(2),
    contributionTex(3),
    contributionTex(4),
    contributionTex(5),
    contributionTex(6),
  ]).toStrictEqual([
    String.raw`-\tfrac{1}{2}`,
    '0',
    String.raw`+\tfrac{1}{2}`,
    '+1',
    String.raw`+\tfrac{3}{2}`,
    '+2',
  ]);
});

test('the legend names every letter the two formulas use, and no other', () => {
  expect(RULE_LEGEND.map((entry) => entry.tex)).toStrictEqual([
    'F',
    'q',
    'n_i',
    'v_i',
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
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    for (const term of valenceTerms(symbol)) written.push(term.tex);
  }
  for (const math of written) {
    expect(() =>
      katex.renderToString(math, { throwOnError: true, strict: 'error' }),
    ).not.toThrow();
  }
  expect(written).toHaveLength(13);
});
