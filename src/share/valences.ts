/**
 * The `?valence=` parameter: which Lewis structure the formula is being counted
 * against.
 *
 * It is the one parameter that changes the *answer* rather than the layout, so
 * the codec itself lives in the domain (`src/dbe/format.ts`), beside the table
 * it validates against, and is unit-tested there without a browser. What is
 * here is the parameter name and the two directions, so the round trip between
 * an address and the state never reaches into the domain by hand.
 *
 * Both directions are forgiving: an element the site offers no choice for, and
 * a valence it does not offer, are dropped rather than obeyed. A link written
 * before an option was renamed must still open on something.
 */

import { parseValences, serializeValences } from '../dbe/format.ts';
import type { ValenceChoices } from '../dbe/types.ts';
import { MAX_VALENCE_LENGTH, cutToLength } from '../state/ranges.ts';

/** Where the valences in force are pinned: `?valence=S6,P5`. */
export const VALENCE_PARAM = 'valence';

/**
 * Read the valences a link asks the formula to be counted at.
 * @param value - Raw parameter, or `undefined` when the link omits it.
 * @returns The choices, empty when the link says nothing usable.
 */
export function parseValenceParam(value: string | undefined): ValenceChoices {
  if (value === undefined) return {};
  return parseValences(cutToLength(value, MAX_VALENCE_LENGTH));
}

/**
 * Write the valences in force, in one canonical order so one selection always
 * makes one link.
 * @param choices - The choices in force.
 * @returns The parameter value, empty when everything is at its default.
 */
export function serializeValenceParam(choices: ValenceChoices): string {
  return serializeValences(choices);
}
