/**
 * The two blocks a student uses in an exam room: the fragments worth knowing
 * by heart, and the numbers the rule produces that are not counts of anything.
 *
 * The traps block includes the one about this site itself — we add half the
 * charge where `mf-parser` subtracts it — because a reader comparing our
 * number with another tool's deserves to be told why they differ.
 */

import type { DbeReferenceSection } from './types.ts';
import { row } from './types.ts';

/** Fragments whose DBE should be read without counting anything. */
export const SHORTCUT_SECTION: DbeReferenceSection = {
  id: 'shortcuts',
  title: 'Shortcuts worth knowing by heart',
  level: 'beginner',
  intro: 'Fragments whose DBE you should read without counting anything.',
  rows: [
    row(
      'benzene ring',
      '4: one ring and three pi bonds. Every phenyl group in a formula adds 4.',
      { mf: 'C6H6', reads: 4, smiles: 'c1ccccc1', counts: 4 },
    ),
    row('five-ring aromatic', '3: furan, pyrrole and thiophene all read 3.', {
      mf: 'C4H4O',
      reads: 3,
      smiles: 'c1ccoc1',
      counts: 3,
    }),
    row(
      'C=O',
      '1, whether it is an aldehyde, a ketone, an ester, an amide or an acid.',
      { mf: 'C2H4O2', reads: 1, smiles: 'CC(=O)O', counts: 1 },
    ),
    row(
      'C#N, C#C',
      '2 each: a triple bond is two pi bonds. Benzonitrile C7H5N reads 6.',
      { mf: 'C7H5N', reads: 6, smiles: 'N#Cc1ccccc1', counts: 6 },
    ),
    row(
      'NO2',
      '1, drawn charge-separated. Nitrogen cannot expand its octet, so nitrobenzene C6H5NO2 reads 5 and counts 5.',
      {
        mf: 'C6H5NO2',
        reads: 5,
        smiles: '[O-][N+](=O)c1ccccc1',
        counts: 5,
      },
    ),
    row(
      'fused pair',
      'Naphthalene C10H8 is 7, not 8: the shared bond is counted once.',
      { mf: 'C10H8', reads: 7, smiles: 'c1ccc2ccccc2c1', counts: 7 },
    ),
    row(
      'pyranose ring',
      'Glucose C6H12O6 is 1. The aldehyde is closed into the ring and costs nothing extra.',
      {
        mf: 'C6H12O6',
        reads: 1,
        smiles: 'OCC1OC(O)C(O)C(O)C1O',
        counts: 1,
      },
    ),
    row(
      'independent rings',
      'Bonds minus atoms plus one. Adamantane C10H16 is 3 and cubane C8H8 is 5.',
      {
        mf: 'C10H16',
        reads: 3,
        smiles: 'C1C2CC3CC1CC(C2)C3',
        counts: 3,
      },
    ),
    row(
      'C8H8',
      '5 for cubane and 5 for styrene: the formula cannot tell the two apart.',
      { mf: 'C8H8', reads: 5, smiles: 'C12C3C4C1C1C4C3C21', counts: 5 },
    ),
  ],
};

/** The numbers the rule produces that are not counts of anything. */
export const TRAP_SECTION: DbeReferenceSection = {
  id: 'traps',
  title: 'Where the formula rule breaks',
  level: 'advanced',
  intro:
    'Each row is a number the rule produces that is not a count of rings and pi bonds.',
  rows: [
    row(
      'a negative DBE',
      'A valence assumption is wrong. F6S reads −2 and F5P reads −1; both have no ring and no pi bond.',
      { mf: 'F6S', reads: -2, smiles: 'FS(F)(F)(F)(F)F', counts: 0 },
    ),
    row(
      'a half-integer DBE',
      'A charge or an odd electron was left out. C6H8N read as neutral gives 3.5; written C6H8N(+) it gives 4.',
      {
        mf: 'C6H8N(+)',
        reads: 4,
        smiles: '[NH3+]c1ccccc1',
        counts: 4,
      },
    ),
    row(
      'a radical',
      'The drawing is right and the half is the warning: CH3 reads 0.5 and the methyl radical counts 0.',
      { mf: 'CH3', reads: 0.5, smiles: '[CH3]', counts: 0 },
    ),
    row(
      'a sextet cation',
      'The charge term overcounts by 1 when the charged atom has six electrons: CH3(+) reads 1 and the drawing counts 0.',
      { mf: 'CH3(+)', reads: 1, smiles: '[CH3+]', counts: 0 },
    ),
    row(
      'S=O and P=O',
      'One unit missed per bond: sulfoxide, sulfone, sulfonamide, sulfonic acid, phosphate, phosphine oxide.',
    ),
    row(
      'two parts in one formula',
      'A salt or a hydrate is not one molecule: write the dot. C6H12O6.H2O reads 1 where the lumped C6H14O7 reads 0.',
      { mf: 'C6H12O6.H2O', reads: 1 },
    ),
    row(
      '+ q/2, not − q/2',
      'This site adds half the charge, so ammonium H4N(+) reads 0 and matches its drawing. Tools that subtract it read −1.',
      { mf: 'H4N(+)', reads: 0, smiles: '[NH4+]', counts: 0 },
    ),
    row(
      'a transition metal',
      'Fe, Zn, Cu and the rest have no covalent valence worth assuming, so no number comes out rather than a wrong one.',
    ),
    row(
      'isotopes',
      'Mass does not change the count: C6H5D reads 4, exactly as benzene does.',
      { mf: 'C6H5D', reads: 4, smiles: 'c1ccccc1', counts: 4 },
    ),
  ],
};
