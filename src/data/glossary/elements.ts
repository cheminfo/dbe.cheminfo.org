/**
 * The terms about what one element is worth, and what a charge does to the sum.
 *
 * Nitrogen sits here rather than with sulfur and phosphorus on purpose: it
 * cannot expand its octet, so a nitro group is always drawn charge-separated
 * and the two directions always agree on it. That is the negative example the
 * heteroatom entries are read against.
 */

import type { Glossary } from 'react-cheminfo/core';

/** What each element contributes, and the charge term. */
export const ELEMENT_TERMS: Glossary = {
  halogen: {
    title: 'Halogen',
    summary:
      'F, Cl, Br and I hold one bond exactly as a hydrogen does, so each contributes −½ and is simply added to the hydrogen count.',
    examples: [
      {
        code: 'C7H5F3',
        input: 'FC(F)(F)c1ccccc1',
        note: 'Reads as C7H8 would: DBE 4, the benzene ring alone.',
      },
      {
        code: 'CHCl3',
        input: 'ClC(Cl)Cl',
        note: 'Chloroform reads as CH4 would: DBE 0.',
      },
    ],
  },
  oxygen: {
    title: 'Oxygen',
    summary:
      'Oxygen holds two bonds and bridges them, so it contributes 0 and never changes a DBE. Deleting every oxygen from a formula leaves the answer untouched.',
    examples: [
      {
        code: 'C6H12O6',
        input: 'OCC1OC(O)C(O)C(O)C1O',
        note: 'Glucose reads as C6H12 would: DBE 1, the ring.',
      },
      {
        code: 'C4H10O',
        input: 'CCOCC',
        note: 'An ether reads as C4H10 would: DBE 0.',
      },
    ],
  },
  nitrogen: {
    title: 'Nitrogen',
    summary:
      'Nitrogen holds three bonds, so each one contributes +½. It cannot expand its octet, so unlike sulfur and phosphorus it never makes the formula and the drawing disagree.',
    examples: [
      {
        code: 'C6H7N',
        input: 'Nc1ccccc1',
        note: 'Aniline: 6 − 3.5 + 0.5 + 1 = 4, the ring alone.',
      },
      {
        code: 'C8H10N4O2',
        input: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
        note: 'Caffeine: four nitrogens add 2, giving DBE 6.',
      },
      {
        code: 'C6H5NO2',
        input: '[O-][N+](=O)c1ccccc1',
        note: 'Nitrobenzene: the nitro group is drawn charge-separated, so both directions read 5.',
      },
    ],
  },
  carbonyl: {
    title: 'Carbonyl (C=O)',
    summary:
      'One pi bond, worth exactly 1, whatever it belongs to: an aldehyde, a ketone, an ester, an amide, an acid or a carbonate.',
    examples: [
      {
        code: 'C2H4O2',
        input: 'CC(=O)O',
        note: 'Acetic acid: DBE 1, spent on the C=O.',
      },
      {
        code: 'C9H8O4',
        input: 'CC(=O)Oc1ccccc1C(=O)O',
        note: 'Aspirin: 4 for the ring, 1 per C=O, total 6.',
      },
    ],
  },
  charge: {
    title: 'Charge',
    summary:
      'A DBE read off a formula assumes a neutral, even-electron molecule. Write the charge and half of it is added back, because a main-group atom keeping its octet makes one bond more per unit of positive charge. A half-integer answer means the charge or an odd electron was left out, not that the molecule has half a ring.',
    examples: [
      {
        code: 'C6H8N',
        input: '[NH3+]c1ccccc1',
        note: 'Anilinium read as a neutral formula gives 3.5; written C6H8N(+) it gives 4, which is what the drawing counts.',
      },
      {
        code: 'C2H3O2(-)',
        input: 'CC(=O)[O-]',
        note: 'Acetate: the formula gives 1 and the drawing counts 1.',
      },
    ],
  },
};
