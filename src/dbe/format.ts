/**
 * Writing the numbers out, and the codec for the valence choices a link
 * carries.
 *
 * A degree of unsaturation is never rounded. `3.5` is information — an odd
 * number of bonds, so a radical or an ion — and printing `4` would delete the
 * one thing that half was telling the reader.
 *
 * The parameter is forgiving on the way in and canonical on the way out: a
 * symbol the site offers no choice for and a valence it does not offer are
 * both dropped, so a link written before an option was renamed still opens.
 */

import { formatTrimmed, pluralize } from 'react-cheminfo/core';

import type { FormulaDbe, StructureDbe, ValenceChoices } from './types.ts';
import type { ValencePreset } from './valences.ts';
import {
  DEFAULT_VALENCES,
  VALENCE_ELEMENTS,
  VALENCE_PRESETS,
  isOfferedValence,
} from './valences.ts';

/**
 * A degree of unsaturation as the readout prints it: `4`, `0`, `3.5`, `-2`.
 * @param dbe - The number.
 * @returns The text, or the family's missing marker when it is not a number.
 */
export function formatDbe(dbe: number): string {
  return formatTrimmed(dbe, 1);
}

/**
 * A half-DBE term as the breakdown prints it, signed: `+12`, `-6`, `0`.
 *
 * The sign is what makes the column read as a sum: carbon pushes up, hydrogen
 * pulls down, oxygen does nothing at all.
 * @param half - The term, in half-DBE units.
 * @returns The text.
 */
export function formatHalf(half: number): string {
  const written = formatDbe(half);
  return half > 0 ? `+${written}` : written;
}

/**
 * How the formula reached its number, in LaTeX: `1\,\text{part} +
 * \tfrac{1}{2}(6) = 4`.
 *
 * The line leads with the number of parts because that is the term a student
 * forgets: a hydrate and a salt are two molecules, and each one carries a unit
 * of its own. The half is a stacked fraction rather than a `½` character, so
 * the halving reads as the step it is.
 * @param value - What the formula counted.
 * @returns The expression.
 */
export function formulaWorkingTeX(value: FormulaDbe): string {
  const { fragments, half, dbe } = value;
  const parts = String.raw`${fragments}\,\text{${pluralize(fragments, 'part')}}`;
  return String.raw`${parts} + \tfrac{1}{2}\left(${formatDbe(half)}\right) = ${formatDbe(dbe)}`;
}

/**
 * How the drawing reached its number, in LaTeX: `2\,\text{rings} + 5\,\pi
 * \text{ bonds} = 7`.
 * @param value - What the drawing counted.
 * @returns The expression.
 */
export function structureWorkingTeX(value: StructureDbe): string {
  const { rings, piBonds, dbe } = value;
  const ringTerm = String.raw`${rings}\,\text{${pluralize(rings, 'ring')}}`;
  const piTerm = String.raw`${piBonds}\,\pi\text{ ${pluralize(piBonds, 'bond')}}`;
  return `${ringTerm} + ${piTerm} = ${formatDbe(dbe)}`;
}

/**
 * A valence in the roman numerals a chemist writes it in: `6` becomes `VI`.
 * @param valence - The valence.
 * @returns The numeral, or the plain number when it is outside the table.
 */
export function romanValence(valence: number): string {
  return NUMERALS[valence] ?? String(valence);
}

/**
 * Write the valence choices a link carries: `S6,P5`.
 *
 * The elements come in {@link VALENCE_ELEMENTS} order and a default is left
 * out, so one selection always writes one link and an untouched calculator
 * writes no parameter at all.
 * @param choices - The choices in force.
 * @returns The parameter value, `''` when everything is at its default.
 */
export function serializeValences(choices: ValenceChoices): string {
  const pairs: string[] = [];
  for (const symbol of VALENCE_ELEMENTS) {
    const valence = choices[symbol];
    if (
      valence !== undefined &&
      valence !== DEFAULT_VALENCES[symbol] &&
      isOfferedValence(symbol, valence)
    ) {
      pairs.push(`${symbol}${valence}`);
    }
  }
  return pairs.join(',');
}

/**
 * Read the valence choices a link carries.
 *
 * Both forms are accepted: the pairs `S6,P5` and the preset words `table` and
 * `expanded`. A teacher retypes these by hand, so `s6` is read as `S6`.
 * @param value - The raw parameter, or `undefined` when the link omits it.
 * @returns The choices, empty when the link says nothing usable.
 */
export function parseValences(value: string | undefined): ValenceChoices {
  const text = value?.trim() ?? '';
  if (text === '') return {};

  const preset = presetNamed(text);
  if (preset !== null) return { ...preset.choices };

  const choices: Record<string, number> = {};
  const pairs = text.split(',');
  for (const raw of pairs) {
    const pair = PAIR.exec(raw.trim());
    if (pair?.groups === undefined) continue;
    const symbol = capitalize(pair.groups.symbol as string);
    const valence = Number(pair.groups.valence);
    if (isOfferedValence(symbol, valence)) choices[symbol] = valence;
  }
  return choices;
}

/** `S6`, `Se4`, `p5`: an element symbol and the valence to count it at. */
const PAIR = /^(?<symbol>[A-Za-z][a-z]?)(?<valence>\d+)$/;

const NUMERALS: Readonly<Record<number, string>> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
};

function presetNamed(text: string): ValencePreset | null {
  const wanted = text.toLowerCase();
  for (const preset of VALENCE_PRESETS) {
    if (preset.id === wanted) return preset;
  }
  return null;
}

function capitalize(symbol: string): string {
  return symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
}
