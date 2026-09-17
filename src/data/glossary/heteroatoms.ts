/**
 * Sulfur, phosphorus and the ylide: the terms the site exists for.
 *
 * The first entry of each pair is the case where nothing goes wrong — a
 * thioether, a phosphine — because a student learns what a rule excludes by
 * watching it hold. `ylide` is last because it is the resolution: the two
 * numbers are two Lewis structures, not a tool being wrong.
 */

import type { Glossary } from 'react-cheminfo/core';

/** Where the valence the formula assumed is not the valence in the molecule. */
export const HETEROATOM_TERMS: Glossary = {
  thioether: {
    title: 'Thioether',
    summary:
      'A sulfur holding two bonds, R–S–R. This is the case the formula table assumes, so a thioether, a thiol, a disulfide and thiophene all read correctly.',
    examples: [
      {
        code: 'C4H10S',
        input: 'CCSCC',
        note: 'Diethyl sulfide: 0 by the formula and 0 by the drawing.',
      },
      {
        code: 'C5H11NO2S',
        input: 'CSCCC(N)C(=O)O',
        note: 'Methionine: 1 both ways, and the 1 is the C=O.',
      },
    ],
  },
  sulfoxide: {
    title: 'Sulfoxide',
    summary:
      'A sulfur holding four bonds, R–S(=O)–R. The S=O is a pi bond the formula rule does not charge for, so the formula reads one low.',
    examples: [
      {
        code: 'C2H6OS',
        input: 'CS(=O)C',
        note: 'DMSO: the formula gives 0, the structure counts 1.',
      },
      {
        code: 'C7H8OS',
        input: 'CS(=O)c1ccccc1',
        note: 'Methyl phenyl sulfoxide: the formula gives 4, the structure counts 5.',
      },
    ],
  },
  sulfone: {
    title: 'Sulfone',
    summary:
      'A sulfur holding six bonds, R–SO2–R. Two S=O means the formula reads two low.',
    examples: [
      {
        code: 'C2H6O2S',
        input: 'CS(=O)(=O)C',
        note: 'Dimethyl sulfone: the formula gives 0, the structure counts 2.',
      },
      {
        code: 'C4H8O2S',
        input: 'C1CCS(=O)(=O)C1',
        note: 'Sulfolane: the formula gives 1 for the ring, the structure counts 3.',
      },
    ],
  },
  sulfonamide: {
    title: 'Sulfonamide',
    summary:
      'An SO2 group bridging a carbon and a nitrogen. Hexavalent sulfur again, so the formula reads two low.',
    examples: [
      {
        code: 'C6H8N2O2S',
        input: 'Nc1ccc(cc1)S(N)(=O)=O',
        note: 'Sulfanilamide: the formula gives 4, the structure counts 6.',
      },
      {
        code: 'C7H5NO3S',
        input: 'O=C1NS(=O)(=O)c2ccccc21',
        note: 'Saccharin: the formula gives 6, the structure counts 8.',
      },
    ],
  },
  phosphine: {
    title: 'Phosphine',
    summary:
      'A phosphorus holding three bonds, R3P. This is what the formula table assumes, so a phosphine reads correctly.',
    examples: [
      {
        code: 'C18H15P',
        input: 'c1ccccc1P(c1ccccc1)c1ccccc1',
        note: 'Triphenylphosphine: 12 by the formula and 12 by the drawing.',
      },
      {
        code: 'C3H9P',
        input: 'CP(C)C',
        note: 'Trimethylphosphine: 0 both ways.',
      },
    ],
  },
  phosphate: {
    title: 'Phosphate',
    summary:
      'A phosphorus holding five bonds, with one P=O. That pi bond is invisible to the formula rule, so the formula reads one low.',
    examples: [
      {
        code: 'H3O4P',
        input: 'OP(=O)(O)O',
        note: 'Phosphoric acid: the formula gives 0, the structure counts 1.',
      },
      {
        code: 'C3H9O4P',
        input: 'COP(=O)(OC)OC',
        note: 'Trimethyl phosphate: the formula gives 0, the structure counts 1.',
      },
    ],
  },
  ylide: {
    title: 'Ylide',
    summary:
      'The charge-separated drawing of the same molecule: the central atom gives up a bond and the two atoms carry opposite formal charges, as in (CH3)2S⁺–O⁻. Sulfur then keeps two bonds and an octet, which is exactly what the formula table assumes — so the formula rule is answering the ylide question.',
    examples: [
      {
        code: 'C2H6OS',
        input: 'C[S+](C)[O-]',
        note: 'DMSO as an ylide: the drawing counts 0, and the formula rule gives 0 as well.',
      },
      {
        code: 'C2H6OS',
        input: 'CS(=O)C',
        note: 'The same molecule drawn hypervalent counts 1, and it is equally right.',
      },
    ],
  },
};
