/**
 * The tool's own settings a link carries, and the bounds it is read inside.
 *
 * A shared link is untrusted input, so every one of these is clamped or cut: a
 * hand-edited `?count=1000` would ask for a thousand structures to be parsed
 * and drawn, and `?smiles=` followed by a megabyte is a link nobody wrote by
 * hand. A value already at its default is deleted rather than written, so an
 * unconfigured link stays a plain link.
 *
 * The query is percent-encoded by hand (`./query.ts`) and never handed to
 * `URLSearchParams`, which writes a space as `+` while the share helpers read a
 * `+` back as a literal one — `[NH4+]` and `CC(=O)[O-]` are exactly what these
 * links carry.
 */

import type { ShareParamValues } from 'react-cheminfo/core';
import {
  enumParam,
  integerParam,
  parseShareConfig,
  stringParam,
} from 'react-cheminfo/core';

import {
  COUNT_RANGE,
  MAX_MF_LENGTH,
  MAX_STRUCTURE_LENGTH,
  MAX_VALENCE_LENGTH,
  SEED_RANGE,
} from '../state/ranges.ts';

import { toSearch } from './query.ts';

/** The difficulties a generated series may be limited to. */
export const SERIES_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'mixed',
] as const;

/** One of {@link SERIES_LEVELS}. */
export type SeriesLevel = (typeof SERIES_LEVELS)[number];

/**
 * The directions a generated series may be limited to.
 *
 * Two of them, because a degree of unsaturation has two sides and the site
 * teaches both: read a formula, or read a drawing. `both` alternates.
 */
export const SERIES_DIRECTIONS = ['formula', 'structure', 'both'] as const;

/** One of {@link SERIES_DIRECTIONS}. */
export type SeriesDirection = (typeof SERIES_DIRECTIONS)[number];

/** Every setting a link can pin, keyed by the name it takes in the query. */
export const SHARE_PARAMS = {
  /** The formula the calculator opens on: `?mf=C2H6OS`. */
  mf: stringParam({ maxLength: MAX_MF_LENGTH }),

  /**
   * The structure it opens on, as SMILES: `?smiles=CS(C)=O`. SMILES rather
   * than an idCode on purpose: a teacher has to be able to read and edit the
   * link they hand out.
   */
  smiles: stringParam({ maxLength: MAX_STRUCTURE_LENGTH }),

  /**
   * The valences in force: `?valence=S6,P5`, or a preset word. `./valences.ts`
   * is what reads it; what happens here is the length cut alone.
   */
  valence: stringParam({ maxLength: MAX_VALENCE_LENGTH }),

  /**
   * The seed of a generated problem set: `?seed=4271`. Its default is `null`
   * and not a number, because `0` is a legitimate seed: no parameter at all
   * means no series, and the curated deck is what the page shows.
   */
  seed: integerParam({
    min: SEED_RANGE.minimum,
    max: SEED_RANGE.maximum,
    default: null,
  }),

  /** How many questions the series holds. */
  count: integerParam({
    min: COUNT_RANGE.minimum,
    max: COUNT_RANGE.maximum,
    default: COUNT_RANGE.initial,
  }),

  /** Which difficulties it draws from. */
  level: enumParam(SERIES_LEVELS, 'mixed'),

  /** Which direction it asks in. */
  direction: enumParam(SERIES_DIRECTIONS, 'both'),
};

/** The codecs of {@link SHARE_PARAMS}. */
export type ShareParams = typeof SHARE_PARAMS;

/** Every setting at the value the link carries, or at its default. */
export type ShareParamSet = ShareParamValues<ShareParams>;

/**
 * Read every setting a link carries.
 * @param query - Decoded query of the address.
 * @returns The settings, each clamped or cut to what the tool can serve.
 */
export function readShareParams(
  query: Readonly<Record<string, string>>,
): ShareParamSet {
  return parseShareConfig(toSearch(query), {
    parts: [],
    params: SHARE_PARAMS,
  }).params;
}
