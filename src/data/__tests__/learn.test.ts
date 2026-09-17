/**
 * The short explanation, checked against what its own calculator would show.
 *
 * A section preloads a formula, a structure, or both. Every one of them is run
 * here, so a section that opens on a formula nothing can read — or on a
 * drawing that refuses to be counted — fails the build rather than opening
 * blank in front of a class.
 *
 * The sulfur and phosphorus sections are checked by name and by number: they
 * are the two the site exists for, and each must open on a formula and a
 * drawing that visibly disagree. A section that opened on two agreeing numbers
 * would teach the opposite of its own title.
 */

import { expect, test } from 'vitest';

import {
  LEARN_LEVELS,
  LEARN_SECTIONS,
  LEARN_SECTION_IDS,
  learnSectionById,
  learnSectionIndex,
  learnSectionsOfLevel,
} from '../learn.ts';

import { URL_SAFE, formulaOf, structureOf } from './compute.ts';
import { BANNED, sentenceCount } from './prose.ts';

test('the tour is ten sections in three strips, with unique linkable ids', () => {
  expect(LEARN_SECTIONS).toHaveLength(10);
  expect(LEARN_SECTION_IDS).toHaveLength(10);
  expect(new Set(LEARN_SECTION_IDS).size).toBe(10);
  expect(learnSectionsOfLevel('beginner')).toHaveLength(4);
  expect(learnSectionsOfLevel('intermediate')).toHaveLength(3);
  expect(learnSectionsOfLevel('advanced')).toHaveLength(3);
  expect(Object.keys(LEARN_LEVELS)).toStrictEqual([
    'beginner',
    'intermediate',
    'advanced',
  ]);
  for (const section of LEARN_SECTIONS) {
    expect(section.id).toMatch(URL_SAFE);
    expect(section.title.length, section.id).toBeLessThanOrEqual(60);
  }
});

test('every section preloads a formula the rule can read', () => {
  for (const section of LEARN_SECTIONS) {
    expect(section.mf, section.id).toBeDefined();
    const reading = formulaOf(section.mf as string, section.valences);
    expect(reading.terms.length, section.id).toBeGreaterThan(0);
    expect(Number.isFinite(reading.dbe), section.id).toBe(true);
  }
});

test('every preloaded structure is countable and carries no caveat', () => {
  const drawn = LEARN_SECTIONS.filter(
    (section) => section.smiles !== undefined,
  );
  expect(drawn).toHaveLength(9);
  for (const section of drawn) {
    const counted = structureOf(section.smiles as string);
    expect(counted.caveats, section.id).toStrictEqual([]);
    expect(counted.rings + counted.piBonds, section.id).toBe(counted.dbe);
  }
});

test('the sulfur and the phosphorus sections open on a visible disagreement', () => {
  const sulfur = learnSectionById('sulfur');
  expect(sulfur.id).toBe('sulfur');
  expect(sulfur.valences).toBeUndefined();
  expect(formulaOf(sulfur.mf as string).dbe).toBe(0);
  expect(structureOf(sulfur.smiles as string).dbe).toBe(1);

  const phosphorus = learnSectionById('phosphorus');
  expect(phosphorus.id).toBe('phosphorus');
  expect(phosphorus.valences).toBeUndefined();
  expect(formulaOf(phosphorus.mf as string).dbe).toBe(0);
  expect(structureOf(phosphorus.smiles as string).dbe).toBe(1);
});

test('the ylide section counts 0 both ways, which is the resolution', () => {
  const ylide = learnSectionById('ylide');
  expect(ylide.mf).toBe('C2H6OS');
  expect(formulaOf(ylide.mf as string).dbe).toBe(0);
  expect(structureOf(ylide.smiles as string).dbe).toBe(0);
});

test('a section that preloads both is one the two directions disagree on', () => {
  const parting: string[] = [];
  for (const section of LEARN_SECTIONS) {
    if (section.smiles === undefined || section.mf === undefined) continue;
    const read = formulaOf(section.mf, section.valences).dbe;
    if (read !== structureOf(section.smiles).dbe) parting.push(section.id);
  }
  expect(parting).toStrictEqual(['sulfur', 'phosphorus', 'impossible-numbers']);
});

test('the prose is within the limits, and its summary is a page description', () => {
  for (const section of LEARN_SECTIONS) {
    const sentences = sentenceCount(section.description);
    expect(sentences, section.id).toBeGreaterThanOrEqual(3);
    expect(sentences, section.id).toBeLessThanOrEqual(5);
    expect(section.summary.length, section.id).toBeGreaterThanOrEqual(110);
    expect(section.summary.length, section.id).toBeLessThanOrEqual(160);
    expect(section.summary, section.id).not.toContain('[[');
    expect(section.notice?.length ?? 0, section.id).toBeLessThanOrEqual(120);
    expect(BANNED.test(section.description), section.id).toBe(false);
    expect(BANNED.test(section.summary), section.id).toBe(false);
  }
});

test('the lookups answer, and an id nobody minted opens the tour', () => {
  expect(learnSectionIndex('rings-and-pi')).toBe(0);
  expect(learnSectionIndex('sulfur')).toBe(5);
  expect(learnSectionIndex('nonsense')).toBe(-1);
  expect(learnSectionById('nonsense').id).toBe('rings-and-pi');
  expect(learnSectionById(null).id).toBe('rings-and-pi');
});
