/**
 * The nitrogen-bearing molecules, including the nitro group.
 *
 * Nitrogen is the pedagogic ally of sulfur and phosphorus: it cannot expand
 * its octet, so openchemlib draws a nitro group charge-separated and the two
 * directions **always** agree on it. Nitrobenzene next to a sulfone, with the
 * same arithmetic and opposite outcomes, is what makes the sulfur lesson land.
 */

import type { PoolEntry } from './types.ts';

/** Amines, azines, nitriles and the nitro group. */
export const NITROGEN_POOL: readonly PoolEntry[] = [
  {
    id: 'acetonitrile',
    name: 'Acetonitrile',
    smiles: 'CC#N',
    mf: 'C2H3N',
    dbe: 2,
    rings: 0,
    piBonds: 2,
    level: 'beginner',
    tags: ['chain', 'triple', 'nitrogen'],
    note: 'The nitrile is two pi bonds.',
  },
  {
    id: 'aniline',
    name: 'Aniline',
    smiles: 'Nc1ccccc1',
    mf: 'C6H7N',
    dbe: 4,
    rings: 1,
    piBonds: 3,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'nitrogen'],
    note: 'The nitrogen pays for its own extra hydrogen.',
  },
  {
    id: 'pyridine',
    name: 'Pyridine',
    smiles: 'c1ccncc1',
    mf: 'C5H5N',
    dbe: 4,
    rings: 1,
    piBonds: 3,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'nitrogen'],
    note: 'A ring nitrogen behaves like a ring carbon here.',
  },
  {
    id: 'pyrrole',
    name: 'Pyrrole',
    smiles: 'c1cc[nH]c1',
    mf: 'C4H5N',
    dbe: 3,
    rings: 1,
    piBonds: 2,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'nitrogen'],
    note: 'The same 3 as furan, with an NH.',
  },
  {
    id: 'benzonitrile',
    name: 'Benzonitrile',
    smiles: 'N#Cc1ccccc1',
    mf: 'C7H5N',
    dbe: 6,
    rings: 1,
    piBonds: 5,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'triple', 'nitrogen'],
    note: '4 for the ring plus 2 for the nitrile.',
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
    mf: 'C8H10N4O2',
    dbe: 6,
    rings: 2,
    piBonds: 4,
    level: 'intermediate',
    tags: ['ring', 'aromatic', 'carbonyl', 'nitrogen'],
    note: 'Two rings and four pi bonds; the four nitrogens paid 2 of it.',
  },
  {
    id: 'nitrobenzene',
    name: 'Nitrobenzene',
    smiles: '[O-][N+](=O)c1ccccc1',
    mf: 'C6H5NO2',
    dbe: 5,
    rings: 1,
    piBonds: 4,
    level: 'advanced',
    tags: ['ring', 'aromatic', 'nitrogen', 'nitro'],
    note: 'Drawn charge-separated, so nitrogen keeps three bonds and both directions read 5.',
  },
];
