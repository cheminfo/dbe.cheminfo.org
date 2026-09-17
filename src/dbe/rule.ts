/**
 * The rule in full, with sulfur and phosphorus left as valences.
 *
 * The cheatsheet opens on it, so it is written here rather than typed into the
 * page: every coefficient is held against the valence table of `valences.ts`
 * in a unit test, and the sulfur and phosphorus lines are generated from
 * {@link VALENCE_OPTIONS}. A sheet a student takes into an exam room may not
 * drift from the table the tool counts on.
 *
 * `X` stands for the halogens and `M` for the alkali metals, because a line
 * naming all seven is a line nobody reads; {@link RuleGroup.symbols} keeps the
 * elements themselves, which is what the test recomputes.
 */

import { formatHalf } from './format.ts';
import type { ValenceOption } from './types.ts';
import { VALENCE_OPTIONS } from './valences.ts';

/** The rule as it is stated: one per part, half the charge, half every (v − 2). */
export const GENERAL_RULE_TEX = String.raw`\displaystyle \mathrm{DBE} = F + \frac{q}{2} + \frac{1}{2}\sum_i n_i\left(v_i - 2\right)`;

/** The elements the written rule leaves as a valence, in reading order. */
export const OPEN_VALENCE_SYMBOLS: readonly string[] = ['S', 'P'];

/** One term of the written-out rule: the elements it covers, all worth the same. */
export interface RuleGroup {
  /** What the term is called, for a test naming the one that failed. */
  readonly id: string;
  /** The elements it stands for, as the valence table names them. */
  readonly symbols: readonly string[];
  /** How the counts are written, `X` and `M` standing for whole columns. */
  readonly counts: readonly string[];
  /** What one atom of the group is worth, in DBE. */
  readonly contribution: number;
}

/**
 * The elements whose valence nobody chooses, grouped by what they are worth.
 *
 * Oxygen is listed although it is worth nothing: a reader who does not see it
 * assumes it was forgotten, and the written rule leaves it out precisely
 * because it contributes 0.
 */
export const RULE_GROUPS: readonly RuleGroup[] = [
  {
    id: 'tetravalent',
    symbols: ['C', 'Si'],
    counts: [String.raw`n_{\mathrm{C}}`, String.raw`n_{\mathrm{Si}}`],
    contribution: 1,
  },
  {
    id: 'trivalent',
    symbols: ['N'],
    counts: [String.raw`n_{\mathrm{N}}`],
    contribution: 0.5,
  },
  {
    id: 'divalent',
    symbols: ['O'],
    counts: [String.raw`n_{\mathrm{O}}`],
    contribution: 0,
  },
  {
    id: 'monovalent',
    symbols: ['H', 'F', 'Cl', 'Br', 'I', 'Li', 'Na', 'K'],
    counts: [
      String.raw`n_{\mathrm{H}}`,
      String.raw`n_{\mathrm{X}}`,
      String.raw`n_{\mathrm{M}}`,
    ],
    contribution: -0.5,
  },
];

/** The same rule with every fixed valence substituted, S and P left open. */
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
  { tex: 'F', meaning: 'separate molecules — a hydrate is two' },
  { tex: 'q', meaning: 'the total charge, added not subtracted' },
  { tex: 'n_i', meaning: 'how many atoms of that element' },
  { tex: 'v_i', meaning: 'the valence it is counted at' },
  { tex: String.raw`\mathrm{X}`, meaning: 'F, Cl, Br, I' },
  { tex: String.raw`\mathrm{M}`, meaning: 'Li, Na, K' },
];

/** One valence an element can be counted at, and what it makes that atom worth. */
export interface ValenceTerm {
  /** How a chemist says it: `S(IV)`. */
  readonly label: string;
  /** The valence itself. */
  readonly valence: number;
  /** What one such atom is worth, in DBE. */
  readonly contribution: number;
  /** That contribution, signed, in LaTeX. */
  readonly tex: string;
}

/**
 * Every valence one of {@link OPEN_VALENCE_SYMBOLS} can be counted at, with
 * what each is worth.
 * @param symbol - The element symbol.
 * @returns Its valences, in the order the site offers them.
 */
export function valenceTerms(symbol: string): readonly ValenceTerm[] {
  const options: readonly ValenceOption[] = VALENCE_OPTIONS[symbol] ?? [];
  const terms: ValenceTerm[] = [];
  for (const option of options) {
    terms.push({
      label: option.label,
      valence: option.valence,
      contribution: (option.valence - 2) / 2,
      tex: contributionTex(option.valence),
    });
  }
  return terms;
}

/**
 * What one atom of a given valence is worth, signed: `0`, `+1`, `+\tfrac{3}{2}`.
 * @param valence - How many bonds the atom makes.
 * @returns The contribution, in LaTeX.
 */
export function contributionTex(valence: number): string {
  const half = valence - 2;
  if (half % 2 === 0) return formatHalf(half / 2);
  const sign = half < 0 ? '-' : '+';
  return String.raw`${sign}\tfrac{${Math.abs(half)}}{2}`;
}

/** The written rule, assembled so no coefficient is typed twice. */
function writeRule(): string {
  const fixed: string[] = [];
  for (const group of RULE_GROUPS) {
    if (group.contribution !== 0) fixed.push(groupTex(group));
  }
  const open: string[] = [];
  for (const symbol of OPEN_VALENCE_SYMBOLS) open.push(openTex(symbol));
  const head = String.raw`\mathrm{DBE} ={}& F + \frac{q}{2} ${fixed.join(' ')}`;
  return String.raw`\displaystyle\begin{aligned}${head} \\ & ${open.join(' ')}\end{aligned}`;
}

/** One group as it is written: `+ n_{\mathrm{C}} + n_{\mathrm{Si}}`. */
function groupTex(group: RuleGroup): string {
  const sign = group.contribution < 0 ? '-' : '+';
  const size = Math.abs(group.contribution);
  if (size === 1) return `${sign} ${group.counts.join(` ${sign} `)}`;
  const coefficient = String.raw`\tfrac{${size * 2}}{2}`;
  const counts =
    group.counts.length === 1
      ? group.counts[0]
      : String.raw`\left(${group.counts.join(' + ')}\right)`;
  return `${sign} ${coefficient}${counts}`;
}

/** An element whose valence the reader chooses: `+ \frac{v_S - 2}{2} n_S`. */
function openTex(symbol: string): string {
  const letter = String.raw`\mathrm{${symbol}}`;
  return String.raw`+ \frac{v_{${letter}} - 2}{2}\,n_{${letter}}`;
}
