/**
 * The same fraction as the cheatsheet's, with one formula's numbers in it.
 *
 * `src/dbe/rule.ts` writes the rule symbolically; this writes what it comes to
 * for the formula on screen. Every coefficient is the same
 * {@link numeratorCoefficient}, so the two can never say different things, and
 * the arithmetic is the reading's own: nothing here adds anything up that
 * `formula.ts` did not already add up.
 *
 * Sulfur and phosphorus keep **every** valence they could be counted at, the
 * one in force marked as counted and the others not. That fork is what the
 * site exists to teach, so the calculator shows it rather than quietly
 * printing the branch it took.
 */

import { formatDbe } from './format.ts';
import { highestFirst, numeratorCoefficient } from './rule.ts';
import type { DbeTerm, FormulaDbe, ValenceOption } from './types.ts';

/** One term above the bar, as the calculator prints it. */
export interface FractionTerm {
  /** A key, unique within the fraction. */
  readonly key: string;
  /** What is counted: `C`, `S(VI)`, `charge`. */
  readonly label: string;
  /** Whether it is added or taken away. */
  readonly sign: '+' | '-';
  /** The arithmetic, in LaTeX: `2 \times 2`, or the charge on its own. */
  readonly tex: string;
  /** Whether it counts, or is a valence the reader did not pick. */
  readonly counted: boolean;
  /** Whether it is the valence picked away from the standard table. */
  readonly chosen: boolean;
}

/** One formula's fraction: the terms above the bar, and what they come to. */
export interface FormulaFraction {
  /** The terms, worth most first, as {@link NUMERATOR_TERMS} writes them. */
  readonly terms: readonly FractionTerm[];
  /** `F`: one unit per separate molecule, in front of the fraction. */
  readonly fragments: number;
  /** What the counted terms come to, in half-DBE units. */
  readonly half: number;
  /** The answer. */
  readonly dbe: number;
}

/**
 * The fraction for one reading.
 * @param value - What the formula counted.
 * @returns The terms above the bar, and what they come to.
 */
export function formulaFraction(value: FormulaDbe): FormulaFraction {
  const written: WrittenTerm[] = [];
  for (const term of value.terms) {
    if (term.options.length === 0) {
      written.push({ coefficient: term.contribution, term: assumedTerm(term) });
      continue;
    }
    for (const option of highestFirst(term.options)) {
      written.push({
        coefficient: numeratorCoefficient(option.valence),
        term: optionTerm(term, option),
      });
    }
  }

  // Worth most first, the same falling run the cheatsheet's rule is written
  // in, so a reader finds their element in the same place in both. The sort is
  // stable, so elements worth the same keep the order the formula writes them.
  const terms = written
    .toSorted((left, right) => right.coefficient - left.coefficient)
    .map((entry) => entry.term);
  // The charge is already in half-DBE units, so it has no coefficient to be
  // ordered by and closes the numerator, as it does in the rule.
  if (value.charge !== 0) terms.push(chargeTerm(value.charge));

  return {
    terms,
    fragments: value.fragments,
    half: value.half,
    dbe: value.dbe,
  };
}

/** A term and what one such atom is worth, while the order is being decided. */
interface WrittenTerm {
  readonly coefficient: number;
  readonly term: FractionTerm;
}

/** An element counted at the one valence the rule assumes for it. */
function assumedTerm(term: DbeTerm): FractionTerm {
  return {
    key: term.symbol,
    label: term.symbol,
    sign: term.contribution < 0 ? '-' : '+',
    tex: productTex(term.contribution, term.count),
    counted: true,
    chosen: term.chosen,
  };
}

/** One of the valences an element could be counted at, counted or not. */
function optionTerm(term: DbeTerm, option: ValenceOption): FractionTerm {
  const coefficient = numeratorCoefficient(option.valence);
  const counted = option.valence === term.valence;
  return {
    key: `${term.symbol}${option.valence}`,
    label: option.label,
    sign: coefficient < 0 ? '-' : '+',
    tex: productTex(coefficient, term.count),
    counted,
    chosen: counted && term.chosen,
  };
}

/**
 * The charge, which is already in half-DBE units and so needs no coefficient.
 *
 * It is **added**, not subtracted: a main-group atom that keeps its octet makes
 * one bond more per unit of positive charge.
 */
function chargeTerm(charge: number): FractionTerm {
  return {
    key: 'charge',
    label: 'charge',
    sign: charge < 0 ? '-' : '+',
    tex: formatDbe(Math.abs(charge)),
    counted: true,
    chosen: false,
  };
}

/** `2 \times 6`: what one atom adds, times how many there are. */
function productTex(coefficient: number, count: number): string {
  return String.raw`${Math.abs(coefficient)} \times ${count}`;
}
