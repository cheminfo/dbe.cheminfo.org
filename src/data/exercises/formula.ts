/**
 * Ten questions in the formula direction: here is a formula, what is its DBE?
 *
 * The last three ask what the **rule** produces rather than what the molecule
 * is, because that is the honest question for a sulfoxide, a phosphate and
 * SF6 — and the drawing the card offers beside them is where the disagreement
 * shows up.
 */

import type { FormulaExercise } from './types.ts';

/** The molecular-formula deck, easiest first. */
export const FORMULA_EXERCISES: readonly FormulaExercise[] = [
  {
    id: 'mf-hexane',
    kind: 'formula',
    level: 'beginner',
    title: 'A saturated chain',
    mf: 'C6H14',
    smiles: 'CCCCCC',
    expected: { dbe: 0 },
    description:
      'Read the [[dbe|degree of unsaturation]] of C6H14 without drawing anything. Count the carbons, subtract half the hydrogens, add one. A molecule with no [[ring]] and no [[pi bond]] lands on one particular number, and this is it.',
    hints: [
      'Carbon adds 1 each and hydrogen subtracts a half each, so C6H14 is 6 and −7.',
      'Run it as 6 − 14/2 + 1.',
    ],
    solution:
      'DBE = 6 − 7 + 1 = 0. The chain is saturated: no ring, no pi bond.',
  },
  {
    id: 'mf-cyclohexene',
    kind: 'formula',
    level: 'beginner',
    title: 'Four hydrogens missing',
    mf: 'C6H10',
    smiles: 'C1=CCCCC1',
    expected: { dbe: 2 },
    description:
      'C6H10 has four hydrogens fewer than hexane. Each pair of hydrogens missing from the saturated chain is one unit of [[dbe|unsaturation]]. Give the number, then open the structure and see which mix of [[ring]] and [[pi bond|double bond]] it turned out to be.',
    hints: [
      'Hexane C6H14 reads 0, and every two hydrogens removed add 1.',
      'Run it as 6 − 10/2 + 1.',
      'Cyclohexene spends the answer as one ring plus one double bond.',
    ],
    solution:
      'DBE = 6 − 5 + 1 = 2. Cyclohexene spends it on one ring and one C=C; hexa-1,5-diene has the same formula and spends it on two double bonds.',
  },
  {
    id: 'mf-benzene',
    kind: 'formula',
    level: 'beginner',
    title: 'The benzene ring is 4',
    mf: 'C6H6',
    smiles: 'c1ccccc1',
    expected: { dbe: 4 },
    description:
      'A [[aromatic ring|benzene ring]] is the fragment you will meet most often. Read the DBE of C6H6 from the formula alone. Keep the number: every phenyl group inside a larger formula carries the same one.',
    hints: [
      'Six carbons and six hydrogens: run 6 − 6/2 + 1.',
      'The ring itself is worth 1 and each of the three C=C is worth 1.',
    ],
    solution: 'DBE = 6 − 3 + 1 = 4: one ring plus three pi bonds.',
  },
  {
    id: 'mf-glucose',
    kind: 'formula',
    level: 'beginner',
    title: 'Six oxygens that cost nothing',
    mf: 'C6H12O6',
    smiles: 'OCC1OC(O)C(O)C(O)C1O',
    expected: { dbe: 1 },
    description:
      'Six oxygens look like they should matter. Read the DBE of glucose, C6H12O6. [[oxygen|Oxygen]] holds two bonds and bridges them, so it adds nothing at all.',
    hints: [
      'Strike every oxygen out of the formula before you start.',
      'What is left is C6H12, which reads 6 − 6 + 1.',
    ],
    solution:
      'DBE = 6 − 6 + 1 = 1. The single unit is the pyranose ring, and the aldehyde is closed into it.',
  },
  {
    id: 'mf-halobenzene',
    kind: 'formula',
    level: 'intermediate',
    title: 'Three fluorines, no change',
    mf: 'C7H5F3',
    smiles: 'FC(F)(F)c1ccccc1',
    expected: { dbe: 4 },
    description:
      'A [[halogen]] caps exactly one bond, like a hydrogen, so it counts like one. Read the DBE of C7H5F3. Compare it with toluene C7H8, the same skeleton with hydrogens where the fluorines are.',
    hints: [
      'Treat every F, Cl, Br and I as a hydrogen, so C7H5F3 behaves as C7H8 does.',
      'Run it as 7 − (5 + 3)/2 + 1.',
    ],
    solution:
      'DBE = 7 − 4 + 1 = 4, the same as toluene: one benzene ring and nothing else.',
  },
  {
    id: 'mf-caffeine',
    kind: 'formula',
    level: 'intermediate',
    title: 'Four nitrogens add two',
    mf: 'C8H10N4O2',
    smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
    expected: { dbe: 6 },
    description:
      '[[nitrogen|Nitrogen]] holds three bonds, so each one adds a half. Read the DBE of caffeine, C8H10N4O2. Then open the structure and split your number into [[ring|rings]] and [[pi bond|pi bonds]].',
    hints: [
      'Each oxygen contributes 0 and each nitrogen contributes +½, so four nitrogens are worth 2.',
      'Run it as 8 − 10/2 + 4/2 + 1.',
    ],
    solution:
      'DBE = 8 − 5 + 2 + 1 = 6: two fused rings and four pi bonds, two of which are the C=O.',
  },
  {
    id: 'mf-aspirin',
    kind: 'formula',
    level: 'intermediate',
    title: 'A formula from a mass spectrum',
    mf: 'C9H8O4',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    expected: { dbe: 6 },
    description:
      'A mass spectrum hands you C9H8O4 and nothing else. Read its DBE, then say what it buys: a [[aromatic ring|benzene ring]] is 4 and each [[carbonyl|C=O]] is 1. Check that split against the drawing.',
    hints: [
      'The four oxygens contribute nothing, so read the formula as C9H8.',
      'Run it as 9 − 8/2 + 1.',
      'Six splits as 4 for the ring, 1 for the ester C=O and 1 for the acid C=O.',
    ],
    solution:
      'DBE = 9 − 4 + 1 = 6: the benzene ring is 4, the ester C=O is 1, the acid C=O is 1.',
  },
  {
    id: 'mf-dmso',
    kind: 'formula',
    level: 'advanced',
    title: 'What the rule says about a sulfoxide',
    mf: 'C2H6OS',
    smiles: 'CS(=O)C',
    expected: { dbe: 0 },
    description:
      'Give the number the formula rule produces for C2H6OS, which takes sulfur as divalent. Then look at dimethyl [[sulfoxide]] beside it and count [[ring|rings]] plus [[pi bond|pi bonds]]. The two do not match, and the drawing is the one that counted bonds.',
    hints: [
      'Sulfur sits at 0 in the table, exactly where oxygen sits.',
      'So the rule sees C2H6 and nothing else: run 2 − 6/2 + 1.',
      'The S=O in the drawing is one pi bond the rule never charged you for.',
    ],
    solution:
      'The rule gives 2 − 3 + 0 + 0 + 1 = 0. The structure counts 1, because sulfur holds four bonds here rather than two.',
  },
  {
    id: 'mf-phosphate',
    kind: 'formula',
    level: 'advanced',
    title: 'What the rule says about a phosphate',
    mf: 'H3O4P',
    smiles: 'OP(=O)(O)O',
    expected: { dbe: 0 },
    description:
      'Phosphoric acid is H3O4P. Give the number the formula rule produces, with phosphorus taken as trivalent as in a [[phosphine]]. Count the drawing as well: the P=O is one [[pi bond]] the rule cannot see.',
    hints: [
      'Phosphorus contributes +½ and every oxygen contributes 0.',
      'So the sum is −3/2 + 1/2 + 1.',
      'The drawing counts one higher, and the difference is the P=O.',
    ],
    solution:
      'The rule gives −1.5 + 0.5 + 1 = 0. The drawing counts 1, because phosphorus holds five bonds in a phosphate rather than three.',
  },
  {
    id: 'mf-sf6',
    kind: 'formula',
    level: 'advanced',
    title: 'A DBE below zero',
    mf: 'F6S',
    smiles: 'FS(F)(F)(F)(F)F',
    expected: { dbe: -2 },
    description:
      'Run the rule on sulfur hexafluoride, written F6S, and report what comes out. The answer is not a count of anything. A DBE below zero is the rule saying that a [[valence]] it assumed is wrong, here sulfur at six bonds instead of two.',
    hints: [
      'Sulfur contributes 0 and each fluorine contributes −½, so six fluorines take off 3.',
      'Run it as 0 − 3 + 1, and keep going even though the answer looks wrong.',
      'A number below zero is the rule saying its sulfur is not divalent.',
    ],
    solution:
      'DBE = 0 − 3 + 1 = −2. SF6 has no ring and no pi bond; the −2 is the price of assuming divalent sulfur.',
  },
];
