/**
 * How hard a formula question is, read off the formula itself.
 *
 * A student reading a formula does not meet the molecule, so what makes the
 * question hard is which elements are in it and nothing else:
 *
 * - **beginner** — carbon, hydrogen and oxygen. Oxygen bridges two bonds and
 *   costs nothing, so the sum is the one the lesson opens on.
 * - **intermediate** — nitrogen, or a halogen. Each is one rule more: nitrogen
 *   adds a half, and F, Cl, Br and I count as hydrogens do.
 * - **advanced** — sulfur, phosphorus, selenium or arsenic. Their valence is a
 *   choice rather than a fact — S at 2, 4 or 6, P at 3 or 5 — so the formula
 *   gives a lower bound and the student has to say what was assumed. A metal
 *   is advanced for the same reason: the covalent assumption behind the whole
 *   rule is the wrong one.
 *
 * The structure direction keeps the level written on the pool entry: a drawing
 * states its own bond counts, so what makes it hard is the skeleton.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';

import { dbeFromFormula } from './formula.ts';
import { METAL_ELEMENTS, VALENCE_ELEMENTS } from './valences.ts';

/** The halogens, each counted exactly as a hydrogen is. */
const HALOGENS: ReadonlySet<string> = new Set(['F', 'Cl', 'Br', 'I']);

/**
 * The level a question reading this formula is asked at.
 * @param mf - The formula, in cheminfo notation.
 * @returns Beginner for C, H and O; intermediate for nitrogen or a halogen;
 * advanced for an element whose valence the student has to choose, or a metal — and for a
 * formula the rule cannot read at all, which is never a beginner's question.
 */
export function formulaExerciseLevel(mf: string): ExerciseLevel {
  const reading = dbeFromFormula(mf);
  if (!reading.ok) return 'advanced';

  const symbols = Object.keys(reading.value.atoms);
  let level: ExerciseLevel = 'beginner';
  for (const symbol of symbols) {
    if (VALENCE_ELEMENTS.includes(symbol) || METAL_ELEMENTS.includes(symbol)) {
      return 'advanced';
    }
    if (symbol === 'N' || HALOGENS.has(symbol)) level = 'intermediate';
  }
  return level;
}
