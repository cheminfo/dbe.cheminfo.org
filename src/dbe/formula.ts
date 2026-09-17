/**
 * What a molecular formula says the degree of unsaturation is, with the
 * working shown.
 *
 * ```
 * DBE = F + ½·Σ(vᵢ − 2) + q/2
 * ```
 *
 * `F` is how many separate molecules the formula describes, `vᵢ` the valence
 * each element is counted at, and `q` the total charge.
 *
 * **The charge is added, not subtracted.** A main-group atom that keeps its
 * octet makes one bond *more* per unit of positive charge — N⁺ makes four, O⁺
 * three, O⁻ one — so `Σvᵢ` moves by `+q` and the answer by `q/2`. Checked
 * against the drawings: ammonium 0, methylammonium 0, methoxide 0, acetate 1.
 *
 * **`mf-parser` is used for parsing only.** Its own `getInfo().unsaturation`
 * subtracts the charge instead, so it answers −1 for `NH4+`, 1 for `CH3O(-)`
 * and 2 for acetate, where the drawn structures count 0, 0 and 1. This site
 * prints the formula number and the structure number side by side on one page,
 * so it cannot ship a disagreement of its own making. That field is never
 * read; do not "fix" the rule below to match it.
 */

import { MF } from 'mf-parser';

import type {
  DbeTerm,
  FormulaDbe,
  FormulaProblem,
  FormulaReading,
  ValenceChoices,
} from './types.ts';
import {
  DEFAULT_VALENCES,
  VALENCE_OPTIONS,
  ambiguousElements,
  resolveValences,
} from './valences.ts';

/** What {@link dbeFromFormula} is asked for beyond the formula itself. */
export interface FormulaDbeOptions {
  /**
   * The valence to count each element at.
   * @default {} — every element at its {@link DEFAULT_VALENCES} valence
   */
  valences?: ValenceChoices;
}

/**
 * The degree of unsaturation a molecular formula implies, with the breakdown
 * the calculator draws under it.
 *
 * Parentheses, nested groups, isotopes, charges and dot-separated parts are
 * `mf-parser`'s business: only the atom counts, the charge and the number of
 * parts come back here.
 * @param mf - The formula, as typed.
 * @param options - The valences to count at.
 * @returns The number and its working, or the reason there is none.
 */
export function dbeFromFormula(
  mf: string,
  options: FormulaDbeOptions = {},
): FormulaReading {
  const parsed = parseFormula(mf);
  if (!parsed.ok) return parsed;

  const { atoms, charge, fragments } = parsed;
  const valences = resolveValences(options.valences);
  const symbols = Object.keys(atoms);

  const terms: DbeTerm[] = [];
  let half = 0;
  for (const symbol of symbols) {
    const count = atoms[symbol] as number;
    const valence = valences[symbol] as number;
    const contribution = valence - 2;
    const termHalf = count * contribution;
    half += termHalf;
    terms.push({
      symbol,
      count,
      valence,
      contribution,
      half: termHalf,
      dbe: termHalf / 2,
      chosen: valence !== DEFAULT_VALENCES[symbol],
      options: VALENCE_OPTIONS[symbol] ?? [],
    });
  }
  half += charge;

  const dbe = fragments + half / 2;
  const value: FormulaDbe = {
    mf: parsed.mf,
    input: mf,
    atoms,
    charge,
    fragments,
    terms,
    chargeHalf: charge,
    half,
    dbe,
    whole: Number.isInteger(dbe),
    ambiguous: ambiguousElements(atoms),
  };
  return { ok: true, value };
}

/**
 * The number alone, for a caller with nothing to say about a failure.
 * @param mf - The formula, as typed.
 * @param options - The valences to count at.
 * @returns The degree of unsaturation, or `null` when the formula has none.
 */
export function dbeOfFormula(
  mf: string,
  options: FormulaDbeOptions = {},
): number | null {
  const reading = dbeFromFormula(mf, options);
  return reading.ok ? reading.value.dbe : null;
}

/** What the formula turned out to hold, or why it holds nothing countable. */
type ParsedFormula =
  | {
      ok: true;
      mf: string;
      atoms: Readonly<Record<string, number>>;
      charge: number;
      fragments: number;
    }
  | { ok: false; problem: FormulaProblem };

function parseFormula(text: string): ParsedFormula {
  if (text.trim() === '') return refuse('empty', EMPTY_MESSAGE);

  let info;
  try {
    info = new MF(text).getInfo();
  } catch (error) {
    const reason = firstLine(error);
    const unknown = /unknown element:\s*(?<symbol>\S+)/i.exec(reason)?.groups
      ?.symbol;
    return unknown === undefined
      ? refuse('syntax', `That formula could not be read: ${reason}`)
      : refuse('unsupported', unsupportedMessage([unknown]), [unknown]);
  }

  const atoms = info.atoms as Readonly<Record<string, number>>;
  const symbols = Object.keys(atoms);
  if (symbols.length === 0) return refuse('empty', EMPTY_MESSAGE);

  const fractional: string[] = [];
  const unknown: string[] = [];
  for (const symbol of symbols) {
    if (!Number.isInteger(atoms[symbol])) fractional.push(symbol);
    if (DEFAULT_VALENCES[symbol] === undefined) unknown.push(symbol);
  }
  if (fractional.length > 0) {
    return refuse('syntax', fractionalMessage(atoms, fractional));
  }
  if (unknown.length > 0) {
    return refuse('unsupported', unsupportedMessage(unknown), unknown);
  }

  return {
    ok: true,
    mf: info.mf,
    atoms,
    charge: info.charge,
    fragments: countFragments(info),
  };
}

/**
 * How many separate molecules the formula describes.
 *
 * `getInfo()` only carries `parts` when there is more than one, and a trailing
 * dot leaves behind a part with no atoms in it, which is punctuation rather
 * than a molecule.
 */
function countFragments(info: object): number {
  // `getInfo()` returns two different shapes and only one of them declares
  // `parts`, so the property is asked for rather than assumed.
  if (!('parts' in info) || !Array.isArray(info.parts)) return 1;
  const parts: readonly unknown[] = info.parts;
  let counted = 0;
  for (const part of parts) {
    if (hasAtoms(part)) counted++;
  }
  return counted === 0 ? 1 : counted;
}

/** Whether one part of a formula carries any atom, or is a stray dot. */
function hasAtoms(part: unknown): boolean {
  if (typeof part !== 'object' || part === null || !('atoms' in part)) {
    return false;
  }
  const atoms = part.atoms;
  if (typeof atoms !== 'object' || atoms === null) return false;
  return Object.keys(atoms).length > 0;
}

const EMPTY_MESSAGE = 'Type a molecular formula, such as C6H6.';

function unsupportedMessage(unknown: readonly string[]): string {
  const symbols = unknown.join(', ');
  const verb = unknown.length === 1 ? 'is' : 'are';
  return `${symbols} ${verb} not an element this rule can assume a bond count for, so this formula has no degree of unsaturation. Draw the structure instead: a drawing states its own bond counts.`;
}

function fractionalMessage(
  atoms: Readonly<Record<string, number>>,
  fractional: readonly string[],
): string {
  const symbol = fractional[0] as string;
  return `A dot before a digit reads as a decimal point, so this formula asks for ${atoms[symbol] as number} ${symbol}. Write a hydrate with its water in brackets: CuSO4.(H2O)5.`;
}

function refuse(
  kind: FormulaProblem['kind'],
  message: string,
  unknown: readonly string[] = [],
): ParsedFormula {
  return { ok: false, problem: { kind, message, unknown } };
}

function firstLine(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.split('\n', 1)[0] as string).trim();
}
