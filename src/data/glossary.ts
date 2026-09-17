/**
 * Every term a `[[marker]]` in the prose can name, keyed by the lowercased
 * text inside the brackets.
 *
 * An example is written `code` = the molecular formula, `input` = the SMILES
 * of the drawing it is read against, `note` = what the pair shows. Keeping
 * that order lets the page render the first with `react-mf` and the second as
 * a structure without inspecting either.
 *
 * The files are split by subject rather than by page: `[[sulfoxide]]` is
 * linked from a learn section, an exercise and a cheatsheet row alike.
 */

import type { Glossary } from 'react-cheminfo/core';

import { COUNTING_TERMS } from './glossary/counting.ts';
import { ELEMENT_TERMS } from './glossary/elements.ts';
import { HETEROATOM_TERMS } from './glossary/heteroatoms.ts';

export { COUNTING_TERMS } from './glossary/counting.ts';
export { ELEMENT_TERMS } from './glossary/elements.ts';
export { HETEROATOM_TERMS } from './glossary/heteroatoms.ts';

/** The glossary, merged in reading order. */
export const GLOSSARY: Glossary = {
  ...COUNTING_TERMS,
  ...ELEMENT_TERMS,
  ...HETEROATOM_TERMS,
};

/** Every term, in the order the glossary lists them. */
export const GLOSSARY_TERMS: readonly string[] = Object.keys(GLOSSARY);
