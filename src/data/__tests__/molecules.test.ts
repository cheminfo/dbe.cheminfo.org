/**
 * The molecule pool, held against openchemlib rather than against itself.
 *
 * Every entry claims a formula and three numbers, and all four are recomputed
 * here from its SMILES alone. A worked example is the thing a visitor clicks
 * first and questions last, so a number typed wrongly into the pool has to
 * fail the build rather than a student.
 *
 * The valence claim is checked both ways round: an entry that declares
 * `valences` must be one the shared table gets **wrong**, and an entry that
 * declares none must be one it gets right. That pair is what stops the
 * sulfur file quietly filling with molecules sulfur does nothing to.
 */

import { expect, test } from 'vitest';

import { isOfferedValence } from '../../dbe/index.ts';
import type { PoolTag } from '../molecules/types.ts';
import {
  CALCULATOR_EXAMPLES,
  MOLECULE_POOL,
  expandedOctetPool,
  poolEntryById,
  poolOfLevel,
  poolWithTag,
} from '../molecules.ts';

import { URL_SAFE, formulaOf, structureOf } from './compute.ts';
import { BANNED } from './prose.ts';

/** Every tag the type offers, so one nobody uses is a tag to delete. */
const ALL_TAGS: readonly PoolTag[] = [
  'chain',
  'ring',
  'aromatic',
  'triple',
  'carbonyl',
  'halogen',
  'nitrogen',
  'nitro',
  'sulfur',
  'phosphorus',
];

test('the pool holds 49 molecules with unique, linkable ids', () => {
  expect(MOLECULE_POOL).toHaveLength(49);
  const ids = MOLECULE_POOL.map((entry) => entry.id);
  expect(new Set(ids).size).toBe(49);
  for (const entry of MOLECULE_POOL) {
    expect(entry.id).toMatch(URL_SAFE);
    expect(entry.name.length, entry.id).toBeGreaterThan(0);
    expect(entry.tags.length, entry.id).toBeGreaterThanOrEqual(1);
    expect(entry.note.length, entry.id).toBeLessThanOrEqual(90);
    expect(BANNED.test(entry.note), entry.id).toBe(false);
  }
});

test('every formula is the one openchemlib reads off the drawing', () => {
  const wrong: string[] = [];
  for (const entry of MOLECULE_POOL) {
    const read = structureOf(entry.smiles).mf;
    if (read !== entry.mf) wrong.push(`${entry.id}: ${entry.mf} vs ${read}`);
  }
  expect(wrong).toStrictEqual([]);
});

test('every rings, pi bonds and DBE is what the drawing counts', () => {
  const wrong: string[] = [];
  for (const entry of MOLECULE_POOL) {
    const counted = structureOf(entry.smiles);
    const claimed = {
      dbe: entry.dbe,
      rings: entry.rings,
      piBonds: entry.piBonds,
    };
    const actual = {
      dbe: counted.dbe,
      rings: counted.rings,
      piBonds: counted.piBonds,
    };
    if (
      actual.dbe !== claimed.dbe ||
      actual.rings !== claimed.rings ||
      actual.piBonds !== claimed.piBonds
    ) {
      wrong.push(
        `${entry.id}: ${JSON.stringify(claimed)} vs ${JSON.stringify(actual)}`,
      );
    }
    expect(entry.rings + entry.piBonds, entry.id).toBe(entry.dbe);
  }
  expect(wrong).toStrictEqual([]);
});

test('no drawing in the pool carries a caveat that stops the count', () => {
  for (const entry of MOLECULE_POOL) {
    expect(structureOf(entry.smiles).caveats, entry.id).toStrictEqual([]);
  }
});

test('a molecule that declares valences is one the shared table gets wrong', () => {
  const declaring = expandedOctetPool();
  expect(declaring.map((entry) => entry.id)).toStrictEqual([
    'dmso',
    'methyl-phenyl-sulfoxide',
    'dimethyl-sulfone',
    'methanesulfonic-acid',
    'sulfolane',
    'sulfanilamide',
    'saccharin',
    'triphenylphosphine-oxide',
    'phosphoric-acid',
    'trimethyl-phosphate',
  ]);
  for (const entry of declaring) {
    const valences = entry.valences as Readonly<Record<string, number>>;
    expect(formulaOf(entry.mf).dbe, entry.id).not.toBe(entry.dbe);
    expect(formulaOf(entry.mf, valences).dbe, entry.id).toBe(entry.dbe);
    const stretched = structureOf(entry.smiles).expanded;
    for (const [symbol, valence] of Object.entries(valences)) {
      expect(isOfferedValence(symbol, valence), `${entry.id}: ${symbol}`).toBe(
        true,
      );
      expect(
        stretched.map((atom) => `${atom.symbol}${atom.valence}`),
        `${entry.id}: ${symbol}`,
      ).toContain(`${symbol}${valence}`);
    }
  }
});

test('a molecule that declares none is one the shared table gets right', () => {
  const disagreeing: string[] = [];
  for (const entry of MOLECULE_POOL) {
    if (entry.valences !== undefined) continue;
    const read = formulaOf(entry.mf).dbe;
    if (read !== entry.dbe) {
      disagreeing.push(`${entry.id}: ${read} vs ${entry.dbe}`);
    }
    expect(structureOf(entry.smiles).expanded, entry.id).toStrictEqual([]);
  }
  expect(disagreeing).toStrictEqual([]);
});

test('every level and every tag is carried by at least one molecule', () => {
  expect(poolOfLevel('beginner')).toHaveLength(14);
  expect(poolOfLevel('intermediate')).toHaveLength(20);
  expect(poolOfLevel('advanced')).toHaveLength(15);
  const unused: string[] = [];
  for (const tag of ALL_TAGS) {
    if (poolWithTag(tag).length === 0) unused.push(tag);
  }
  expect(unused).toStrictEqual([]);
  expect(poolWithTag('nitro').map((entry) => entry.id)).toStrictEqual([
    'nitrobenzene',
  ]);
});

test('the worked examples end on the three molecules that disagree', () => {
  expect(CALCULATOR_EXAMPLES).toHaveLength(8);
  const disagreeing = CALCULATOR_EXAMPLES.filter(
    (entry) => formulaOf(entry.mf).dbe !== entry.dbe,
  );
  expect(disagreeing.map((entry) => entry.id)).toStrictEqual([
    'dmso',
    'dimethyl-sulfone',
    'triphenylphosphine-oxide',
  ]);
});

test('the lookup answers, and refuses an id nobody minted', () => {
  expect(poolEntryById('cubane')?.dbe).toBe(5);
  expect(poolEntryById('cubane')?.rings).toBe(5);
  expect(poolEntryById('nonsense')).toBeUndefined();
});
