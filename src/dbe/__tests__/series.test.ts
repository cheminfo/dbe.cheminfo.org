/**
 * A problem set built from a seed, and the promise the link makes.
 *
 * The link a teacher hands out carries only the seed, the length, the level and
 * the direction, so every one of those four has to be honoured exactly and the
 * seed has to give the same set every time. The ids are pinned as well: they
 * are what `/exercises/s4271-3` addresses and what the progress store keeps, so
 * a change to them loses a student's answers.
 */

import { expect, test } from 'vitest';

import type {
  FormulaExercise,
  StructureExercise,
} from '../../data/exercises/types.ts';
import { MOLECULE_POOL } from '../../data/molecules.ts';
import { dbeOfFormula } from '../formula.ts';
import {
  generateSeries,
  isSeriesExerciseId,
  seriesExerciseId,
} from '../series.ts';

test('one seed gives one problem set, every time', () => {
  const options = {
    seed: 4271,
    count: 8,
    level: 'mixed',
    direction: 'both',
  } as const;
  const first = generateSeries(options);
  const again = generateSeries(options);
  expect(again).toStrictEqual(first);
  expect(first.map((question) => [question.id, question.kind])).toStrictEqual([
    ['s4271-1', 'formula'],
    ['s4271-2', 'structure'],
    ['s4271-3', 'formula'],
    ['s4271-4', 'structure'],
    ['s4271-5', 'formula'],
    ['s4271-6', 'structure'],
    ['s4271-7', 'formula'],
    ['s4271-8', 'structure'],
  ]);
  expect(first[0]?.title).toBe('Read the formula C4H6');
  expect(first[1]?.title).toBe('Count the drawing of Phenol');
});

test('another seed gives another problem set', () => {
  const four = generateSeries({
    seed: 4271,
    count: 6,
    level: 'mixed',
    direction: 'both',
  });
  const nine = generateSeries({
    seed: 99,
    count: 6,
    level: 'mixed',
    direction: 'both',
  });
  expect(nine).not.toStrictEqual(four);
  expect(nine.map((question) => question.title)).not.toStrictEqual(
    four.map((question) => question.title),
  );
});

test('the length is honoured, and wraps round a pool it outruns', () => {
  const lengths = [1, 5, 12].map(
    (count) =>
      generateSeries({
        seed: 12,
        count,
        level: 'mixed',
        direction: 'structure',
      }).length,
  );
  expect(lengths).toStrictEqual([1, 5, 12]);

  const long = generateSeries({
    seed: 12,
    count: MOLECULE_POOL.length + 4,
    level: 'mixed',
    direction: 'structure',
  });
  expect([long.length, long.at(-1)?.id]).toStrictEqual([
    MOLECULE_POOL.length + 4,
    seriesExerciseId(12, MOLECULE_POOL.length + 3),
  ]);

  expect(
    generateSeries({ seed: 12, count: 0, level: 'mixed', direction: 'both' }),
  ).toStrictEqual([]);
  expect(
    generateSeries({ seed: 12, count: -3, level: 'mixed', direction: 'both' }),
  ).toStrictEqual([]);
});

test('the level is honoured, and mixed draws from all three', () => {
  for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
    const series = generateSeries({
      seed: 31,
      count: 6,
      level,
      direction: 'structure',
    });
    expect([
      level,
      [...new Set(series.map((question) => question.level))],
    ]).toStrictEqual([level, [level]]);
  }

  const mixed = generateSeries({
    seed: 31,
    count: 20,
    level: 'mixed',
    direction: 'structure',
  });
  expect(
    [...new Set(mixed.map((question) => question.level))].toSorted(),
  ).toStrictEqual(['advanced', 'beginner', 'intermediate']);
});

test('the direction is honoured, and both alternates', () => {
  const formulas = generateSeries({
    seed: 12,
    count: 10,
    level: 'mixed',
    direction: 'formula',
  });
  const structures = generateSeries({
    seed: 12,
    count: 10,
    level: 'mixed',
    direction: 'structure',
  });
  expect([
    [...new Set(formulas.map((question) => question.kind))],
    [...new Set(structures.map((question) => question.kind))],
  ]).toStrictEqual([['formula'], ['structure']]);

  const both = generateSeries({
    seed: 5,
    count: 6,
    level: 'mixed',
    direction: 'both',
  });
  expect(both.map((question) => question.kind)).toStrictEqual([
    'formula',
    'structure',
    'formula',
    'structure',
    'formula',
    'structure',
  ]);
});

test('a formula question is never asked where the formula cannot answer it', () => {
  const series = generateSeries({
    seed: 77,
    count: 20,
    level: 'mixed',
    direction: 'formula',
  });
  for (const question of series) {
    const asked = question as FormulaExercise;
    expect([asked.mf, dbeOfFormula(asked.mf)]).toStrictEqual([
      asked.mf,
      asked.expected.dbe,
    ]);
  }

  // Seed 99 asks its third question about a molecule the table cannot reach, so
  // it is asked as a drawing although `both` would have asked for a formula.
  const alternating = generateSeries({
    seed: 99,
    count: 3,
    level: 'mixed',
    direction: 'both',
  });
  expect(alternating.map((question) => question.kind)).toStrictEqual([
    'formula',
    'structure',
    'structure',
  ]);
});

test('a question carries everything its card draws', () => {
  const [formula, structure] = generateSeries({
    seed: 4271,
    count: 2,
    level: 'mixed',
    direction: 'both',
  });
  const asked = formula as FormulaExercise;
  const drawn = structure as StructureExercise;

  expect([
    asked.kind,
    asked.mf,
    asked.expected,
    asked.smiles,
    asked.hints.length,
  ]).toStrictEqual(['formula', 'C4H6', { dbe: 2 }, 'C=CC=C', 2]);
  expect(asked.solution).toBe(
    'C4H6 counts 2, and the drawing behind it is Buta-1,3-diene.',
  );
  expect([
    drawn.kind,
    drawn.name,
    drawn.mf,
    drawn.expected,
    drawn.smiles,
  ]).toStrictEqual(['structure', 'Phenol', 'C6H6O', { dbe: 4 }, 'Oc1ccccc1']);
  expect(drawn.solution).toBe('Phenol counts 4.');
});

test('a series id round-trips through the address it is read from', () => {
  expect([
    seriesExerciseId(4271, 0),
    seriesExerciseId(4271, 2),
    seriesExerciseId(7, 11),
  ]).toStrictEqual(['s4271-1', 's4271-3', 's7-12']);
  expect([
    isSeriesExerciseId('s4271-1'),
    isSeriesExerciseId(seriesExerciseId(99, 5)),
    isSeriesExerciseId('s4271'),
    isSeriesExerciseId('S4271-1'),
    isSeriesExerciseId('benzene'),
    isSeriesExerciseId('sx-1'),
  ]).toStrictEqual([true, true, false, false, false, false]);
});
