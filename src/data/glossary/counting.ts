/**
 * The terms about the count itself: what is being added up, and what counts as
 * one of the things being added.
 *
 * Every example is written the same way round — `code` is the molecular
 * formula and `input` the SMILES of the drawing it is read against — so the
 * default renderer prints `C6H10 on C1=CCCCC1` and a site renderer can send
 * the first to `react-mf` and the second to a depiction without inspecting it.
 */

import type { Glossary } from 'react-cheminfo/core';

/** What a degree of unsaturation is made of. */
export const COUNTING_TERMS: Glossary = {
  dbe: {
    title: 'Degree of unsaturation (DBE)',
    summary:
      'One number for two things: the rings and the pi bonds of a molecule, added together. Also written as the double bond equivalent. From a formula it is C − H/2 + N/2 + 1, with every halogen counted as a hydrogen.',
    examples: [
      {
        code: 'C6H10',
        input: 'C1=CCCCC1',
        note: 'Reads 2, and cyclohexene spends it on one ring plus one C=C.',
      },
      {
        code: 'C6H14',
        input: 'CCCCCC',
        note: 'Reads 0: a saturated chain has neither a ring nor a pi bond.',
      },
    ],
  },
  ring: {
    title: 'Ring',
    summary:
      'Any cycle of bonds. Each independent ring costs one unit of unsaturation, because closing a ring uses the two positions that two hydrogens would otherwise cap.',
    examples: [
      {
        code: 'C6H12',
        input: 'C1CCCCC1',
        note: 'One ring, no pi bond: DBE 1.',
      },
      {
        code: 'C3H6',
        input: 'C1CC1',
        note: 'A three-membered ring costs the same 1 as a six-membered one.',
      },
    ],
  },
  'pi bond': {
    title: 'Pi bond',
    summary:
      'The second and third bond of a multiple bond. A double bond carries one and a triple bond carries two, and each one costs a unit of unsaturation.',
    examples: [
      { code: 'C2H4', input: 'C=C', note: 'One pi bond: DBE 1.' },
      {
        code: 'C2H2',
        input: 'C#C',
        note: 'A triple bond is two pi bonds: DBE 2.',
      },
      {
        code: 'CO2',
        input: 'O=C=O',
        note: 'Two C=O, so DBE 2, with no ring at all.',
      },
    ],
  },
  'independent rings': {
    title: 'Independent rings',
    summary:
      'The number of bonds you would have to cut to leave no cycle at all: bonds minus atoms plus one, per connected part. In a bridged or cage structure it is smaller than the number of rings you can trace with a finger.',
    examples: [
      {
        code: 'C10H16',
        input: 'C1C2CC3CC1CC(C2)C3',
        note: 'Adamantane shows four six-rings and counts 3: 12 bonds − 10 atoms + 1.',
      },
      {
        code: 'C8H8',
        input: 'C12C3C4C1C1C4C3C21',
        note: 'Cubane shows six faces and counts 5: 12 bonds − 8 atoms + 1.',
      },
    ],
  },
  'aromatic ring': {
    title: 'Aromatic ring',
    summary:
      'Count it from its Kekulé drawing: the ring itself plus its alternating pi bonds. Benzene is 4 and a five-membered aromatic ring is 3.',
    examples: [
      {
        code: 'C6H6',
        input: 'c1ccccc1',
        note: 'One ring plus three pi bonds: DBE 4.',
      },
      {
        code: 'C4H4S',
        input: 'c1ccsc1',
        note: 'Thiophene: one ring plus two pi bonds, DBE 3.',
      },
      {
        code: 'C10H8',
        input: 'c1ccc2ccccc2c1',
        note: 'Naphthalene is 7, not 8: the fused bond is shared.',
      },
    ],
  },
  'molecular formula': {
    title: 'Molecular formula',
    summary:
      'The element counts of a molecule, with nothing about how the atoms are joined. It fixes the DBE but never says how the DBE is spent.',
    examples: [
      {
        code: 'C6H10',
        input: 'C1=CCCCC1',
        note: 'Cyclohexene: one ring plus one double bond.',
      },
      {
        code: 'C6H10',
        input: 'C=CCCC=C',
        note: 'Hexa-1,5-diene: the same formula and the same 2, on two double bonds.',
      },
    ],
  },
  valence: {
    title: 'Valence',
    summary:
      'The number of bonds an atom holds. It is the only thing that decides an element’s contribution to the DBE, which is (valence − 2) / 2.',
    examples: [
      {
        code: 'C4H12Si',
        input: 'C[Si](C)(C)C',
        note: 'Silicon holds four bonds like carbon and contributes +1: DBE 0.',
      },
      {
        code: 'C2H6OS',
        input: 'CS(=O)C',
        note: 'Sulfur holds four bonds here, not two, so the table under-counts by 1.',
      },
    ],
  },
};
