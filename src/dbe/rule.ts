/**
 * The rule as one fraction: every possibility above the bar, a single division
 * by two below it, and one unit per separate molecule in front.
 *
 * Everything above the bar is in **half-DBE units**, which is what makes every
 * coefficient a whole number — carbon adds 2, hydrogen takes 1 away, oxygen
 * adds 0 — and leaves one visible halving at the end rather than a fraction on
 * every term. The charge sits there for the same reason: it is already in
 * those units.
 *
 * The cheatsheet opens on it, so it is written here rather than typed into the
 * page: no coefficient is written down at all. Each one is `valence − 2`, read
 * out of {@link DEFAULT_VALENCES} for the elements nobody chooses and out of
 * {@link VALENCE_OPTIONS} for sulfur and phosphorus, and a unit test holds the
 * result against both tables. A sheet a student takes into an exam room may
 * not drift from the table the tool counts on.
 *
 * `X` stands for the halogens and `M` for the alkali metals, because a term
 * naming all seven is a term nobody reads; {@link RuleGroup.symbols} keeps the
 * elements themselves, which is what the test recomputes.
 */

import type { ValenceOption } from './types.ts';
import { DEFAULT_VALENCES, VALENCE_OPTIONS } from './valences.ts';

/** The rule as it is stated: one per part, half the charge, half every (v − 2). */
export const GENERAL_RULE_TEX = String.raw`\displaystyle \mathrm{DBE} = F + \frac{q}{2} + \frac{1}{2}\sum_i n_i\left(v_i - 2\right)`;

/** The elements whose valence the reader chooses, in reading order. */
export const OPEN_VALENCE_SYMBOLS: readonly string[] = ['S', 'P'];

/** One count of the numerator whose valence nobody chooses. */
export interface RuleGroup {
  /** What the term is called, for a test naming the one that failed. */
  readonly id: string;
  /** What is counted, as the fraction labels it: `C`, `X`, `M`. */
  readonly label: string;
  /** The elements it stands for, as the valence table names them. */
  readonly symbols: readonly string[];
}

/**
 * The elements whose valence nobody chooses, one count each, in reading order.
 *
 * Oxygen is here although its coefficient is 0: a reader who does not see
 * oxygen assumes it was forgotten, and seeing the 0 is what teaches that
 * counting it changes nothing. Silicon holds carbon's four bonds and the
 * alkali metals hydrogen's one, so each gets a count rather than a footnote.
 */
export const RULE_GROUPS: readonly RuleGroup[] = [
  { id: 'carbon', label: 'C', symbols: ['C'] },
  { id: 'silicon', label: 'Si', symbols: ['Si'] },
  { id: 'nitrogen', label: 'N', symbols: ['N'] },
  { id: 'oxygen', label: 'O', symbols: ['O'] },
  { id: 'hydrogen', label: 'H', symbols: ['H'] },
  { id: 'halogens', label: 'X', symbols: ['F', 'Cl', 'Br', 'I'] },
  { id: 'alkali', label: 'M', symbols: ['Li', 'Na', 'K'] },
];

/** One term above the bar, in half-DBE units. */
export interface NumeratorTerm {
  /** Whether the valence is assumed, or is one the reader picks. */
  readonly kind: 'fixed' | 'chosen';
  /** What is counted, as the fraction labels it: `C`, `X`, `S(VI)`. */
  readonly label: string;
  /** The elements it stands for, as the valence table names them. */
  readonly symbols: readonly string[];
  /** The valence they are counted at. */
  readonly valence: number;
  /** `valence − 2`: what one such atom adds above the bar. */
  readonly coefficient: number;
}

/**
 * Every term above the bar, in the order the fraction writes them: worth most
 * first, from the 4 a sulfone's sulfur adds down to the 1 a hydrogen takes
 * away.
 *
 * The three sulfur terms are not three sulfurs: each atom is counted once, in
 * whichever of them the reader puts it.
 */
export const NUMERATOR_TERMS: readonly NumeratorTerm[] = buildNumerator();

/** The whole rule as one fraction, the charge above the bar with the rest. */
export const WRITTEN_RULE_TEX: string = writeRule();

/** What a letter of the two formulas stands for. */
export interface RuleSymbol {
  /** The letter, in LaTeX. */
  readonly tex: string;
  /** What it is, in one clause. */
  readonly meaning: string;
}

/** The legend under the two formulas, in the order the letters appear. */
export const RULE_LEGEND: readonly RuleSymbol[] = [
  { tex: 'F', meaning: 'separate molecules — the +1, and a hydrate is two' },
  { tex: 'q', meaning: 'the total charge, added not subtracted' },
  { tex: 'n_i', meaning: 'how many atoms of that element' },
  { tex: 'v_i', meaning: 'the valence it is counted at' },
  {
    tex: countTex('S(VI)'),
    meaning: 'how many S you count at six bonds',
  },
  { tex: String.raw`\mathrm{X}`, meaning: 'F, Cl, Br, I' },
  { tex: String.raw`\mathrm{M}`, meaning: 'Li, Na, K' },
];

/**
 * What one atom of a given valence adds above the bar.
 *
 * This is the whole rule: a tetravalent carbon adds 2, a monovalent hydrogen
 * takes 1 away, a divalent oxygen adds nothing. It is written once, here.
 * @param valence - How many bonds the atom makes.
 * @returns The coefficient, in half-DBE units.
 */
export function numeratorCoefficient(valence: number): number {
  return valence - 2;
}

/**
 * An element's valences, the one that contributes most written first.
 * @param options - The valences it can be counted at.
 * @returns The same list, highest valence first.
 */
export function highestFirst(
  options: readonly ValenceOption[],
): readonly ValenceOption[] {
  return options.toSorted((left, right) => right.valence - left.valence);
}

/**
 * How a count is written: `n` with what it counts under it.
 * @param label - What is counted: `C`, `X`, `S(VI)`.
 * @returns The count, in LaTeX.
 */
export function countTex(label: string): string {
  return String.raw`n_{\mathrm{${label}}}`;
}

/**
 * One term as the fraction writes it: `2\,n_{\mathrm{C}}`, `- 1\,n_{\mathrm{H}}`.
 * @param coefficient - What one atom adds, in half-DBE units.
 * @param count - The count, from {@link countTex}.
 * @param leading - Whether it opens a line, so a `+` in front would be noise.
 * @returns The term, in LaTeX.
 */
export function termTex(
  coefficient: number,
  count: string,
  leading = false,
): string {
  const sign = coefficient < 0 ? '-' : '+';
  const head = leading && sign === '+' ? '' : `${sign} `;
  return String.raw`${head}${Math.abs(coefficient)}\,${count}`;
}

/** The fraction, assembled so no coefficient is written down. */
function writeRule(): string {
  const terms: string[] = [];
  for (const term of NUMERATOR_TERMS) {
    terms.push(
      termTex(term.coefficient, countTex(term.label), terms.length === 0),
    );
  }
  terms.push('+ q');
  // One line, in one falling run from 4 down to -1: the reader is meant to see
  // the whole rule at once and find their element by what it is worth. The
  // display scrolls on a narrow screen rather than wrapping, because a term
  // broken across two lines reads as two terms.
  return String.raw`\displaystyle \mathrm{DBE} = \frac{${terms.join(' ')}}{2} + 1`;
}

/** Every term, the fixed valences first and the chosen ones highest first. */
function buildNumerator(): readonly NumeratorTerm[] {
  const terms: NumeratorTerm[] = [];
  for (const group of RULE_GROUPS) {
    const valence = groupValence(group);
    terms.push({
      kind: 'fixed',
      label: group.label,
      symbols: group.symbols,
      valence,
      coefficient: numeratorCoefficient(valence),
    });
  }
  for (const symbol of OPEN_VALENCE_SYMBOLS) {
    for (const option of highestFirst(VALENCE_OPTIONS[symbol] ?? [])) {
      terms.push({
        kind: 'chosen',
        label: option.label,
        symbols: [symbol],
        valence: option.valence,
        coefficient: numeratorCoefficient(option.valence),
      });
    }
  }
  // Worth most first, down to the elements that take away: a reader looks up
  // what their element is worth, and the run from 4 to -1 is the rule's shape.
  // The sort is stable, so terms of equal worth keep the order above.
  return terms.toSorted((left, right) => right.coefficient - left.coefficient);
}

/**
 * The one valence a group's elements share.
 * @throws {Error} When they do not, which means the group is not one term.
 */
function groupValence(group: RuleGroup): number {
  const first = group.symbols[0] as string;
  const valence = DEFAULT_VALENCES[first];
  if (valence === undefined) {
    throw new Error(`${group.id}: ${first} is not in the valence table`);
  }
  for (const symbol of group.symbols) {
    if (DEFAULT_VALENCES[symbol] !== valence) {
      throw new Error(`${group.id}: ${symbol} is not ${valence}-valent`);
    }
  }
  return valence;
}
