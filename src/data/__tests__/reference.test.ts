/**
 * The printable sheet, every number on it recomputed.
 *
 * This is the page a student takes into an exam room, reads once and never
 * questions, so a row that quotes a number states it as a {@link RowCheck} and
 * the check is run here: the formula through `dbeFromFormula` at the valences
 * the row assumes, the drawing through `dbeFromStructure`.
 *
 * The contribution block is held against the valence table itself rather than
 * against a second copy of it, so a row saying nitrogen is worth `+½` fails
 * the day somebody moves nitrogen in `DEFAULT_VALENCES`.
 */

import { expect, test } from 'vitest';

import {
  DEFAULT_VALENCES,
  VALENCE_ELEMENTS,
  VALENCE_OPTIONS,
} from '../../dbe/index.ts';
import type { ValenceOption } from '../../dbe/types.ts';
import { REFERENCE_ROW_COUNT, REFERENCE_SECTIONS } from '../reference.ts';

import { URL_SAFE, formulaOf, structureOf } from './compute.ts';
import { BANNED } from './prose.ts';

/** How a contribution is written on the sheet, and what it is worth. */
const CONTRIBUTION_TEXT: Readonly<Record<string, number>> = {
  '+1': 1,
  '+½': 0.5,
  '0': 0,
  '−½': -0.5,
};

/** The valence label a row names in its syntax, as `S(IV)`, when it names one. */
function valenceLabel(syntax: string): string | null {
  const found = /\((?<symbol>[A-Z][a-z]?)\s(?<roman>[IVX]+)\)/.exec(syntax);
  const groups = found?.groups;
  return groups === undefined ? null : `${groups.symbol}(${groups.roman})`;
}

/** Every valence label the site offers, across every ambiguous element. */
function offeredLabels(): ReadonlySet<string> {
  const labels = new Set<string>();
  for (const symbol of VALENCE_ELEMENTS) {
    for (const option of VALENCE_OPTIONS[symbol] ?? []) {
      labels.add(option.label);
    }
  }
  return labels;
}

test('the sheet is five blocks of 42 lines, with unique linkable ids', () => {
  expect(REFERENCE_SECTIONS).toHaveLength(5);
  expect(REFERENCE_ROW_COUNT).toBe(42);
  const ids = REFERENCE_SECTIONS.map((section) => section.id);
  expect(ids).toStrictEqual([
    'contributions',
    'sulfur',
    'phosphorus',
    'shortcuts',
    'traps',
  ]);
  for (const section of REFERENCE_SECTIONS) {
    expect(section.id).toMatch(URL_SAFE);
    expect(section.title.length, section.id).toBeLessThanOrEqual(60);
    expect(section.intro?.length ?? 0, section.id).toBeGreaterThan(0);
    expect(section.intro?.length ?? 0, section.id).toBeLessThanOrEqual(160);
    expect(section.rows.length, section.id).toBeGreaterThan(0);
  }
});

test('every line is one a reader can take in on paper', () => {
  for (const section of REFERENCE_SECTIONS) {
    for (const line of section.rows) {
      const where = `${section.id}: ${line.syntax}`;
      expect(line.syntax.length, where).toBeGreaterThan(0);
      expect(line.syntax.length, where).toBeLessThanOrEqual(40);
      expect(line.description.length, where).toBeGreaterThan(0);
      expect(line.description.length, where).toBeLessThanOrEqual(160);
      expect(BANNED.test(line.description), where).toBe(false);
    }
  }
});

test('every formula a row quotes reads what the row says it reads', () => {
  const wrong: string[] = [];
  for (const section of REFERENCE_SECTIONS) {
    for (const line of section.rows) {
      const check = line.check;
      if (check === undefined) continue;
      const read = formulaOf(check.mf, check.valences).dbe;
      if (read !== check.reads) {
        wrong.push(
          `${section.id}/${check.mf}: says ${check.reads}, reads ${read}`,
        );
      }
    }
  }
  expect(wrong).toStrictEqual([]);
});

test('every drawing a row quotes counts what the row says it counts', () => {
  const wrong: string[] = [];
  let drawn = 0;
  for (const section of REFERENCE_SECTIONS) {
    for (const line of section.rows) {
      const check = line.check;
      if (check?.smiles === undefined) continue;
      drawn++;
      expect(check.counts, `${section.id}: ${check.smiles}`).toBeDefined();
      const counted = structureOf(check.smiles).dbe;
      if (counted !== check.counts) {
        wrong.push(
          `${section.id}/${check.smiles}: says ${check.counts}, counts ${counted}`,
        );
      }
    }
  }
  expect(wrong).toStrictEqual([]);
  expect(drawn).toBe(38);
});

test('three rows state no number, and they are the three that name none', () => {
  const stateless: string[] = [];
  for (const section of REFERENCE_SECTIONS) {
    for (const line of section.rows) {
      if (line.check === undefined) stateless.push(line.syntax);
    }
  }
  expect(stateless).toStrictEqual([
    'DBE = C − H/2 + N/2 + 1',
    'S=O and P=O',
    'a transition metal',
  ]);
});

test('every contribution row is worth what the valence table makes it worth', () => {
  const contributions = REFERENCE_SECTIONS[0];
  expect(contributions?.id).toBe('contributions');
  let checked = 0;
  for (const line of contributions?.rows ?? []) {
    const symbols = line.syntax.split(', ');
    if (!symbols.every((symbol) => DEFAULT_VALENCES[symbol] !== undefined)) {
      continue;
    }
    const written = line.description.split(/[ .]/, 1)[0] as string;
    const worth = CONTRIBUTION_TEXT[written];
    expect(worth, `${line.syntax}: "${written}"`).toBeDefined();
    for (const symbol of symbols) {
      checked++;
      expect((DEFAULT_VALENCES[symbol] as number) - 2, symbol).toBe(
        (worth as number) * 2,
      );
    }
  }
  expect(checked).toBe(14);
});

test('every valence a heteroatom row names is one the site offers', () => {
  const offered = offeredLabels();
  const named: string[] = [];
  for (const section of REFERENCE_SECTIONS) {
    for (const line of section.rows) {
      const label = valenceLabel(line.syntax);
      if (label !== null) named.push(label);
    }
  }
  expect(named).toStrictEqual([
    'S(II)',
    'S(II)',
    'S(IV)',
    'S(VI)',
    'S(VI)',
    'S(VI)',
    'P(III)',
    'P(V)',
    'P(V)',
  ]);
  for (const label of named) expect(offered, label).toContain(label);
});

test('the sulfur and phosphorus blocks open on the case the table gets right', () => {
  const opening: Array<readonly [string, number, number]> = [];
  for (const section of REFERENCE_SECTIONS) {
    if (section.id !== 'sulfur' && section.id !== 'phosphorus') continue;
    const check = section.rows[0]?.check;
    const smiles = check?.smiles as string;
    opening.push([
      section.id,
      formulaOf(check?.mf as string, check?.valences).dbe,
      structureOf(smiles).dbe,
    ]);
  }
  expect(opening).toStrictEqual([
    ['sulfur', 3, 3],
    ['phosphorus', 12, 12],
  ]);
});

test('the standard option of each ambiguous element is its default valence', () => {
  for (const symbol of VALENCE_ELEMENTS) {
    const options = VALENCE_OPTIONS[symbol] as readonly ValenceOption[];
    const standard = options.filter((option) => option.standard);
    expect(standard, symbol).toHaveLength(1);
    expect((standard[0] as ValenceOption).valence, symbol).toBe(
      DEFAULT_VALENCES[symbol],
    );
  }
});
