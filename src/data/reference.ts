/**
 * The printable cheatsheet: five blocks, in the order they are taught.
 *
 * Students print this page and take it into an exam room, so every block is
 * short enough to read on paper and nothing on it needs a pointer. A block
 * carries its level rather than a colour, and the page paints it.
 */

import { CONTRIBUTION_SECTION } from './reference/contributions.ts';
import { PHOSPHORUS_SECTION, SULFUR_SECTION } from './reference/heteroatoms.ts';
import { SHORTCUT_SECTION, TRAP_SECTION } from './reference/practice.ts';
import type { DbeReferenceSection } from './reference/types.ts';

export type {
  DbeReferenceRow,
  DbeReferenceSection,
  ReferenceRow,
  ReferenceSection,
  RowCheck,
} from './reference/types.ts';

/** Every block of the cheatsheet, in reading order. */
export const REFERENCE_SECTIONS: readonly DbeReferenceSection[] = [
  CONTRIBUTION_SECTION,
  SULFUR_SECTION,
  PHOSPHORUS_SECTION,
  SHORTCUT_SECTION,
  TRAP_SECTION,
];

/** How many lines the whole sheet holds, for the page to say so. */
export const REFERENCE_ROW_COUNT: number = REFERENCE_SECTIONS.reduce(
  (total, section) => total + section.rows.length,
  0,
);
