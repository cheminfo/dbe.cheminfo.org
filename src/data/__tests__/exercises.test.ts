/**
 * The gate that keeps the deck honest.
 *
 * Twenty questions carry an authored answer. None of them is trusted: a
 * formula question is re-read with `dbeFromFormula` at its own valences, a
 * structure question is re-counted with `dbeFromStructure` from its SMILES,
 * and the recomputed number is then marked by the real validator. An answer
 * typed wrongly into a data file therefore fails the build instead of a
 * student.
 *
 * The last test is the one the site exists for: the questions where the two
 * directions disagree are named, so a deck that loses its sulfur half — or
 * gains a disagreement nobody meant — cannot ship quietly.
 */

import { expect, test } from 'vitest';

import { validateDbeAnswer } from '../../dbe/index.ts';
import type { DbeExercise } from '../exercises/types.ts';
import {
  EXERCISES,
  EXERCISE_IDS,
  exerciseById,
  exercisesOfKind,
  exercisesOfLevel,
} from '../exercises.ts';

import { URL_SAFE, formulaOf, structureOf } from './compute.ts';
import { BANNED, sentenceCount } from './prose.ts';

/** What the domain says the answer is, never what the question says. */
function derived(exercise: DbeExercise): {
  dbe: number;
  rings?: number;
  piBonds?: number;
} {
  if (exercise.kind === 'formula') {
    return { dbe: formulaOf(exercise.mf, exercise.valences).dbe };
  }
  const counted = structureOf(exercise.smiles);
  return {
    dbe: counted.dbe,
    rings: counted.rings,
    piBonds: counted.piBonds,
  };
}

/** The formula and the structure of a question that carries both. */
function bothReadings(exercise: DbeExercise): [number, number] | null {
  const smiles = exercise.smiles;
  if (smiles === undefined) return null;
  return [
    formulaOf(exercise.mf, exercise.valences).dbe,
    structureOf(smiles).dbe,
  ];
}

test('the deck is 20 questions, ten each way, with unique linkable ids', () => {
  expect(EXERCISES).toHaveLength(20);
  expect(EXERCISE_IDS).toHaveLength(20);
  expect(new Set(EXERCISE_IDS).size).toBe(20);
  expect(exercisesOfKind('formula')).toHaveLength(10);
  expect(exercisesOfKind('structure')).toHaveLength(10);
  expect(exercisesOfLevel('beginner')).toHaveLength(6);
  expect(exercisesOfLevel('intermediate')).toHaveLength(6);
  expect(exercisesOfLevel('advanced')).toHaveLength(8);
  for (const exercise of EXERCISES) {
    expect(exercise.id).toMatch(URL_SAFE);
    expect(['formula', 'structure'], exercise.id).toContain(exercise.kind);
  }
});

test('every question carries two to four hints and a revealable solution', () => {
  for (const exercise of EXERCISES) {
    expect(exercise.hints.length, exercise.id).toBeGreaterThanOrEqual(2);
    expect(exercise.hints.length, exercise.id).toBeLessThanOrEqual(4);
    expect(exercise.solution.length, exercise.id).toBeGreaterThan(0);
    expect(exercise.title.length, exercise.id).toBeLessThanOrEqual(60);
    for (const hint of exercise.hints) {
      expect(sentenceCount(hint), `${exercise.id}: ${hint}`).toBe(1);
      expect(hint.length, `${exercise.id}: ${hint}`).toBeLessThanOrEqual(160);
    }
    const sentences = sentenceCount(exercise.description);
    expect(sentences, exercise.id).toBeGreaterThanOrEqual(3);
    expect(sentences, exercise.id).toBeLessThanOrEqual(5);
    for (const text of [exercise.description, exercise.solution]) {
      expect(BANNED.test(text), exercise.id).toBe(false);
    }
  }
});

test('every authored answer is the one the domain derives', () => {
  const wrong: string[] = [];
  for (const exercise of EXERCISES) {
    const computed = derived(exercise);
    if (exercise.expected.dbe !== computed.dbe) {
      wrong.push(
        `${exercise.id}: says ${exercise.expected.dbe}, computes ${computed.dbe}`,
      );
    }
  }
  expect(wrong).toStrictEqual([]);
});

test('a split question carries the two halves, and they add up', () => {
  const split = EXERCISES.filter((exercise) => exercise.split === true);
  expect(split.map((exercise) => exercise.id)).toStrictEqual([
    'struct-naphthalene',
    'struct-camphor',
    'struct-adamantane',
    'struct-cubane',
    'struct-sulfone',
  ]);
  for (const exercise of split) {
    const computed = derived(exercise);
    expect(exercise.expected.rings, exercise.id).toBe(computed.rings);
    expect(exercise.expected.piBonds, exercise.id).toBe(computed.piBonds);
    expect(
      (exercise.expected.rings ?? 0) + (exercise.expected.piBonds ?? 0),
      exercise.id,
    ).toBe(exercise.expected.dbe);
  }
  for (const exercise of EXERCISES) {
    if (exercise.split === true) continue;
    expect(exercise.expected.rings, exercise.id).toBeUndefined();
    expect(exercise.expected.piBonds, exercise.id).toBeUndefined();
  }
});

test('a structure question shows the formula of the structure it draws', () => {
  const wrong: string[] = [];
  for (const exercise of EXERCISES) {
    if (exercise.kind !== 'structure') continue;
    const read = structureOf(exercise.smiles).mf;
    if (read !== exercise.mf) {
      wrong.push(`${exercise.id}: ${exercise.mf} vs ${read}`);
    }
    expect(exercise.name.length, exercise.id).toBeGreaterThan(0);
  }
  expect(wrong).toStrictEqual([]);
});

test('the derived answer passes the validator, and one off it fails', () => {
  for (const exercise of EXERCISES) {
    const computed = derived(exercise);
    const answer = {
      dbe: String(computed.dbe),
      rings: String(computed.rings ?? ''),
      piBonds: String(computed.piBonds ?? ''),
    };
    const right = validateDbeAnswer(exercise.kind, exercise.expected, answer);
    expect(
      right.cases.filter((one) => !one.passed).map((one) => one.reason),
      exercise.id,
    ).toStrictEqual([]);
    expect(right.passed, exercise.id).toBe(true);

    const near = validateDbeAnswer(exercise.kind, exercise.expected, {
      ...answer,
      dbe: String(computed.dbe + 1),
    });
    expect(near.passed, exercise.id).toBe(false);
  }
});

test('six questions are the S and P cases where the two directions part', () => {
  const disagreeing: string[] = [];
  for (const exercise of EXERCISES) {
    const readings = bothReadings(exercise);
    if (readings === null) continue;
    if (readings[0] !== readings[1]) disagreeing.push(exercise.id);
  }
  expect(disagreeing).toStrictEqual([
    'mf-dmso',
    'mf-phosphate',
    'mf-sf6',
    'struct-sulfone',
    'struct-sulfanilamide',
    'struct-tppo',
  ]);
  for (const id of disagreeing) {
    const exercise = exerciseById(id) as DbeExercise;
    // The gap is always a valence the formula had to guess, never a charge.
    expect(formulaOf(exercise.mf).ambiguous.length, id).toBeGreaterThan(0);
    expect(exercise.level, id).toBe('advanced');
  }
});

test('the lookup answers, and refuses an id nobody minted', () => {
  expect(exerciseById('struct-cubane')?.kind).toBe('structure');
  expect(exerciseById('mf-sf6')?.level).toBe('advanced');
  expect(exerciseById('nonsense')).toBeUndefined();
});
