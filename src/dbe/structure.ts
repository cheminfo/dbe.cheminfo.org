/**
 * What a drawing says the degree of unsaturation is: its rings plus its pi
 * bonds, read off the bonds rather than guessed from the elements.
 *
 * ```
 * rings = bonds − atoms + fragments      (the cyclomatic number)
 * π     = Σ(bond orders) − bonds
 * DBE   = rings + π = Σ(bond orders) − atoms + fragments
 * ```
 *
 * **Never openchemlib's ring set.** `getRingSet().getSize()` enumerates cycles
 * rather than a ring basis: measured on this build it returns 22 for cubane
 * where the answer is 5, and 4 for adamantane where the answer is 3. It is
 * also bounded by a small-ring ceiling, so a macrocycle would read as acyclic.
 * The identity above has none of those failure modes and needs no ring
 * perception at all.
 *
 * **Implicit hydrogens need no correction.** Each would add one atom and one
 * bond of order 1, so `Σorder − atoms` does not move. `getAllAtoms()` and
 * `getAllBonds()` are used together throughout — mixing them with
 * `getAtoms()` / `getBonds()`, which drop plain hydrogens, is what would break
 * that.
 *
 * **Charges need no correction either.** A charged atom's bond count is
 * already what the drawing states, so ammonium counts 0 and acetate 1 with no
 * charge term anywhere. That the formula side *does* need one is the cleanest
 * statement of which of the two is the trustworthy number.
 */

import { Molecule } from 'openchemlib';
import { getMF } from 'openchemlib-utils';

import type {
  ExpandedAtom,
  MultipleBond,
  StructureCaveat,
  StructureDbe,
} from './types.ts';
import { DEFAULT_VALENCES } from './valences.ts';

/**
 * Count a drawing.
 *
 * The molecule is not changed: its helper arrays are filled, which is a cache
 * openchemlib keeps beside the structure.
 * @param molecule - A structure, already parsed.
 * @returns What the drawing counts, with everything the readout needs.
 */
export function dbeFromStructure(molecule: Molecule): StructureDbe {
  molecule.ensureHelperArrays(Molecule.cHelperNeighbours);

  const atoms = molecule.getAllAtoms();
  const bonds = molecule.getAllBonds();
  const caveats: StructureCaveat[] = [];

  const multiple: MultipleBond[] = [];
  const dative: number[] = [];
  const delocalized: number[] = [];
  let orderSum = 0;
  for (let bond = 0; bond < bonds; bond++) {
    const order = molecule.getBondOrder(bond);
    orderSum += order;
    if (order === 0) dative.push(bond);
    if (molecule.getBondType(bond) === Molecule.cBondTypeDelocalized) {
      delocalized.push(bond);
    }
    if (order > 1) {
      multiple.push({
        bond,
        order,
        pi: order - 1,
        label: bondLabel(molecule, bond, order),
      });
    }
  }

  const fragmentNumbers = new Array<number>(atoms).fill(0);
  const fragments = molecule.getFragmentNumbers(fragmentNumbers, false, false);

  const expanded: ExpandedAtom[] = [];
  const pseudo: number[] = [];
  const radicals: number[] = [];
  let charge = 0;
  for (let atom = 0; atom < atoms; atom++) {
    charge += molecule.getAtomCharge(atom);
    if (molecule.getAtomRadical(atom) !== Molecule.cAtomRadicalStateNone) {
      radicals.push(atom);
    }
    if (isPseudoAtom(molecule, atom)) pseudo.push(atom);
    const stretched = expandedAtom(molecule, atom);
    if (stretched !== null) expanded.push(stretched);
  }

  if (dative.length > 0) caveats.push(dativeCaveat(dative));
  if (delocalized.length > 0) caveats.push(delocalizedCaveat(delocalized));
  if (pseudo.length > 0) caveats.push(rGroupCaveat(pseudo));
  if (radicals.length > 0) caveats.push(radicalCaveat(radicals));

  return {
    mf: moleculeFormula(molecule),
    rings: bonds - atoms + fragments,
    piBonds: orderSum - bonds,
    dbe: orderSum - atoms + fragments,
    atoms,
    bonds,
    fragments,
    charge,
    multiple,
    expanded,
    caveats,
  };
}

/**
 * Whether the count can be shown as an answer.
 *
 * A radical is the one caveat that leaves the number right — it only explains
 * the half the formula side shows. Every other caveat means a bond could not
 * be counted, and a page that has one prints the reason instead of the number.
 * @param structure - What {@link dbeFromStructure} counted.
 * @returns True when nothing stops the count from being exact.
 */
export function countIsExact(structure: StructureDbe): boolean {
  const caveats = structure.caveats;
  for (const caveat of caveats) {
    if (caveat.kind !== 'radical') return false;
  }
  return true;
}

/**
 * The formula of a drawing, fragments kept apart.
 *
 * `getMF(molecule).mf` lumps every fragment into one string — `CCO.O` comes
 * back as `C2H8O2` — and a lumped formula loses one whole unit per extra
 * fragment. The parts are joined back with the dot they were separated by.
 */
function moleculeFormula(molecule: Molecule): string {
  try {
    // openchemlib-utils types this as `object`.
    const { parts } = getMF(molecule) as { mf: string; parts: string[] };
    return parts.join('.');
  } catch {
    return '';
  }
}

/**
 * An atom drawn making more bonds than its charge alone accounts for.
 *
 * A full-octet ion makes one bond more per unit of positive charge, so the
 * sulfonium of a sulfoxide ylide (three bonds, +1) is *not* expanded while the
 * sulfur of a sulfone (six bonds, neutral) is.
 */
function expandedAtom(molecule: Molecule, atom: number): ExpandedAtom | null {
  const symbol = molecule.getAtomLabel(atom);
  const standard = DEFAULT_VALENCES[symbol];
  if (standard === undefined) return null;
  const valence =
    molecule.getOccupiedValence(atom) + molecule.getImplicitHydrogens(atom);
  if (valence <= standard + molecule.getAtomCharge(atom)) return null;
  return { atom, symbol, valence, standard };
}

/** R groups and the `?` wildcard sit outside the real elements. */
function isPseudoAtom(molecule: Molecule, atom: number): boolean {
  const atomicNo = molecule.getAtomicNo(atom);
  return atomicNo === 0 || atomicNo > 118;
}

function bondLabel(molecule: Molecule, bond: number, order: number): string {
  const from = molecule.getAtomLabel(molecule.getBondAtom(0, bond));
  const to = molecule.getAtomLabel(molecule.getBondAtom(1, bond));
  return `${from}${order === 3 ? '#' : '='}${to}`;
}

function dativeCaveat(indices: readonly number[]): StructureCaveat {
  return {
    kind: 'dative',
    message:
      'A dative bond has no order, so the bonds of this drawing cannot be added up. Draw the bond as a shared pair and the count follows.',
    indices,
  };
}

function delocalizedCaveat(indices: readonly number[]): StructureCaveat {
  return {
    kind: 'delocalized',
    message:
      'Some bonds are marked delocalised rather than alternating, so their pi bonds cannot be counted. Draw the Kekulé form and the count follows.',
    indices,
  };
}

function rGroupCaveat(indices: readonly number[]): StructureCaveat {
  return {
    kind: 'rGroup',
    message:
      'An R group makes an unknown number of bonds, so this structure has no degree of unsaturation until the substituent is drawn.',
    indices,
  };
}

function radicalCaveat(indices: readonly number[]): StructureCaveat {
  return {
    kind: 'radical',
    message:
      'One atom carries an unpaired electron. The count is still exact; it is the formula that answers a half, because an odd number of bonds cannot be halved.',
    indices,
  };
}
