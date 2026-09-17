/**
 * Every `[[marker]]` the site writes, and every example the glossary answers
 * with.
 *
 * The markers are read with the family's own parser rather than a regexp of
 * our own, so the test and the page agree on what a marker is — including the
 * `[[term|displayed text]]` form, which a hand-rolled pattern gets wrong the
 * first time somebody uses it.
 *
 * An example is a formula and the drawing it is read against, so both sides
 * are parsed and their atom counts compared. A glossary entry that quotes a
 * formula no structure matches is teaching arithmetic on a molecule that does
 * not exist.
 */

import { lookupGlossaryTerm, parseGlossaryMarkers } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { GLOSSARY, GLOSSARY_TERMS } from '../glossary.ts';

import { formulaOf, structureOf } from './compute.ts';
import { BANNED, authoredProse } from './prose.ts';

/**
 * The atom counts of a formula, written so two notations of one composition
 * compare equal: `C6H8N` and the `C6H8N(+)` openchemlib reads off anilinium
 * describe the same atoms and differ only in a charge the drawing states.
 */
function composition(mf: string): string {
  return Object.entries(formulaOf(mf).atoms)
    .map(([symbol, count]) => `${symbol}${count}`)
    .toSorted()
    .join(' ');
}

/** Every term named by a marker anywhere in the content, lowercased. */
function markedTerms(): ReadonlySet<string> {
  const terms = new Set<string>();
  for (const [, text] of authoredProse()) {
    for (const segment of parseGlossaryMarkers(text)) {
      if (segment.kind === 'term') terms.add(segment.term);
    }
  }
  return terms;
}

test('the glossary holds 19 terms, every key lowercase and short enough', () => {
  expect(GLOSSARY_TERMS).toHaveLength(19);
  expect(new Set(GLOSSARY_TERMS).size).toBe(19);
  for (const key of GLOSSARY_TERMS) {
    expect(key).toBe(key.toLowerCase());
    const entry = GLOSSARY[key];
    expect(entry?.title.length, key).toBeGreaterThan(0);
    expect(entry?.summary.length, key).toBeLessThanOrEqual(400);
    expect(BANNED.test(entry?.summary ?? ''), key).toBe(false);
  }
});

test('every entry carries between one and three worked examples', () => {
  for (const key of GLOSSARY_TERMS) {
    const examples = GLOSSARY[key]?.examples ?? [];
    expect(examples.length, key).toBeGreaterThanOrEqual(1);
    expect(examples.length, key).toBeLessThanOrEqual(3);
    for (const example of examples) {
      expect(example.code.length, key).toBeGreaterThan(0);
      expect(example.input, `${key}: ${example.code}`).toBeDefined();
      expect(
        example.note?.length ?? 0,
        `${key}: ${example.code}`,
      ).toBeGreaterThan(0);
      expect(
        example.note?.length ?? 0,
        `${key}: ${example.code}`,
      ).toBeLessThanOrEqual(120);
    }
  }
});

test('every example names a formula the drawing beside it really has', () => {
  const wrong: string[] = [];
  for (const key of GLOSSARY_TERMS) {
    for (const example of GLOSSARY[key]?.examples ?? []) {
      const quoted = composition(example.code);
      const drawn = composition(structureOf(example.input as string).mf);
      if (quoted !== drawn) {
        wrong.push(`${key}: ${example.code} is ${quoted}, drawing is ${drawn}`);
      }
    }
  }
  expect(wrong).toStrictEqual([]);
});

test('every [[marker]] in the content resolves to a glossary entry', () => {
  const unresolved: string[] = [];
  for (const [source, text] of authoredProse()) {
    for (const segment of parseGlossaryMarkers(text)) {
      if (segment.kind !== 'term') continue;
      if (lookupGlossaryTerm(GLOSSARY, segment.term) === undefined) {
        unresolved.push(`${source}: [[${segment.term}]]`);
      }
    }
  }
  expect(unresolved).toStrictEqual([]);
});

test('every glossary entry is named by a marker somewhere', () => {
  const marked = markedTerms();
  const unused = GLOSSARY_TERMS.filter((term) => !marked.has(term));
  expect(unused).toStrictEqual([]);
});

test('the lookup is case-insensitive and refuses an unwritten term', () => {
  expect(lookupGlossaryTerm(GLOSSARY, 'Sulfoxide')?.title).toBe('Sulfoxide');
  expect(lookupGlossaryTerm(GLOSSARY, '  Pi Bond ')?.title).toBe('Pi bond');
  expect(lookupGlossaryTerm(GLOSSARY, 'nonsense')).toBeUndefined();
  expect(lookupGlossaryTerm(GLOSSARY, 'constructor')).toBeUndefined();
});
