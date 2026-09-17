import { expect, test } from 'vitest';

import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_TARGET,
  describe,
  summarize,
} from '../describe.ts';

const BASE =
  'Sulfur is counted at two bonds by the table, and a sulfoxide holds four.';

const SHORT_CLAUSE = 'Each S=O is one unit the rule cannot see.';

test('a base already long enough is left exactly as it was written', () => {
  const base = 'x'.repeat(DESCRIPTION_TARGET);
  expect(describe(base, [['never used.']])).toBe(base);
});

test('the longest clause that still fits is the one taken', () => {
  expect(
    describe(BASE, [
      [
        'A clause far too long to sit beside a base of seventy-two characters, and then some more of it to be sure.',
        'Every S=O the rule cannot see is one unit of unsaturation missing from the answer.',
        'One unit per S=O.',
      ],
    ]),
  ).toBe(
    'Sulfur is counted at two bonds by the table, and a sulfoxide holds four. Every S=O the rule cannot see is one unit of unsaturation missing from the answer.',
  );
});

test('at most one clause of a choice is used, however often it is offered', () => {
  const text = describe(BASE, [[SHORT_CLAUSE, SHORT_CLAUSE, SHORT_CLAUSE]]);

  expect(text.split(SHORT_CLAUSE)).toHaveLength(2);
  expect(text.length).toBe(114);
});

test('growing stops at the target, so a later choice is left off', () => {
  const text = describe(BASE, [
    [
      'Every S=O the rule cannot see is one unit of unsaturation missing from the answer.',
    ],
    ['Phosphorus does the same, one unit per P=O.'],
  ]);

  expect(text).not.toContain('Phosphorus');
  expect(text.length).toBe(155);
});

test('an empty choice contributes nothing and the next one is tried', () => {
  expect(describe(BASE, [[], [SHORT_CLAUSE]])).toBe(
    'Sulfur is counted at two bonds by the table, and a sulfoxide holds four. Each S=O is one unit the rule cannot see.',
  );
});

test('a description that cannot reach the floor is refused where it is written', () => {
  expect(() => describe('Too short.')).toThrow(
    /a page description is 110 to 160 characters; this one is 10: Too short\./,
  );
});

test('a base already past the ceiling is refused rather than truncated', () => {
  expect(() => describe('y'.repeat(DESCRIPTION_MAX + 1))).toThrow(
    /this one is 161/,
  );
});

test('the window is the one a search result shows whole', () => {
  expect([DESCRIPTION_MIN, DESCRIPTION_TARGET, DESCRIPTION_MAX]).toStrictEqual([
    110, 132, 160,
  ]);
});

test('a summary resolves the markers and stops on a whole sentence', () => {
  expect(
    summarize(
      'The [[dbe|degree of unsaturation]] is one number for two things: [[ring|rings]] and [[pi bond|pi bonds]], added together. Cyclohexene has one ring and one double bond, so its DBE is 2. Open the ring and the number falls to 1.',
    ),
  ).toBe(
    'The degree of unsaturation is one number for two things: rings and pi bonds, added together. Cyclohexene has one ring and one double bond, so its DBE is 2.',
  );
});

test('prose that already fits a search result is kept whole', () => {
  const prose =
    'Oxygen holds two bonds and bridges them, so it adds nothing at all: glucose C6H12O6 reads 1, exactly as the same skeleton without a single oxygen in it.';

  expect(summarize(prose)).toBe(prose);
  expect(prose.length).toBe(152);
});

test('a first sentence that overruns is cut on a word, not mid-syllable', () => {
  const text = summarize(
    'A degree of unsaturation below zero is the rule telling you that one of the valences it assumed is not the valence the molecule actually holds, and sulfur hexafluoride is the plainest case of it.',
  );

  expect(text).toBe(
    'A degree of unsaturation below zero is the rule telling you that one of the valences it assumed is not the valence the molecule actually holds, and sulfur…',
  );
  expect(text.length).toBe(155);
});
