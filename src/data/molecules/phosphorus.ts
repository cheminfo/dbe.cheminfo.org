/**
 * Phosphorus at three and five bonds.
 *
 * The phosphorus gap is always exactly 1, because phosphorus expands by one
 * unit and no more — a quieter version of the sulfur gap, and easier to see
 * because triphenylphosphine and its oxide differ by one oxygen and read the
 * same 12 from the formula while counting 12 and 13 from the drawing.
 */

import type { PoolEntry } from './types.ts';

/** Phosphines, phosphine oxides and phosphates. */
export const PHOSPHORUS_POOL: readonly PoolEntry[] = [
  {
    id: 'triphenylphosphine',
    name: 'Triphenylphosphine',
    smiles: 'c1ccccc1P(c1ccccc1)c1ccccc1',
    mf: 'C18H15P',
    dbe: 12,
    rings: 3,
    piBonds: 9,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'phosphorus'],
    note: 'Trivalent phosphorus: the formula rule is right.',
  },
  {
    id: 'triphenylphosphine-oxide',
    name: 'Triphenylphosphine oxide',
    smiles: 'c1ccccc1P(=O)(c1ccccc1)c1ccccc1',
    mf: 'C18H15OP',
    dbe: 13,
    rings: 3,
    piBonds: 10,
    valences: { P: 5 },
    level: 'advanced',
    tags: ['ring', 'aromatic', 'phosphorus'],
    note: 'The formula rule gives 12, the same as the phosphine.',
  },
  {
    id: 'phosphoric-acid',
    name: 'Phosphoric acid',
    smiles: 'OP(=O)(O)O',
    mf: 'H3O4P',
    dbe: 1,
    rings: 0,
    piBonds: 1,
    valences: { P: 5 },
    level: 'advanced',
    tags: ['phosphorus'],
    note: 'The formula rule gives 0: the P=O is missed.',
  },
  {
    id: 'trimethyl-phosphate',
    name: 'Trimethyl phosphate',
    smiles: 'COP(=O)(OC)OC',
    mf: 'C3H9O4P',
    dbe: 1,
    rings: 0,
    piBonds: 1,
    valences: { P: 5 },
    level: 'advanced',
    tags: ['chain', 'phosphorus'],
    note: 'The formula rule gives 0: the P=O is missed.',
  },
];
