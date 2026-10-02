/**
 * Which valence a formula is being counted at, said out loud.
 *
 * Sulfur and phosphorus are the whole subject of this site: a formula gives
 * one number at S(II) and another at S(VI), so a question that shows a formula
 * carrying one of them and says nothing has not asked anything answerable.
 * Every page that asks for a number therefore states its assumption — the
 * standard table when nothing was chosen, which is the lowest valence, and the
 * chosen one when the question expands it.
 */

import { romanValence } from './format.ts';
import { dbeFromFormula } from './formula.ts';
import type { ValenceChoices } from './types.ts';

/** One element of a formula, and the bond count it is being read at. */
export interface ValenceAssumption {
  /** The element symbol. */
  symbol: string;
  /** How many bonds it is counted as making. */
  valence: number;
  /** Whether that is a choice rather than the standard table's lowest. */
  chosen: boolean;
}

/**
 * The assumptions a formula cannot be read without.
 *
 * Only the elements whose valence is a choice are named: carbon at four and
 * oxygen at two are not assumptions anybody has to be told about.
 * @param mf - The formula, in cheminfo notation.
 * @param valences - The valences the question is counted at.
 * @returns One entry per ambiguous element present, in the formula's order; an
 * empty list for a formula nothing has to be assumed about, and for one the
 * rule cannot read at all.
 */
export function valenceAssumptions(
  mf: string,
  valences?: ValenceChoices,
): readonly ValenceAssumption[] {
  const reading = dbeFromFormula(mf, { valences });
  if (!reading.ok) return [];

  const { ambiguous, terms } = reading.value;
  const assumed: ValenceAssumption[] = [];
  for (const term of terms) {
    if (ambiguous.includes(term.symbol)) {
      assumed.push({
        symbol: term.symbol,
        valence: term.valence,
        chosen: term.chosen,
      });
    }
  }
  return assumed;
}

/**
 * The same, as the clause a question prints: `the S as S(VI)`.
 * @param assumed - What {@link valenceAssumptions} found.
 * @returns The clause, or `''` when there is nothing to assume.
 */
export function assumptionText(assumed: readonly ValenceAssumption[]): string {
  if (assumed.length === 0) return '';
  const named = assumed.map(
    (one) => `the ${one.symbol} as ${valenceLabel(one)}`,
  );
  return named.join(' and ');
}

/**
 * The assumptions that are a choice rather than the standard table's lowest.
 * @param assumed - What {@link valenceAssumptions} found.
 * @returns The expanded ones, which are what a title has to say.
 */
export function chosenAssumptions(
  assumed: readonly ValenceAssumption[],
): readonly ValenceAssumption[] {
  return assumed.filter((one) => one.chosen);
}

/**
 * One assumption as a chemist writes it: `S(VI)`.
 * @param assumed - The element and its bond count.
 * @returns The label.
 */
export function valenceLabel(assumed: ValenceAssumption): string {
  return `${assumed.symbol}(${romanValence(assumed.valence)})`;
}
