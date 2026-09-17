/**
 * What the number counts, and how to read it off a formula.
 *
 * Every section opens the calculator on a molecule that makes one point and
 * nothing else, so the reader can change one atom and watch the number move.
 * The order is fixed: rings and pi bonds first, then the formula rule, then
 * the elements that cost nothing, then the general expression every row of the
 * table turns out to be.
 */

import type { LearnSection } from './types.ts';

/** The sections that hold whatever the reader already knew. */
export const BASIC_SECTIONS: readonly LearnSection[] = [
  {
    id: 'rings-and-pi',
    level: 'beginner',
    title: 'Rings plus pi bonds',
    mf: 'C6H10',
    smiles: 'C1=CCCCC1',
    summary:
      'The degree of unsaturation counts rings and pi bonds together, so cyclohexene — one ring, one double bond — reads 2.',
    notice: 'One ring and one C=C on the right, 2 on the left.',
    description:
      'The [[dbe|degree of unsaturation]] is one number for two things: [[ring|rings]] and [[pi bond|pi bonds]], added together. Cyclohexene has one ring and one double bond, so its DBE is 2. Open the ring and the number falls to 1. Hydrogenate the double bond and it falls to 1 as well, so the count alone never says which one you removed.',
  },
  {
    id: 'from-the-formula',
    level: 'beginner',
    title: 'The formula alone gives it',
    mf: 'C6H10',
    summary:
      'For a formula of carbon and hydrogen alone, DBE = C − H/2 + 1, and C6H10 gives 2 without any structure being drawn.',
    notice: 'Type C6H12 and watch the number drop to 1.',
    description:
      'You do not need the structure. For a [[molecular formula|formula]] of carbon and hydrogen only, DBE = C − H/2 + 1, so C6H10 gives 6 − 5 + 1 = 2. Every formula that reads 2 carries those two units and nothing else. Which two it carries is the structure’s business, not the formula’s.',
  },
  {
    id: 'halogens-and-oxygen',
    level: 'beginner',
    title: 'Halogens count as hydrogens, oxygen counts as nothing',
    mf: 'C7H5F3',
    smiles: 'FC(F)(F)c1ccccc1',
    summary:
      'A halogen caps one bond like a hydrogen and subtracts a half; oxygen bridges two bonds and changes nothing at all.',
    notice: 'Strike out the three fluorines and C7H8 reads 4 as well.',
    description:
      'A [[halogen]] caps one bond exactly as a hydrogen does, so it subtracts a half. [[oxygen|Oxygen]] bridges two bonds and changes nothing at all. Benzotrifluoride C7H5F3 reads 7 − 4 + 1 = 4, which is the [[aromatic ring|benzene ring]] and nothing else. Replace the three fluorines by hydrogens and the 4 does not move.',
  },
  {
    id: 'nitrogen',
    level: 'beginner',
    title: 'Nitrogen adds a half',
    mf: 'C8H10N4O2',
    smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
    summary:
      'Nitrogen holds three bonds, so each one adds a half: caffeine C8H10N4O2 reads 6, and its two oxygens paid for none of it.',
    notice: 'Two rings and four pi bonds on the right, 6 on the left.',
    description:
      '[[nitrogen|Nitrogen]] holds three bonds, so each one adds a half. Caffeine C8H10N4O2 reads 8 − 5 + 2 + 1 = 6, which the drawing spends on two rings and four pi bonds. The nitrogens paid for part of that and the oxygens paid for none of it. Delete a methyl group from the drawing and the 6 holds.',
  },
  {
    id: 'valence-rule',
    level: 'intermediate',
    title: 'The rule behind the rule',
    mf: 'C4H12Si',
    smiles: 'C[Si](C)(C)C',
    summary:
      'Every element contributes (v − 2) / 2, where v is the valence it holds: carbon +1, nitrogen +½, oxygen 0, hydrogen −½.',
    notice:
      'Silicon holds four bonds like carbon, so it contributes +1 and the answer is 0.',
    description:
      'Every contribution is (v − 2) / 2, where v is the [[valence]] the atom holds. Carbon at 4 gives +1, nitrogen at 3 gives +½, oxygen at 2 gives 0, hydrogen at 1 gives −½. Silicon holds four bonds like carbon, so tetramethylsilane C4H12Si reads 4 − 6 + 1 + 1 = 0. Every row of the table is that one expression, which is why the next three sections are about a single question: what is v?',
  },
];
