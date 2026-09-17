/**
 * The short explanation, in reading order: ten sections in three coloured
 * strips.
 *
 * A section is addressed by its **id**, never by its number — `/learn/sulfur`
 * survives a section being inserted before it, and a link handed out in a
 * course outlives our editing.
 */

import type { ExerciseLevel } from 'react-cheminfo/core';

import { BASIC_SECTIONS } from './learn/basics.ts';
import { HETEROATOM_SECTIONS } from './learn/heteroatoms.ts';
import type { LearnSection } from './learn/types.ts';

export type { LearnPayload, LearnSection } from './learn/types.ts';

/** What each coloured strip is called. */
export const LEARN_LEVELS: Readonly<Record<ExerciseLevel, string>> = {
  beginner: 'What the number counts',
  intermediate: 'One element at a time',
  advanced: 'Where the formula lies',
};

/** Every section, in teaching order. */
export const LEARN_SECTIONS: readonly LearnSection[] = [
  ...BASIC_SECTIONS,
  ...HETEROATOM_SECTIONS,
];

/** Their ids, for the route table and the crawl path. */
export const LEARN_SECTION_IDS: readonly string[] = LEARN_SECTIONS.map(
  (section) => section.id,
);

const BY_ID = new Map(LEARN_SECTIONS.map((section) => [section.id, section]));

/**
 * The section an address names.
 * @param id - The id the address carries, or `null` for a bare `/learn`.
 * @returns The section, or the first one when the id names none — a link to a
 * section that has since been renamed opens the tour rather than an error.
 */
export function learnSectionById(id: string | null): LearnSection {
  const section = id === null ? undefined : BY_ID.get(id);
  return section ?? (LEARN_SECTIONS[0] as LearnSection);
}

/** The sections of one coloured strip. */
export function learnSectionsOfLevel(
  level: ExerciseLevel,
): readonly LearnSection[] {
  return LEARN_SECTIONS.filter((section) => section.level === level);
}

/** Where a section sits in the tour, from 0, or −1 when there is no such id. */
export function learnSectionIndex(id: string): number {
  return LEARN_SECTIONS.findIndex((section) => section.id === id);
}
