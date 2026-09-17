/**
 * Composing the sentence a page is indexed under.
 *
 * A description is worth writing only if a search result shows it whole: under
 * about 110 characters a result pads it with whatever text the crawler found on
 * the page, and over about 160 it is cut off mid-clause. A section of the
 * explanation and a question of the deck are both described from prose written
 * for the page rather than for a crawler, so the window has to be reached with
 * whatever that prose has to say: {@link summarize} cuts it to whole sentences
 * and {@link describe} grows what is left.
 */

import { plainDescription } from 'react-cheminfo/core';

/** The shortest description a search result shows on its own, in characters. */
export const DESCRIPTION_MIN = 110;

/** The longest it shows before cutting the sentence off. */
export const DESCRIPTION_MAX = 160;

/**
 * What a description is grown to when the entry has more to say. It sits above
 * {@link DESCRIPTION_MIN} because 110 characters is the floor, not the goal: a
 * clause that fits is a clause the reader gets.
 */
export const DESCRIPTION_TARGET = 132;

/**
 * A description grown from what the entry itself says, until a search result
 * has a whole sentence to show.
 *
 * Each entry of `extras` is one choice, written longest first: at most one of
 * its clauses is used, and it is the first that still fits. Growing stops once
 * the text passes {@link DESCRIPTION_TARGET}, so a page whose own prose already
 * fills a search result keeps it, and only a short one is told what kind of
 * page it is.
 * @param base - What every entry of this kind says, and says first.
 * @param extras - Clauses to grow it with, most worth reading first.
 * @returns The description, between {@link DESCRIPTION_MIN} and
 * {@link DESCRIPTION_MAX} characters.
 * @throws {RangeError} When no arrangement lands in the window. That is a prose
 * defect and it is refused here, where it is written, rather than shipped to a
 * crawler that will silently truncate it.
 */
export function describe(
  base: string,
  extras: ReadonlyArray<readonly string[]> = [],
): string {
  let text = base.trim();
  for (const choice of extras) {
    if (text.length >= DESCRIPTION_TARGET) break;
    for (const clause of choice) {
      const grown = `${text} ${clause}`;
      if (grown.length <= DESCRIPTION_MAX) {
        text = grown;
        break;
      }
    }
  }
  if (text.length < DESCRIPTION_MIN || text.length > DESCRIPTION_MAX) {
    throw new RangeError(
      `a page description is ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} characters; this one is ${text.length}: ${text}`,
    );
  }
  return text;
}

/**
 * A page's own prose, cut to what a search result shows.
 *
 * The markers are resolved first — `[[pi bond]]` is two words to a reader and a
 * glossary chip only on the page — then as many whole sentences as fit are
 * kept. Prose that already fits is kept whole, and prose whose first sentence
 * alone runs past the ceiling is cut on a word rather than mid-syllable.
 * @param prose - The page's own text, markers and all.
 * @returns The sentence or two a result has room for.
 */
export function summarize(prose: string): string {
  return plainDescription(prose, {
    maxLength: DESCRIPTION_MAX,
    minLength: DESCRIPTION_MIN,
  });
}
