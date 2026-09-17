/**
 * What each element is worth, and the two terms that are not an element:
 * one per separate molecule, and half the charge.
 *
 * Every row that names a number names a molecule with it, because a reader
 * checking a rule wants to see it land on something.
 */

import type { DbeReferenceSection } from './types.ts';
import { row } from './types.ts';

/** The contribution table — the first block of the printed sheet. */
export const CONTRIBUTION_SECTION: DbeReferenceSection = {
  id: 'contributions',
  title: 'What each element contributes',
  level: 'beginner',
  intro:
    'Add the contribution of every atom, then add 1. Each contribution is (valence − 2) / 2.',
  rows: [
    row(
      'DBE = C − H/2 + N/2 + 1',
      'The whole rule for C, H, N, O and the halogens, with every halogen folded into H.',
    ),
    row('C, Si', '+1 each. Tetravalent: (4 − 2) / 2. C4H12Si reads 0.', {
      mf: 'C4H12Si',
      reads: 0,
      smiles: 'C[Si](C)(C)C',
      counts: 0,
    }),
    row('N', '+½ each. Trivalent: (3 − 2) / 2. Aniline C6H7N reads 4.', {
      mf: 'C6H7N',
      reads: 4,
      smiles: 'Nc1ccccc1',
      counts: 4,
    }),
    row(
      'P',
      '+½ each. Trivalent is assumed, and a phosphate is not. Triphenylphosphine C18H15P reads 12.',
      {
        mf: 'C18H15P',
        reads: 12,
        smiles: 'c1ccccc1P(c1ccccc1)c1ccccc1',
        counts: 12,
      },
    ),
    row(
      'O',
      '0. Divalent, and the count never sees it: strike every O out before you start. Glucose C6H12O6 reads 1.',
      {
        mf: 'C6H12O6',
        reads: 1,
        smiles: 'OCC1OC(O)C(O)C(O)C1O',
        counts: 1,
      },
    ),
    row(
      'S',
      '0. Divalent is assumed, and a sulfoxide is not. Thiophene C4H4S reads 3.',
      { mf: 'C4H4S', reads: 3, smiles: 'c1ccsc1', counts: 3 },
    ),
    row(
      'H, F, Cl, Br, I',
      '−½ each. Monovalent: (1 − 2) / 2. Chloroform CHCl3 reads 0.',
      { mf: 'CHCl3', reads: 0, smiles: 'ClC(Cl)Cl', counts: 0 },
    ),
    row(
      'Li, Na, K',
      '−½ each: they cap a bond like a hydrogen, so sodium acetate C2H3NaO2 reads 1.',
      {
        mf: 'C2H3NaO2',
        reads: 1,
        smiles: 'CC(=O)[O-].[Na+]',
        counts: 1,
      },
    ),
    row(
      '+ 1 per part',
      'The constant at the end is one per separate molecule. C6H12O6.H2O reads 1; lumped as C6H14O7 it reads 0 and is wrong.',
      {
        mf: 'C6H12O6.H2O',
        reads: 1,
        smiles: 'OCC1OC(O)C(O)C(O)C1O.O',
        counts: 1,
      },
    ),
    row(
      '+ q/2',
      'Add half the charge: an octet atom makes one bond more per unit of positive charge. Acetate C2H3O2(-) reads 1.',
      { mf: 'C2H3O2(-)', reads: 1, smiles: 'CC(=O)[O-]', counts: 1 },
    ),
  ],
};
