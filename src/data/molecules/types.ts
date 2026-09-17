/**
 * One molecule the generated series and the worked examples draw from.
 *
 * Every number here is **checked against openchemlib** in
 * `src/data/__tests__/molecules.test.ts`: the formula is read off the drawing,
 * and `rings`, `piBonds` and `dbe` are recomputed rather than compared with
 * themselves. An entry is data a chemist can edit, so the gate that keeps it
 * honest has to be a test and not a convention.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';

import type { ValenceChoices } from '../../dbe/types.ts';

/** What a pool entry is about, so a series can be balanced rather than random. */
export type PoolTag =
  /** An open chain: the baseline a formula is read against. */
  | 'chain'
  /** Carries at least one ring. */
  | 'ring'
  /** Carries an aromatic ring, drawn Kekulé when it is counted. */
  | 'aromatic'
  /** Carries a triple bond, which is two pi bonds and is read as one. */
  | 'triple'
  /** Carries a C=O or a C=S. */
  | 'carbonyl'
  /** Carries F, Cl, Br or I, each counted as a hydrogen. */
  | 'halogen'
  /** Carries nitrogen, the element that pays half its own way. */
  | 'nitrogen'
  /** Carries a nitro group, drawn charge-separated and therefore never hypervalent. */
  | 'nitro'
  /** Carries sulfur, at two, four or six bonds. */
  | 'sulfur'
  /** Carries phosphorus, at three or five bonds. */
  | 'phosphorus';

/** One molecule of the pool. */
export interface PoolEntry {
  /** Stable and URL-safe; it seeds the id of a generated question. */
  readonly id: string;
  /** What it is called. */
  readonly name: string;
  /** Its structure. */
  readonly smiles: string;
  /**
   * Its formula, as openchemlib writes it off the drawing — so a formula
   * question needs no structure toolkit to be asked.
   */
  readonly mf: string;
  /** What the drawing counts: `rings + piBonds`. */
  readonly dbe: number;
  /** Independent rings: bonds − atoms + fragments. */
  readonly rings: number;
  /** `Σ(order − 1)` over every bond of order two or more. */
  readonly piBonds: number;
  /**
   * The valences at which the formula rule also gives {@link dbe}. An entry
   * whose drawing expands an octet declares them, and an entry the shared
   * table already agrees with leaves them out.
   * @default {} — the shared table agrees with the drawing
   */
  readonly valences?: ValenceChoices;
  /** How hard it is, which is also how it is coloured. */
  readonly level: ExerciseLevel;
  /** What it is an example of. */
  readonly tags: readonly PoolTag[];
  /** One clause on what this molecule is here to show. */
  readonly note: string;
}
