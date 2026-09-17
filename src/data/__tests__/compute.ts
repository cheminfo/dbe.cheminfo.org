/**
 * The two readings, taken from `src/dbe` rather than from the content.
 *
 * Every test in this folder holds an authored number against a computed one,
 * so the computed side must never come from the data file it is checking. A
 * helper that returned `entry.dbe` would pass for ever and prove nothing.
 *
 * Both helpers **throw** on a refusal. A SMILES or a formula a data file
 * cannot read is a defect in that file, and a thrown message naming it is more
 * use than a silently skipped case.
 */

import { dbeFromFormula } from '../../dbe/index.ts';
import { readMolecule } from '../../dbe/readMolecule.ts';
import { dbeFromStructure } from '../../dbe/structure.ts';
import type {
  FormulaDbe,
  StructureDbe,
  ValenceChoices,
} from '../../dbe/types.ts';

/** Ids and terms are what an address carries, so they are lowercase and safe. */
export const URL_SAFE = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/**
 * What the formula rule gives.
 * @param mf - The formula, as the content writes it.
 * @param valences - The valences to count at.
 * @returns The reading, with its per-element breakdown.
 */
export function formulaOf(mf: string, valences?: ValenceChoices): FormulaDbe {
  const reading = dbeFromFormula(
    mf,
    valences === undefined ? undefined : { valences },
  );
  if (!reading.ok) throw new Error(`${mf}: ${reading.problem.message}`);
  return reading.value;
}

/**
 * What a drawing counts.
 * @param smiles - The structure, as the content writes it.
 * @returns The count, with its rings and pi bonds apart.
 */
export function structureOf(smiles: string): StructureDbe {
  const reading = readMolecule(smiles);
  if (!reading.ok) throw new Error(`${smiles}: ${reading.problem.message}`);
  return dbeFromStructure(reading.molecule);
}
