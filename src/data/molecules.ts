/**
 * The molecule pool: what a generated series draws from, and what the
 * calculator offers as worked examples.
 *
 * An entry's `dbe` is the **structure** count — rings plus pi bonds — because
 * that is the number the drawing has, whatever a formula guesses about it. The
 * formula-rule number is never written down here: it is computed live from the
 * formula, so a generated question can only ever quote what the site itself
 * would answer.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';

import { HYDROCARBON_POOL } from './molecules/hydrocarbons.ts';
import { NITROGEN_POOL } from './molecules/nitrogen.ts';
import { OXYGEN_POOL } from './molecules/oxygen.ts';
import { PHOSPHORUS_POOL } from './molecules/phosphorus.ts';
import { SULFUR_POOL } from './molecules/sulfur.ts';
import type { PoolEntry, PoolTag } from './molecules/types.ts';

export type { PoolEntry, PoolTag } from './molecules/types.ts';

/** Every molecule a generated series may use, easiest group first. */
export const MOLECULE_POOL: readonly PoolEntry[] = [
  ...HYDROCARBON_POOL,
  ...OXYGEN_POOL,
  ...NITROGEN_POOL,
  ...SULFUR_POOL,
  ...PHOSPHORUS_POOL,
];

const BY_ID = new Map(MOLECULE_POOL.map((entry) => [entry.id, entry]));

/**
 * The examples the calculator offers in a row under its inputs.
 *
 * They are an argument rather than a sample: a ring, a fused pair, a cage and
 * a molecule whose formula and drawing agree, then three where they do not.
 * Clicking through them left to right is the site in eight clicks.
 */
export const CALCULATOR_EXAMPLES: readonly PoolEntry[] = [
  'benzene',
  'naphthalene',
  'cubane',
  'aspirin',
  'caffeine',
  'dmso',
  'dimethyl-sulfone',
  'triphenylphosphine-oxide',
].map((id) => BY_ID.get(id) as PoolEntry);

/** The molecule with this id, or `undefined` for an id nobody minted. */
export function poolEntryById(id: string): PoolEntry | undefined {
  return BY_ID.get(id);
}

/** Every molecule of one coloured level. */
export function poolOfLevel(level: ExerciseLevel): readonly PoolEntry[] {
  return MOLECULE_POOL.filter((entry) => entry.level === level);
}

/** Every molecule carrying a tag. */
export function poolWithTag(tag: PoolTag): readonly PoolEntry[] {
  return MOLECULE_POOL.filter((entry) => entry.tags.includes(tag));
}

/**
 * The molecules whose drawing needs a valence the shared table does not
 * assume — every sulfoxide, sulfone, sulfonamide and phosphate in the pool.
 */
export function expandedOctetPool(): readonly PoolEntry[] {
  return MOLECULE_POOL.filter((entry) => entry.valences !== undefined);
}
