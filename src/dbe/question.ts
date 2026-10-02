/**
 * The two questions a generated series asks, written from one pool entry.
 *
 * A question is **data**, exactly like a curated one: the series builder draws
 * the molecules and these two write the cards, so what a student reads has the
 * same shape whichever deck it came from.
 *
 * **A formula question states the valence it is counted at.** Sulfur and
 * phosphorus are the subject of this site, so a formula carrying one of them
 * and saying nothing has not asked anything answerable: the card says `the S
 * as S(VI)` — or `S(II)`, the standard table's lowest, when the question does
 * not expand it — in the title, in the prose and in a hint of its own.
 */

import type {
  FormulaExercise,
  StructureExercise,
} from '../data/exercises/types.ts';

import {
  assumptionText,
  chosenAssumptions,
  valenceAssumptions,
  valenceLabel,
} from './assumptions.ts';
import { formatDbe } from './format.ts';
import { dbeOfFormula } from './formula.ts';
import { formulaExerciseLevel } from './level.ts';
import type { SeriesSource } from './series.ts';

/**
 * Read a formula, give its degree of unsaturation.
 * @param id - The id the series minted.
 * @param entry - The molecule it drew.
 * @returns The question.
 */
export function formulaQuestion(
  id: string,
  entry: SeriesSource,
): FormulaExercise {
  const assumed = valenceAssumptions(entry.mf, entry.valences);
  const chosen = chosenAssumptions(assumed);
  // The expanded valence goes in the title as well: the list shows titles and
  // nothing else, and the same formula at S(II) and at S(VI) is two questions.
  const titled = chosen.map(valenceLabel).join(' and ');
  const counting =
    assumed.length === 0 ? '' : `, counting ${assumptionText(assumed)}`;
  return {
    id,
    kind: 'formula',
    title:
      titled === ''
        ? `Read the formula {{${entry.mf}}}`
        : `Read the formula {{${entry.mf}}} at ${titled}`,
    level: formulaExerciseLevel(entry.mf),
    description: `Give the degree of unsaturation of {{${entry.mf}}} from the formula alone${counting}. Open the structure once your answer is in and see how it was spent.`,
    hints: [
      'Oxygen adds nothing and a halogen counts exactly like a hydrogen, so strike those out first.',
      'Carbon adds 1, hydrogen takes away a half, nitrogen and phosphorus add a half — then add 1 for the molecule itself.',
      ...chosen.map(
        (one) =>
          `${valenceLabel(one)} makes ${one.valence} bonds, so each one adds ${formatDbe((one.valence - 2) / 2)}.`,
      ),
    ],
    solution: `{{${entry.mf}}} counts ${formatDbe(entry.dbe)}${counting}, and the drawing behind it is ${entry.name}.`,
    mf: entry.mf,
    expected: { dbe: entry.dbe },
    smiles: entry.smiles,
    ...(entry.valences === undefined ? {} : { valences: entry.valences }),
  };
}

/**
 * Count a drawing, give its degree of unsaturation.
 * @param id - The id the series minted.
 * @param entry - The molecule it drew.
 * @returns The question.
 */
export function structureQuestion(
  id: string,
  entry: SeriesSource,
): StructureExercise {
  const onPaper = dbeOfFormula(entry.mf);
  const disagrees =
    onPaper !== null && onPaper !== entry.dbe
      ? ` Its formula {{${entry.mf}}} says ${formatDbe(onPaper)}, because the table counts every atom at its standard valence.`
      : '';
  return {
    id,
    kind: 'structure',
    title: `Count the drawing of ${entry.name}`,
    level: entry.level,
    description: `Count the rings and the pi bonds of this structure and give the total.`,
    hints: [
      'Count the rings first: a ring is worth exactly as much as a double bond.',
      'Then add 1 for every double bond and 2 for every triple bond.',
    ],
    solution: `The drawing of ${entry.name} counts ${formatDbe(entry.dbe)}.${disagrees}`,
    smiles: entry.smiles,
    name: entry.name,
    mf: entry.mf,
    expected: { dbe: entry.dbe },
  };
}
