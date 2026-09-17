/**
 * The two answers side by side, and the sentence that says why they differ.
 *
 * This is the whole subject of the site. A sulfoxide drawn `S=O` has one pi
 * bond; the shared table, which counts sulfur as divalent, says zero. Neither
 * number is a bug: the formula answered the charge-separated question — the
 * only Lewis structure in which sulfur keeps its group valence — and the
 * drawing answered the hypervalent one. Showing both, and naming which atom is
 * responsible, is what turns a disagreement into the lesson.
 *
 * Nothing here touches openchemlib: a drawing arrives as the values
 * `dbeFromStructure` already counted.
 */

import { formatDbe } from './format.ts';
import { dbeFromFormula } from './formula.ts';
import type {
  DbeComparison,
  DbeTerm,
  FormulaDbe,
  StructureCaveat,
  StructureDbe,
  ValenceChoices,
  ValenceOption,
} from './types.ts';
import { DEFAULT_VALENCES, VALENCE_OPTIONS } from './valences.ts';

/**
 * Put the two answers side by side and say why they differ.
 * @param formula - What the formula says, at the valences in force.
 * @param structure - What the drawing says.
 * @returns The comparison, with the sentence the callout prints.
 */
export function compareDbe(
  formula: FormulaDbe,
  structure: StructureDbe,
): DbeComparison {
  const sameFormula = describesSameMolecule(formula, structure);
  const difference = structure.dbe - formula.dbe;
  const reconciling = reconcilingValences(formula, structure);
  return {
    formula,
    structure,
    sameFormula,
    agree: difference === 0,
    difference,
    reconciling,
    explanation: explain(formula, structure, sameFormula, reconciling),
  };
}

/**
 * The valences that would make a formula agree with a drawing. Every
 * combination the site offers is tried in table order, so the least expanded
 * one that works wins: a sulfoxide comes back as S(IV), never S(VI).
 * @param formula - What the formula says now.
 * @param structure - What the drawing says.
 * @returns The choices to apply, `{}` when the standard table already agrees,
 * or `null` when no valence can close the gap.
 */
export function reconcilingValences(
  formula: FormulaDbe,
  structure: StructureDbe,
): ValenceChoices | null {
  const symbols = formula.ambiguous;
  if (symbols.length === 0) return null;

  const columns: Array<readonly ValenceOption[]> = [];
  let combinations = 1;
  for (const symbol of symbols) {
    const options = VALENCE_OPTIONS[symbol] ?? [];
    columns.push(options);
    combinations *= options.length;
  }

  for (let combination = 0; combination < combinations; combination++) {
    const choices: Record<string, number> = {};
    let remaining = combination;
    for (let index = columns.length - 1; index >= 0; index--) {
      const options = columns[index] as readonly ValenceOption[];
      const option = options[remaining % options.length] as ValenceOption;
      remaining = Math.floor(remaining / options.length);
      choices[symbols[index] as string] = option.valence;
    }
    if (dbeAt(formula, choices) === structure.dbe) return trimDefaults(choices);
  }
  return null;
}

/**
 * The degree of unsaturation the same formula would have at other valences.
 * The atom counts, the charge and the parts are all the rule needs, so the
 * formula is never parsed twice.
 */
function dbeAt(formula: FormulaDbe, choices: ValenceChoices): number {
  const symbols = Object.keys(formula.atoms);
  let half = formula.charge;
  for (const symbol of symbols) {
    const count = formula.atoms[symbol] as number;
    // Every symbol of a `FormulaDbe` has a default, because `parseFormula`
    // refuses a formula carrying an element the table knows no valence for.
    // The 2 is the neutral fallback — contribution zero — so a symbol that
    // somehow arrived without one cannot skew the sum it lands in.
    const valence = choices[symbol] ?? DEFAULT_VALENCES[symbol] ?? 2;
    half += count * (valence - 2);
  }
  return formula.fragments + half / 2;
}

/**
 * Whether the two panels are looking at the same molecule. The strings cannot
 * simply be compared — `mf-parser` writes ammonium `H4N(+1)` and
 * `openchemlib-utils` writes it `H4N(+)` — so the drawing's formula is parsed
 * back and the atoms, the charge and the parts are what have to match.
 */
function describesSameMolecule(
  formula: FormulaDbe,
  structure: StructureDbe,
): boolean {
  const drawn = dbeFromFormula(structure.mf);
  if (!drawn.ok) return false;
  if (drawn.value.charge !== formula.charge) return false;
  if (drawn.value.fragments !== formula.fragments) return false;
  return sameAtoms(drawn.value.atoms, formula.atoms);
}

function sameAtoms(
  left: Readonly<Record<string, number>>,
  right: Readonly<Record<string, number>>,
): boolean {
  const symbols = Object.keys(left);
  if (symbols.length !== Object.keys(right).length) return false;
  for (const symbol of symbols) {
    if (left[symbol] !== right[symbol]) return false;
  }
  return true;
}

function trimDefaults(choices: Record<string, number>): ValenceChoices {
  const kept: Record<string, number> = {};
  for (const symbol of Object.keys(choices)) {
    if (choices[symbol] !== DEFAULT_VALENCES[symbol]) {
      kept[symbol] = choices[symbol] as number;
    }
  }
  return kept;
}

function explain(
  formula: FormulaDbe,
  structure: StructureDbe,
  sameFormula: boolean,
  reconciling: ValenceChoices | null,
): string {
  const blocking = blockingCaveat(structure);
  if (blocking !== null) return blocking.message;

  const drawn = formatDbe(structure.dbe);
  const stated = formatDbe(formula.dbe);
  const both = `The drawing counts ${drawn} and the formula ${stated}`;

  if (!sameFormula) {
    return `The drawing is ${structure.mf} and the formula is ${formula.mf}, so the two numbers are not about the same molecule.`;
  }
  if (structure.dbe === formula.dbe) {
    return `Both count ${drawn}: the formula assumes the bond counts the drawing actually has.`;
  }

  const expanded = namedExpansion(structure, reconciling);
  if (expanded !== null) return `${both}, because ${expanded}.`;

  const chosen = firstChosenTerm(formula);
  if (reconciling !== null && chosen !== null) {
    return `${both}: the ${chosen.symbol} is counted at ${chosen.valence} bonds and the drawing does not make that many — the standard table agrees with it.`;
  }
  if (formula.charge > 0 && structure.dbe - formula.dbe === -formula.charge) {
    return `${both}: the rule adds half a bond per unit of positive charge, and this cation makes one bond fewer instead — a carbenium centre has six electrons, not eight.`;
  }
  if (!formula.whole && hasCaveat(structure, 'radical')) {
    return `${both}: an unpaired electron leaves an odd number of bonds, and half of an odd number is a half.`;
  }
  return `${both}, and no valence the site offers closes the gap.`;
}

/**
 * The atom the gap can be blamed on, worded for the callout: the drawing says
 * how many bonds it makes, the reconciling choice says what to switch it to.
 */
function namedExpansion(
  structure: StructureDbe,
  reconciling: ValenceChoices | null,
): string | null {
  if (reconciling === null) return null;
  const symbols = Object.keys(reconciling);
  if (symbols.length === 0) return null;
  const symbol = symbols[0] as string;
  const valence = reconciling[symbol] as number;
  const label = optionLabel(symbol, valence);
  const standard = DEFAULT_VALENCES[symbol] as number;
  const drawnValence = valenceDrawnOn(structure, symbol) ?? valence;
  return `the ${symbol} is drawn making ${drawnValence} bonds and the table counts it at ${standard} — count it as ${label} and the two agree`;
}

/** The first element the page is counting away from the shared table. */
function firstChosenTerm(formula: FormulaDbe): DbeTerm | null {
  const terms = formula.terms;
  for (const term of terms) {
    if (term.chosen) return term;
  }
  return null;
}

function optionLabel(symbol: string, valence: number): string {
  const options = VALENCE_OPTIONS[symbol] ?? [];
  for (const option of options) {
    if (option.valence === valence) return option.label;
  }
  return `${symbol} at ${valence}`;
}

function valenceDrawnOn(
  structure: StructureDbe,
  symbol: string,
): number | null {
  const expanded = structure.expanded;
  for (const atom of expanded) {
    if (atom.symbol === symbol) return atom.valence;
  }
  return null;
}

function blockingCaveat(structure: StructureDbe): StructureCaveat | null {
  const caveats = structure.caveats;
  for (const caveat of caveats) {
    if (caveat.kind !== 'radical') return caveat;
  }
  return null;
}

function hasCaveat(
  structure: StructureDbe,
  kind: StructureCaveat['kind'],
): boolean {
  const caveats = structure.caveats;
  for (const caveat of caveats) {
    if (caveat.kind === kind) return true;
  }
  return false;
}
