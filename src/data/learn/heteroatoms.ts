/**
 * Where the formula rule stops being right: sulfur, phosphorus, and the two
 * numbers a formula produces that are not counts of anything.
 *
 * These sections are the reason the site exists, so each one opens the
 * calculator on **both** halves at once — the formula on the left, the drawing
 * on the right — and leaves the valences at their defaults. A section that
 * opened with sulfur already set to four bonds would show two numbers
 * agreeing, which is exactly the lesson it is trying not to teach.
 */

import type { LearnSection } from './types.ts';

/** The sections about the valence the formula had to guess. */
export const HETEROATOM_SECTIONS: readonly LearnSection[] = [
  {
    id: 'sulfur',
    level: 'intermediate',
    title: 'Sulfur is II, IV or VI',
    mf: 'C2H6OS',
    smiles: 'CS(=O)C',
    summary:
      'Sulfur holds two bonds in a thioether, four in a sulfoxide and six in a sulfone, and a formula cannot say which: DMSO reads 0 and counts 1.',
    notice: 'Press S(IV) and the formula joins the drawing at 1.',
    description:
      'The table assumes sulfur holds two bonds, and in a [[thioether]] or in thiophene it does. A [[sulfoxide]] holds four and a [[sulfone]] holds six, and a formula cannot tell you which. Dimethyl sulfoxide C2H6OS reads 0 by the rule while the drawing beside it has one S=O and counts 1. Add the second oxygen to make the sulfone: the formula still reads 0 and the drawing counts 2.',
  },
  {
    id: 'phosphorus',
    level: 'intermediate',
    title: 'Phosphorus is III or V',
    mf: 'H3O4P',
    smiles: 'OP(=O)(O)O',
    summary:
      'Phosphorus holds three bonds in a phosphine and five in a phosphate, so phosphoric acid reads 0 and counts 1: one P=O the rule misses.',
    notice: 'Press P(V) and the formula joins the drawing at 1.',
    description:
      'The table assumes phosphorus holds three bonds, which is right for a [[phosphine]]. A [[phosphate]] or a phosphine oxide holds five, and each P=O is one unit the rule misses. Phosphoric acid H3O4P reads 0 and counts 1. Triphenylphosphine C18H15P reads 12 and counts 12, while its oxide C18H15OP still reads 12 and counts 13.',
  },
  {
    id: 'ylide',
    level: 'advanced',
    title: 'Both drawings are right',
    mf: 'C2H6OS',
    smiles: 'C[S+](C)[O-]',
    summary:
      'DMSO drawn as a charge-separated ylide counts 0 and the hypervalent drawing counts 1, and the formula rule answers the ylide question.',
    notice:
      'The same molecule as the sulfur section, drawn the other way, counting 0.',
    description:
      'Draw dimethyl sulfoxide as the [[ylide]] (CH3)2S⁺–O⁻ and sulfur makes three bonds, not four. Count it: no ring, no pi bond, so the drawing reads 0, and the formula rule reads 0 as well. The hypervalent drawing (CH3)2S=O counts 1, and it is equally right. A DBE counts the bonds a drawing draws, so a molecule with two accepted Lewis structures has two counts. S(II) is therefore not an approximation of anything — it is the ylide answer, written down.',
  },
  {
    id: 'impossible-numbers',
    level: 'advanced',
    title: 'When the number is impossible',
    mf: 'F6S',
    smiles: 'FS(F)(F)(F)(F)F',
    summary:
      'A negative DBE says a valence assumption is wrong and a half-integer says a charge is missing: SF6 reads −2 and counts 0.',
    notice:
      'Press S(VI) and the −2 becomes 0, which is what the drawing counts.',
    description:
      'A DBE below zero means a valence the rule assumed is not the one in the molecule. Sulfur hexafluoride F6S reads 0 − 3 + 1 = −2, and it has no ring and no pi bond. A half-integer means a [[charge]] or an odd electron count: the anilinium formula C6H8N read as a neutral gives 3.5, and writing it as C6H8N(+) brings it back to 4. Take both as a warning about the formula, not as a property of the molecule.',
  },
  {
    id: 'reading-a-formula',
    level: 'advanced',
    title: 'Reading a formula from a spectrum',
    mf: 'C9H8O4',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    summary:
      'A mass spectrum hands you a formula, and its DBE is the first check on any structure proposed for it: aspirin C9H8O4 reads 6.',
    notice:
      'Delete either C=O from the drawing and the two numbers part company.',
    description:
      'A mass spectrum gives you a formula, and the DBE is the first thing to take off it. Aspirin C9H8O4 reads 6: the [[aromatic ring|benzene ring]] is 4, and the ester and the acid [[carbonyl|C=O]] are one each. Any candidate structure that does not total 6 is the wrong structure. Edit the drawing until the two numbers agree.',
  },
];
