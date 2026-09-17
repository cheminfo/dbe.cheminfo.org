/**
 * The bounds of every number a link, or a control, can hand the tool, and the
 * length of every piece of text it can carry.
 *
 * Written once so the share codec that clamps an address and the action that
 * clamps a click cannot drift apart. A shared link is untrusted input: without
 * a ceiling, `?count=1000` asks for a thousand structures to be parsed and
 * drawn, and `?smiles=` followed by a megabyte is a link nobody wrote by hand.
 */

/** One bound, as both the share codec and the state action read it. */
export interface NumberRange {
  minimum: number;
  maximum: number;
  /** What the tool shows when nothing asks for anything else. */
  initial: number;
}

/**
 * How many questions a generated series holds. Thirty is a long lab session;
 * the ceiling is what stops a hand-edited link asking for a thousand.
 */
export const COUNT_RANGE: NumberRange = { minimum: 1, maximum: 30, initial: 8 };

/**
 * The seeds a link may pin. Six digits is a number a teacher can read out to a
 * room and a student can type back.
 *
 * {@link NumberRange.initial} is what a seed that cannot be read falls back to,
 * never the state's own starting point: the exercises page opens on the curated
 * deck, which is `null` rather than a seed, because `0` is a legitimate one.
 */
export const SEED_RANGE: NumberRange = {
  minimum: 0,
  maximum: 999_999,
  initial: 0,
};

/** The longest formula a link may carry, in characters. */
export const MAX_MF_LENGTH = 200;

/** The longest structure a link may carry, in characters. */
export const MAX_STRUCTURE_LENGTH = 400;

/** The longest `?valence=` value a link may carry, in characters. */
export const MAX_VALENCE_LENGTH = 40;

/**
 * Bring a number inside a range, rounding it to a whole one.
 * @param value - The number asked for.
 * @param range - The bound it must respect.
 * @returns The nearest whole number the tool can serve.
 */
export function clampToRange(value: number, range: NumberRange): number {
  if (!Number.isFinite(value)) return range.initial;
  return Math.min(range.maximum, Math.max(range.minimum, Math.round(value)));
}

/**
 * Cut a piece of text a link carries to what the tool will read.
 * @param value - The text, as the address carries it.
 * @param maxLength - The longest the tool accepts.
 * @returns The text, cut rather than refused: a link written when the ceiling
 * was higher must still open on something.
 */
export function cutToLength(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}
