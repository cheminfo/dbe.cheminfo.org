/**
 * Every curated question, in both directions.
 *
 * The deck is addressed by **id** — `/exercises/struct-cubane` — so inserting
 * a question never moves anybody else's link, and the progress store keeps an
 * answer under the same key across a release. A generated series carries ids
 * of its own, minted by `src/dbe/series.ts`, and {@link exerciseById} looks
 * one up in the series it was handed rather than in this deck.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';

import { FORMULA_EXERCISES } from './exercises/formula.ts';
import { STRUCTURE_EXERCISES } from './exercises/structure.ts';
import type { DbeExercise } from './exercises/types.ts';

export type {
  DbeAnswer,
  DbeExercise,
  DbeExerciseBase,
  DbeExerciseKind,
  DbeExpectation,
  FormulaExercise,
  StructureExercise,
} from './exercises/types.ts';
export { FORMULA_EXERCISES } from './exercises/formula.ts';
export { STRUCTURE_EXERCISES } from './exercises/structure.ts';

/**
 * The deck, formula questions first.
 *
 * Both directions are offered from the first screen rather than gated behind
 * each other: a student arriving from a mass spectrum wants the formula deck
 * and a student arriving from a drawing wants the other one.
 */
export const EXERCISES: readonly DbeExercise[] = [
  ...FORMULA_EXERCISES,
  ...STRUCTURE_EXERCISES,
];

/** Their ids, for the progress bar, the route table and the crawl path. */
export const EXERCISE_IDS: readonly string[] = EXERCISES.map(
  (exercise) => exercise.id,
);

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

/**
 * One question by the id an address carries.
 * @param id - The id from `/exercises/<id>`.
 * @param series - The generated series in force, when there is one; an id it
 * minted is looked up there rather than in the curated deck.
 * @returns The question, or `undefined` when nothing carries that id.
 */
export function exerciseById(
  id: string,
  series?: readonly DbeExercise[],
): DbeExercise | undefined {
  const generated = series?.find((exercise) => exercise.id === id);
  return generated ?? BY_ID.get(id);
}

/** The questions of one coloured level. */
export function exercisesOfLevel(level: ExerciseLevel): readonly DbeExercise[] {
  return EXERCISES.filter((exercise) => exercise.level === level);
}

/** The questions asked in one direction. */
export function exercisesOfKind(
  kind: DbeExercise['kind'],
): readonly DbeExercise[] {
  return EXERCISES.filter((exercise) => exercise.kind === kind);
}
