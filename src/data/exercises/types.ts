/**
 * The two kinds of question, and what each one carries.
 *
 * **The authored answer is never the source of truth.** `src/dbe` derives it
 * from the formula or from the drawing, and the number written here exists so
 * `src/data/__tests__/exercises.test.ts` can hold the two together: a wrong
 * number in a data file then fails the build rather than a student.
 *
 * There are two kinds because a degree of unsaturation has two sides. A third
 * kind asking the student to *draw* a structure of a given DBE was considered
 * and cut: it asks for a structure rather than for a count, and marking it is
 * a different subject.
 */

import type { BaseExercise } from 'react-cheminfo/core';

import type {
  DbeExerciseKind,
  DbeExpectation,
  ValenceChoices,
} from '../../dbe/types.ts';

export type {
  DbeAnswer,
  DbeExerciseKind,
  DbeExpectation,
} from '../../dbe/types.ts';

/** What every question of this site carries. */
export interface DbeExerciseBase extends BaseExercise {
  /** Which direction the question asks in. */
  kind: DbeExerciseKind;
  /**
   * The valences {@link expected} is computed at.
   * @default {} — the shared table, sulfur at 2 and phosphorus at 3
   */
  valences?: ValenceChoices;
  /**
   * Whether the answer box asks for rings and pi bonds separately as well as
   * for the total. A question that sets it must carry both halves in
   * {@link DbeExpectation}.
   * @default false — the total alone
   */
  split?: boolean;
}

/** Read a molecular formula, answer the degree of unsaturation. */
export interface FormulaExercise extends DbeExerciseBase {
  kind: 'formula';
  /** The formula the question shows, rendered with `react-mf`. */
  mf: string;
  /** What the formula rule gives at {@link DbeExerciseBase.valences}. */
  expected: DbeExpectation;
  /**
   * A structure the card offers once the answer is in, so a formula whose
   * drawing disagrees can show what it disagrees with.
   * @default undefined — the card shows no structure
   */
  smiles?: string;
}

/** Look at a structure, answer the degree of unsaturation. */
export interface StructureExercise extends DbeExerciseBase {
  kind: 'structure';
  /** The structure the question draws, as SMILES. */
  smiles: string;
  /** What it is called, shown once the answer is in. */
  name: string;
  /** Its formula, checked against the drawing in a unit test. */
  mf: string;
  /** What the drawing counts. */
  expected: DbeExpectation;
}

/** One question, whichever direction it asks in. */
export type DbeExercise = FormulaExercise | StructureExercise;
