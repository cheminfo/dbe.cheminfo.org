/**
 * Ten questions in the structure direction: here is a drawing, count it.
 *
 * Five of them ask for the split as well as the total, and they are the five
 * where the split is the lesson — a fused pair, a bridged bicyclic, a cage,
 * a cube and a sulfone. A student who can only give the total has not yet
 * learnt that an independent ring is not a ring you can trace with a finger.
 */

import type { StructureExercise } from './types.ts';

/** The structure deck, easiest first. */
export const STRUCTURE_EXERCISES: readonly StructureExercise[] = [
  {
    id: 'struct-styrene',
    kind: 'structure',
    level: 'beginner',
    title: 'Count the drawing',
    name: 'Styrene',
    smiles: 'C=Cc1ccccc1',
    mf: 'C8H8',
    expected: { dbe: 5 },
    description:
      'Count the [[ring|rings]] and the [[pi bond|pi bonds]] in the structure and add them. Do not read the formula first. Then check your answer against C8H8 and watch the two agree.',
    hints: [
      'Count the ring first, then every double and triple bond.',
      'The benzene ring on its own is worth 4, and the vinyl C=C is worth 1.',
    ],
    solution:
      '1 ring + 4 pi bonds = 5. The ring contributes 4 and the vinyl C=C contributes 1.',
  },
  {
    id: 'struct-glucose',
    kind: 'structure',
    level: 'beginner',
    title: 'A ring and no double bond',
    name: 'Glucose, ring form',
    smiles: 'OCC1OC(O)C(O)C(O)C1O',
    mf: 'C6H12O6',
    expected: { dbe: 1 },
    description:
      'Count the structure, not the formula. Glucose has six oxygens and none of them is a [[carbonyl|C=O]] in this ring form. Say how many [[ring|rings]] and [[pi bond|pi bonds]] there are in total.',
    hints: [
      'Look for a double bond anywhere in the drawing: there is none.',
      'What is left to count is the pyranose ring, and a ring is worth 1.',
    ],
    solution:
      '1 ring + 0 pi bonds = 1. The open-chain form also reads 1, spent on the aldehyde C=O instead.',
  },
  {
    id: 'struct-thiophene',
    kind: 'structure',
    level: 'intermediate',
    title: 'A sulfur that does not break it',
    name: 'Thiophene',
    smiles: 'c1ccsc1',
    mf: 'C4H4S',
    expected: { dbe: 3 },
    description:
      'Sulfur does not always break the formula rule. The sulfur of thiophene holds two bonds, which is exactly what the table assumes. Count the [[ring]] and the [[pi bond|pi bonds]], then read C4H4S and watch the two agree.',
    hints: [
      'A five-membered aromatic ring carries two pi bonds, not three.',
      'Add the ring itself to those two.',
    ],
    solution:
      '1 ring + 2 pi bonds = 3, and C4H4S reads 4 − 2 + 0 + 1 = 3. A thioether sulfur costs nothing.',
  },
  {
    id: 'struct-naphthalene',
    kind: 'structure',
    level: 'intermediate',
    title: 'Two fused rings are not two benzenes',
    name: 'Naphthalene',
    smiles: 'c1ccc2ccccc2c1',
    mf: 'C10H8',
    split: true,
    expected: { dbe: 7, rings: 2, piBonds: 5 },
    description:
      'Two fused [[aromatic ring|aromatic rings]] are not two benzenes. Count the [[independent rings]] and the [[pi bond|pi bonds]] separately, then add them. Compare the total with 8, which is what two separate benzene rings would give.',
    hints: [
      'Two separate benzenes would be 8, and a fused pair shares a bond.',
      'Count the pi bonds on a Kekulé drawing: there are five, not six.',
    ],
    solution:
      '2 rings + 5 pi bonds = 7, and C10H8 reads 10 − 4 + 1 = 7. The shared bond is counted once.',
  },
  {
    id: 'struct-camphor',
    kind: 'structure',
    level: 'intermediate',
    title: 'A bridged bicyclic',
    name: 'Camphor',
    smiles: 'CC1(C)C2CCC1(C)C(=O)C2',
    mf: 'C10H16O',
    split: true,
    expected: { dbe: 3, rings: 2, piBonds: 1 },
    description:
      'Camphor is bridged: its two rings share more than one bond. Count the [[independent rings]] rather than the rings you can trace with a finger. Add the [[carbonyl|C=O]] and give both halves.',
    hints: [
      'The number of independent rings is bonds minus atoms plus one.',
      'A bridged bicyclic skeleton counts 2, however many faces you can see.',
    ],
    solution: '2 rings + 1 pi bond = 3, and C10H16O reads 10 − 8 + 1 = 3.',
  },
  {
    id: 'struct-adamantane',
    kind: 'structure',
    level: 'advanced',
    title: 'Four rings you can see, three you can count',
    name: 'Adamantane',
    smiles: 'C1C2CC3CC1CC(C2)C3',
    mf: 'C10H16',
    split: true,
    expected: { dbe: 3, rings: 3, piBonds: 0 },
    description:
      'Adamantane shows four six-membered rings, and its DBE is not 4. Count the [[independent rings]] instead: bonds minus atoms plus one. There is no [[pi bond]] anywhere in the drawing.',
    hints: [
      'Count the carbons and the C–C bonds: 10 atoms and 12 bonds.',
      'Independent rings = 12 − 10 + 1.',
    ],
    solution:
      '3 rings + 0 pi bonds = 3, and C10H16 reads 10 − 8 + 1 = 3. The fourth visible ring is a combination of the other three.',
  },
  {
    id: 'struct-cubane',
    kind: 'structure',
    level: 'advanced',
    title: 'Six faces, five rings',
    name: 'Cubane',
    smiles: 'C12C3C4C1C1C4C3C21',
    mf: 'C8H8',
    split: true,
    expected: { dbe: 5, rings: 5, piBonds: 0 },
    description:
      'A cube has six faces, and cubane’s DBE is not 6. Count bonds minus atoms plus one to get the [[independent rings]]. Then read C8H8 and check that the formula agrees with what you counted.',
    hints: [
      'Cubane has 8 carbons and 12 C–C bonds.',
      'Independent rings = 12 − 8 + 1.',
      'C8H8 is also the formula of styrene, which spends the same total on one ring and four pi bonds.',
    ],
    solution:
      '5 rings + 0 pi bonds = 5, and C8H8 reads 8 − 4 + 1 = 5. The sixth face is a combination of the other five.',
  },
  {
    id: 'struct-sulfone',
    kind: 'structure',
    level: 'advanced',
    title: 'Two S=O the formula cannot see',
    name: 'Dimethyl sulfone',
    smiles: 'CS(=O)(=O)C',
    mf: 'C2H6O2S',
    split: true,
    expected: { dbe: 2, rings: 0, piBonds: 2 },
    description:
      'Count the [[ring|rings]] and the [[pi bond|pi bonds]] of dimethyl [[sulfone]] in the drawing. Then read C2H6O2S with the formula rule and compare the two. The gap between them is what hexavalent sulfur costs.',
    hints: [
      'There is no ring at all, so the whole answer is in the pi bonds.',
      'Both S=O bonds count, one each.',
      'The formula rule gives 2 − 3 + 1 = 0 for the same molecule, so the gap is 2.',
    ],
    solution:
      '0 rings + 2 pi bonds = 2, while the formula rule reads 0. Sulfur holds six bonds here and the table assumed two.',
  },
  {
    id: 'struct-sulfanilamide',
    kind: 'structure',
    level: 'advanced',
    title: 'A sulfonamide reads two low',
    name: 'Sulfanilamide',
    smiles: 'Nc1ccc(cc1)S(N)(=O)=O',
    mf: 'C6H8N2O2S',
    expected: { dbe: 6 },
    description:
      'Sulfanilamide is a [[sulfonamide]]: a benzene ring, an amine and an SO2 group. Count the [[ring]] and every [[pi bond]]. The formula rule reads 4 for it, short by exactly the two S=O.',
    hints: [
      'The benzene ring on its own is 4.',
      'Add the two S=O bonds to that.',
    ],
    solution:
      '1 ring + 5 pi bonds = 6: 4 for the benzene and 1 per S=O. C6H8N2O2S reads 6 − 4 + 1 + 1 = 4.',
  },
  {
    id: 'struct-tppo',
    kind: 'structure',
    level: 'advanced',
    title: 'The phosphine and its oxide',
    name: 'Triphenylphosphine oxide',
    smiles: 'c1ccccc1P(=O)(c1ccccc1)c1ccccc1',
    mf: 'C18H15OP',
    expected: { dbe: 13 },
    description:
      'Triphenylphosphine oxide is three phenyl groups on a [[phosphate|P=O]]. Count the [[independent rings]] and the [[pi bond|pi bonds]]. Then read C18H15OP, and read C18H15P for the [[phosphine]] without the oxygen: only one of the two matches its drawing.',
    hints: [
      'Three benzene rings are worth 4 each, so twelve before the oxygen.',
      'Add the P=O to those twelve.',
      'The formula rule gives 12 for the phosphine and 12 for its oxide.',
    ],
    solution:
      '3 rings + 10 pi bonds = 13, while C18H15OP reads 18 − 7.5 + 0.5 + 1 = 12. The phosphine C18H15P reads 12 and counts 12, so only the oxide disagrees.',
  },
];
