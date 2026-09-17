/**
 * What a section of the short explanation preloads into the calculator.
 *
 * A section is a working configuration the reader is free to edit, never a
 * slide: it names a formula, a structure, or both, and the calculator under
 * the prose opens on them. The sulfur and phosphorus sections open on *both*,
 * because their whole point is the two numbers disagreeing on one screen.
 */

import type { TutorialStep } from 'react-cheminfo/core';

import type { ValenceChoices } from '../../dbe/types.ts';

/** What the calculator under one section opens on. */
export interface LearnPayload {
  /**
   * The formula the calculator opens on.
   * @default '' — the formula half opens empty
   */
  mf?: string;
  /**
   * The structure the calculator opens on, as SMILES.
   * @default '' — the structure half opens empty
   */
  smiles?: string;
  /**
   * The valences the section is about, when it is about one.
   * @default {} — every element at its default, S at 2 and P at 3
   */
  valences?: ValenceChoices;
  /**
   * The sentence `/learn/<id>` is described by in a search result. Written for
   * search rather than cut from {@link TutorialStep.description}, which
   * carries `[[term]]` markers a crawler would print verbatim.
   */
  summary: string;
  /**
   * One line under the calculator: what to look at once it has opened.
   * @default undefined — the numbers speak for themselves
   */
  notice?: string;
}

/** One section of the short explanation. */
export type LearnSection = TutorialStep<LearnPayload>;
