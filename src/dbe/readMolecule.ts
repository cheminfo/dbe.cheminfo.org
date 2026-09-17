/**
 * Turn whatever a visitor typed, pasted, dropped or drew into a molecule.
 *
 * A SMILES, a molfile and an openchemlib idCode all arrive through the same
 * box, and nothing is asked of the visitor because the answer is in the text:
 * `readStructure` from `react-cheminfo/core` tells a molfile from a line
 * notation from a query without parsing any of them.
 *
 * A query is refused rather than counted. `[CX3]` matches carbons making three
 * connections; it states no bonds of its own, so it has no degree of
 * unsaturation and guessing one would be worse than saying so.
 *
 * This file and `structure.ts` are the only two that import openchemlib, and
 * neither is re-exported from `index.ts`, so a page that only reads a formula
 * never loads two megabytes of structure toolkit.
 */

import { Molecule } from 'openchemlib';
import {
  readStructure,
  splitIdCode,
  structureError,
} from 'react-cheminfo/core';

import type { StructureFormat, StructureProblem } from './types.ts';

/** A molecule, or the reason the text did not describe one. */
export type StructureReading =
  | { ok: true; molecule: Molecule; format: StructureFormat }
  | { ok: false; problem: StructureProblem };

/**
 * Read a structure however it was written.
 * @param text - The structure, as typed, pasted or dropped.
 * @returns The molecule and the notation it was read as, or the reason there
 * is none.
 */
export function readMolecule(text: string): StructureReading {
  const { kind, value } = readStructure(text);

  if (kind === 'empty') {
    return refuse('empty', 'Draw a structure, or type one as SMILES.');
  }
  if (kind === 'smarts') {
    return refuse(
      'query',
      'A query matches structures rather than being one, so it states no bonds and has no degree of unsaturation. Type a molecule instead.',
    );
  }
  if (kind === 'molfile') {
    try {
      return {
        ok: true,
        molecule: Molecule.fromMolfile(value),
        format: 'molfile',
      };
    } catch (error) {
      return refuse('syntax', structureError(error).message);
    }
  }

  try {
    return { ok: true, molecule: Molecule.fromSmiles(value), format: 'smiles' };
  } catch (error) {
    const molecule = readIdCode(value);
    return molecule === null
      ? refuse('syntax', structureError(error).message)
      : { ok: true, molecule, format: 'idcode' };
  }
}

/**
 * The SMILES of a molecule, which is what an address carries: a teacher has to
 * be able to read the link they hand out.
 * @param molecule - The structure.
 * @returns Its SMILES, or an empty string when it holds no atom.
 */
export function moleculeSmiles(molecule: Molecule): string {
  if (molecule.getAllAtoms() === 0) return '';
  // The isomeric form, which is the supported one. Stereo descriptors make no
  // difference to a degree of unsaturation — it counts bonds, not their
  // arrangement — but dropping them would quietly change the molecule a
  // student drew into a different one on the way into the link.
  return molecule.toIsomericSmiles();
}

/**
 * Read an idCode, and only an idCode.
 *
 * `Molecule.fromIDCode` never fails: handed `notanidcode` it returns a
 * thirty-one atom molecule of nonsense rather than throwing. An idCode is
 * canonical, so the only safe test is to write the molecule back out and see
 * whether the same text comes back.
 */
function readIdCode(text: string): Molecule | null {
  const { idCode, coordinates } = splitIdCode(text);
  if (idCode === '') return null;
  try {
    const molecule =
      coordinates === undefined
        ? Molecule.fromIDCode(idCode)
        : Molecule.fromIDCode(idCode, coordinates);
    return molecule.getIDCode() === idCode ? molecule : null;
  } catch {
    return null;
  }
}

function refuse(
  kind: StructureProblem['kind'],
  message: string,
): StructureReading {
  return { ok: false, problem: { kind, message } };
}
