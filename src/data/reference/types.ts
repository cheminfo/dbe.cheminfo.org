/**
 * The cheatsheet, in the family's own shape, plus the one thing this site adds.
 *
 * A row that quotes a number carries a {@link RowCheck}, and
 * `src/data/__tests__/reference.test.ts` recomputes every one of them with
 * `src/dbe`. A printed sheet is the page a student trusts most and corrects
 * least, so a number on it may not be a number somebody typed.
 *
 * A section carries its **level** rather than a colour, and the page paints
 * it — which is what keeps every hex out of the content.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';
import type { ReferenceRow, ReferenceSection } from 'react-cheminfo/ui';

import type { ValenceChoices } from '../../dbe/types.ts';

export type { ReferenceRow, ReferenceSection } from 'react-cheminfo/ui';

/** The claim a row makes, in a form the test suite can recompute. */
export interface RowCheck {
  /** The formula the row quotes, as the formula rule is run on it. */
  mf: string;
  /** What the formula rule gives for it at {@link valences}. */
  reads: number;
  /**
   * The drawing the row quotes, when it quotes one.
   * @default undefined — the row is about the formula alone
   */
  smiles?: string;
  /**
   * What that drawing counts. Written whenever {@link smiles} is.
   * @default undefined
   */
  counts?: number;
  /**
   * The valences {@link reads} assumes.
   * @default {} — the shared table, sulfur at 2 and phosphorus at 3
   */
  valences?: ValenceChoices;
}

/** One line of the cheatsheet, with the claim it makes. */
export interface DbeReferenceRow extends ReferenceRow {
  /**
   * The numbers this row states, recomputed in a unit test.
   * @default undefined — the row states no number
   */
  check?: RowCheck;
}

/** One block of the printable sheet. */
export interface DbeReferenceSection extends ReferenceSection {
  /** Which coloured level this block belongs to. */
  level: ExerciseLevel;
  rows: DbeReferenceRow[];
}

/**
 * One row of the sheet.
 * @param syntax - The construct, set in monospace and kept short.
 * @param description - What it does, in one line a reader can take in on paper.
 * @param check - The numbers the description states, when it states any.
 * @returns The row.
 */
export function row(
  syntax: string,
  description: string,
  check?: RowCheck,
): DbeReferenceRow {
  return check === undefined
    ? { syntax, description }
    : { syntax, description, check };
}
