/**
 * What a drawing counts, and the guards that stop it counting a guess.
 *
 * Cubane, adamantane and cyclododecane are here as the three ways a ring
 * enumerator fails: it over-counts a cage, it counts the dependent envelope of
 * a bridged cage, and it does not reach a macrocycle at all. Pinning the ring
 * and pi halves separately — rather than only their sum — is what makes a
 * delocalised or ring-perception regression fail here instead of silently
 * cancelling out.
 */

import { expect, test } from 'vitest';

import { moleculeSmiles, readMolecule } from '../readMolecule.ts';
import { countIsExact, dbeFromStructure } from '../structure.ts';
import type { StructureDbe } from '../types.ts';

/** What the drawing counts, throwing when the text was not a molecule. */
function count(smiles: string): StructureDbe {
  const reading = readMolecule(smiles);
  if (!reading.ok) throw new Error(`${smiles}: ${reading.problem.message}`);
  return dbeFromStructure(reading.molecule);
}

/** The three numbers the structure panel prints, in the order it prints them. */
function split(smiles: string): readonly [string, number, number, number] {
  const structure = count(smiles);
  return [smiles, structure.rings, structure.piBonds, structure.dbe];
}

test('a ring and a pi bond are counted apart, then added', () => {
  const cases: ReadonlyArray<readonly [string, number, number, number]> = [
    ['c1ccccc1', 1, 3, 4],
    ['c1ccc2ccccc2c1', 2, 5, 7],
    ['c1ccc2cc3ccccc3cc2c1', 3, 7, 10],
    ['C1CCCCC1', 1, 0, 1],
    ['C1CC1', 1, 0, 1],
    ['CCCCCC', 0, 0, 0],
    ['CC(C)=O', 0, 1, 1],
    ['CC#N', 0, 2, 2],
    ['O=C1CCCCC1', 1, 1, 2],
    ['O=C=O', 0, 2, 2],
    ['CC(=O)Oc1ccccc1C(=O)O', 1, 5, 6],
    ['Cn1cnc2c1c(=O)n(C)c(=O)n2C', 2, 4, 6],
  ];
  for (const expected of cases) {
    expect(split(expected[0])).toStrictEqual(expected);
  }
});

test('a cage and a macrocycle are counted, where a ring enumerator is not', () => {
  // getRingSet().getSize() answers 22 for cubane and 4 for adamantane on this
  // build, and stops at its small-ring ceiling before a twelve-membered one.
  expect([
    split('C1(C2C3C41)C1C4C3C21'),
    split('C1C2CC3CC1CC(C2)C3'),
    split('C1CC2CCC1CC2'),
    split('C1CCCCCCCCCCC1'),
  ]).toStrictEqual([
    ['C1(C2C3C41)C1C4C3C21', 5, 0, 5],
    ['C1C2CC3CC1CC(C2)C3', 3, 0, 3],
    ['C1CC2CCC1CC2', 2, 0, 2],
    ['C1CCCCCCCCCCC1', 1, 0, 1],
  ]);
});

test('benzene is one ring and three pi bonds, never six of either', () => {
  const benzene = count('c1ccccc1');
  expect([
    benzene.atoms,
    benzene.bonds,
    benzene.fragments,
    benzene.rings,
    benzene.piBonds,
    benzene.dbe,
  ]).toStrictEqual([6, 6, 1, 1, 3, 4]);
  expect(
    benzene.multiple.map((bond) => [bond.order, bond.pi, bond.label]),
  ).toStrictEqual([
    [2, 1, 'C=C'],
    [2, 1, 'C=C'],
    [2, 1, 'C=C'],
  ]);
});

test('sulfur counts what it is drawn making, at two, three, four or six bonds', () => {
  expect([
    split('CSC'),
    split('c1ccsc1'),
    split('CS(C)=O'),
    split('C[S+](C)[O-]'),
    split('CS(C)(=O)=O'),
    split('CS(=O)(=O)O'),
    split('O=S=O'),
    split('FS(F)(F)(F)(F)F'),
  ]).toStrictEqual([
    ['CSC', 0, 0, 0],
    ['c1ccsc1', 1, 2, 3],
    ['CS(C)=O', 0, 1, 1],
    ['C[S+](C)[O-]', 0, 0, 0],
    ['CS(C)(=O)=O', 0, 2, 2],
    ['CS(=O)(=O)O', 0, 2, 2],
    ['O=S=O', 0, 2, 2],
    ['FS(F)(F)(F)(F)F', 0, 0, 0],
  ]);
});

test('phosphorus and nitro are drawn differently and count differently', () => {
  expect([
    split('CP(C)C'),
    split('COP(=O)(OC)OC'),
    split('OP(=O)(O)O'),
    split('O=[N+]([O-])c1ccccc1'),
    split('C[N+](=O)[O-]'),
  ]).toStrictEqual([
    ['CP(C)C', 0, 0, 0],
    ['COP(=O)(OC)OC', 0, 1, 1],
    ['OP(=O)(O)O', 0, 1, 1],
    ['O=[N+]([O-])c1ccccc1', 1, 4, 5],
    ['C[N+](=O)[O-]', 0, 1, 1],
  ]);
});

test('the sulfone names its own hypervalent sulfur', () => {
  const sulfone = count('CS(C)(=O)=O');
  expect(
    sulfone.expanded.map((atom) => [atom.symbol, atom.valence, atom.standard]),
  ).toStrictEqual([['S', 6, 2]]);

  const phosphate = count('COP(=O)(OC)OC');
  expect(
    phosphate.expanded.map((atom) => [
      atom.symbol,
      atom.valence,
      atom.standard,
    ]),
  ).toStrictEqual([['P', 5, 3]]);

  // A sulfonium keeps its octet: three bonds and a plus, so nothing expanded.
  expect(count('C[S+](C)[O-]').expanded).toStrictEqual([]);
  expect(count('c1ccsc1').expanded).toStrictEqual([]);
});

test('a charge is read off the drawing and changes no count', () => {
  const ammonium = count('[NH4+]');
  const acetate = count('CC(=O)[O-]');
  const cation = count('[CH3+]');
  expect([
    [ammonium.charge, ammonium.dbe],
    [acetate.charge, acetate.dbe],
    [cation.charge, cation.dbe],
  ]).toStrictEqual([
    [1, 0],
    [-1, 1],
    [1, 0],
  ]);
});

test('each fragment is worth a unit, so a salt counts nothing', () => {
  const salt = count('[Na+].[Cl-]');
  expect([salt.atoms, salt.bonds, salt.fragments, salt.dbe]).toStrictEqual([
    2, 0, 2, 0,
  ]);

  const hydrate = count('OCC1OC(O)C(O)C(O)C1O.O');
  expect([hydrate.fragments, hydrate.rings, hydrate.dbe]).toStrictEqual([
    2, 1, 1,
  ]);
});

test('explicit hydrogens and isotopes cancel, as implicit ones do', () => {
  expect([
    split('[2H]OC([2H])([2H])[2H]'),
    split('[2H]c1ccccc1'),
    split('CO'),
  ]).toStrictEqual([
    ['[2H]OC([2H])([2H])[2H]', 0, 0, 0],
    ['[2H]c1ccccc1', 1, 3, 4],
    ['CO', 0, 0, 0],
  ]);
});

test('a radical is flagged and still counted exactly', () => {
  const radical = count('[CH3]');
  expect([
    radical.dbe,
    radical.caveats.map((caveat) => caveat.kind),
  ]).toStrictEqual([0, ['radical']]);
  expect(radical.caveats[0]?.indices).toStrictEqual([0]);
  expect(countIsExact(radical)).toBe(true);
});

test('an R group stops the count rather than being read as an atom', () => {
  const molfile = [
    '',
    '  dbe test',
    '',
    '  2  1  0  0  0  0            999 V2000',
    '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
    '    1.2990    0.7500    0.0000 R1  0  0  0  0  0  0  0  0  0  0  0  0',
    '  1  2  1  0  0  0  0',
    'M  END',
  ].join('\n');
  const reading = readMolecule(molfile);
  if (!reading.ok) throw new Error('the molfile is readable');

  const structure = dbeFromStructure(reading.molecule);
  expect([
    reading.format,
    structure.caveats.map((caveat) => caveat.kind),
  ]).toStrictEqual(['molfile', ['rGroup']]);
  expect(structure.caveats[0]?.indices).toStrictEqual([1]);
  expect(countIsExact(structure)).toBe(false);
});

test('a query and an empty box are refused, each in its own words', () => {
  const empty = readMolecule(' ');
  const query = readMolecule('[CX3]');
  if (empty.ok || query.ok) throw new Error('neither is a molecule');
  expect([empty.problem.kind, query.problem.kind]).toStrictEqual([
    'empty',
    'query',
  ]);
  expect(empty.problem.message).toBe(
    'Draw a structure, or type one as SMILES.',
  );
});

test('an idCode is recognised as one, and nonsense is not', () => {
  const idCode = readMolecule('gFp@DiTt@@@');
  if (!idCode.ok) throw new Error('an idCode is readable');
  expect([idCode.format, dbeFromStructure(idCode.molecule).dbe]).toStrictEqual([
    'idcode',
    4,
  ]);
  // The aromatic form, which is what `toIsomericSmiles` writes and what a
  // teacher can read in a link. It parses back to the same count.
  expect(moleculeSmiles(idCode.molecule)).toBe('c1ccccc1');

  // fromIDCode never throws: handed nonsense it builds a molecule of nonsense,
  // so the text has to be written back out and compared.
  expect(readMolecule('notanidcode').ok).toBe(false);
});
