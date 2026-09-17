/**
 * The two blocks the site exists for: sulfur at II, IV and VI, phosphorus at
 * III and V.
 *
 * Each block opens with the case where the table is **right**, because a
 * reader who meets the sulfur rows believing that sulfur always breaks the
 * count has learnt a superstition rather than a rule. The ylide row is the
 * resolution and belongs with the sulfur rows, not in a footnote.
 */

import type { DbeReferenceSection } from './types.ts';
import { row } from './types.ts';

/** Sulfur: two bonds, four bonds, six bonds. */
export const SULFUR_SECTION: DbeReferenceSection = {
  id: 'sulfur',
  title: 'Sulfur: II, IV and VI',
  level: 'intermediate',
  intro:
    'The table assumes divalent sulfur. Add 1 to the formula answer for every S=O in the drawing.',
  rows: [
    row(
      'R–S–R  (S II)',
      'Contributes 0, and the table is right. Thiophene C4H4S reads 3 and counts 3.',
      { mf: 'C4H4S', reads: 3, smiles: 'c1ccsc1', counts: 3 },
    ),
    row(
      'C=S  (S II)',
      'A pi bond in both directions. Thiourea CH4N2S reads 1 and counts 1.',
      { mf: 'CH4N2S', reads: 1, smiles: 'NC(N)=S', counts: 1 },
    ),
    row(
      'R–S(=O)–R  (S IV)',
      'Worth +1, not 0. DMSO C2H6OS reads 0 and counts 1.',
      { mf: 'C2H6OS', reads: 0, smiles: 'CS(=O)C', counts: 1 },
    ),
    row(
      'R–SO2–R  (S VI)',
      'Worth +2. Dimethyl sulfone C2H6O2S reads 0 and counts 2.',
      { mf: 'C2H6O2S', reads: 0, smiles: 'CS(=O)(=O)C', counts: 2 },
    ),
    row(
      'R–SO2–NR2  (S VI)',
      'Also +2. Sulfanilamide C6H8N2O2S reads 4 and counts 6.',
      {
        mf: 'C6H8N2O2S',
        reads: 4,
        smiles: 'Nc1ccc(cc1)S(N)(=O)=O',
        counts: 6,
      },
    ),
    row(
      'R–SO3H  (S VI)',
      'Also +2. Methanesulfonic acid CH4O3S reads 0 and counts 2.',
      { mf: 'CH4O3S', reads: 0, smiles: 'CS(=O)(=O)O', counts: 2 },
    ),
    row(
      'the ylide',
      'Draw (CH3)2S⁺–O⁻ instead: sulfur keeps two bonds and the drawing counts 0, which is what the table gives. Both drawings are right.',
      { mf: 'C2H6OS', reads: 0, smiles: 'C[S+](C)[O-]', counts: 0 },
    ),
    row(
      'SF6',
      'Six bonds and no pi bond. F6S reads −2, which is the rule breaking rather than a molecule; at S(VI) it reads 0.',
      { mf: 'F6S', reads: -2, smiles: 'FS(F)(F)(F)(F)F', counts: 0 },
    ),
  ],
};

/** Phosphorus: three bonds or five. */
export const PHOSPHORUS_SECTION: DbeReferenceSection = {
  id: 'phosphorus',
  title: 'Phosphorus: III and V',
  level: 'intermediate',
  intro:
    'The table assumes trivalent phosphorus. Add 1 for every P=O or P=S in the drawing.',
  rows: [
    row(
      'R3P  (P III)',
      'Worth +½, and the table is right. Triphenylphosphine C18H15P reads 12 and counts 12.',
      {
        mf: 'C18H15P',
        reads: 12,
        smiles: 'c1ccccc1P(c1ccccc1)c1ccccc1',
        counts: 12,
      },
    ),
    row(
      'R3P=O  (P V)',
      'Worth +1½. Triphenylphosphine oxide C18H15OP reads 12 and counts 13.',
      {
        mf: 'C18H15OP',
        reads: 12,
        smiles: 'c1ccccc1P(=O)(c1ccccc1)c1ccccc1',
        counts: 13,
      },
    ),
    row(
      '(RO)3P=O  (P V)',
      'The same +1 over the rule. Trimethyl phosphate C3H9O4P reads 0 and counts 1.',
      { mf: 'C3H9O4P', reads: 0, smiles: 'COP(=O)(OC)OC', counts: 1 },
    ),
    row('H3PO4', 'Phosphoric acid H3O4P reads 0 and counts 1: one P=O.', {
      mf: 'H3O4P',
      reads: 0,
      smiles: 'OP(=O)(O)O',
      counts: 1,
    }),
    row(
      '(RO)2P(=S)OR',
      'A P=S counts like a P=O. Parathion C10H14NO5PS reads 5 and counts 6.',
      {
        mf: 'C10H14NO5PS',
        reads: 5,
        smiles: 'CCOP(=S)(OCC)Oc1ccc(cc1)[N+](=O)[O-]',
        counts: 6,
      },
    ),
    row(
      'PF5',
      'F5P reads −1. A negative number is the trivalent assumption failing; at P(V) it reads 0.',
      { mf: 'F5P', reads: -1, smiles: 'FP(F)(F)(F)F', counts: 0 },
    ),
  ],
};
