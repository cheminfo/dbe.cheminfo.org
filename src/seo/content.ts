/**
 * What each address says in the HTML the server hands out, above the crawl path.
 *
 * All 35 addresses used to ship the same body — this site's menu — so a crawler
 * was handed one text for the calculator, every walkthrough section and every
 * exercise. Read by the build and by nothing else: `vite.config.ts` calls it
 * once per route, so none of this reaches the bundle a browser downloads.
 *
 * A walkthrough section says what the section says, from the prose the page
 * renders. An exercise says what it asks and never the answer.
 */

import type { PageContent, RouteMeta } from 'react-cheminfo/core';
import { plainProse } from 'react-cheminfo/core';

import { EXERCISES } from '../data/exercises.ts';
import { LEARN_SECTIONS } from '../data/learn.ts';

/** The pages the header lists, each in its own words. */
const PAGES: Record<string, PageContent> = {
  '/': {
    heading: 'The degree of unsaturation of a molecular formula',
    paragraphs: [
      'Type a molecular formula and read its degree of unsaturation: how many rings and π bonds the formula allows, together, before a single structure is drawn. It is the first thing to compute from a formula and the fastest way to rule a structure out.',
      'The calculator shows the arithmetic rather than only the answer, so the halogens, the nitrogens and the charge each visibly do what they do to the count.',
    ],
  },
  '/learn': {
    heading: 'Where the number comes from, step by step',
    paragraphs: [
      'A walkthrough from one ring to a charged formula with nitrogen and halogens in it, with the calculator under every step so the sentence and the arithmetic are on the same screen.',
    ],
  },
  '/exercises': {
    heading: 'Work out the number, and be marked on it',
    paragraphs: [
      'Exercises in both directions: compute the degree of unsaturation of a formula, or propose a structure that matches one. Every answer is checked against the formula itself rather than a stored string.',
    ],
  },
  '/reference': {
    heading: 'The formula, and what each term does to it',
    paragraphs: [
      'One printable page: the equation, what each element contributes, how a charge and a nitrogen change it, and the cases that catch people out — a nitro group, an isocyanide, a formula with no carbon in it.',
    ],
  },
  '/about': {
    heading: 'What this tool computes, and what it does not',
    paragraphs: [
      'What the degree of unsaturation tells you and where it stops: it counts rings and π bonds together and can never say which, so two structures with the same number are not distinguished by it.',
    ],
  },
};

/**
 * What one address says for itself.
 *
 * Read by `cheminfoPrerender` once per route at build time.
 * @param route - The address being written.
 * @returns Its text — authored for a page the header lists, the section's or
 * exercise's own prose under `/learn` and `/exercises`, and otherwise the name
 * and sentence the route already carries.
 */
export function pageContent(route: RouteMeta): PageContent {
  const authored = PAGES[route.path];
  if (authored !== undefined) return authored;

  const section = learnContent(route.path);
  if (section !== undefined) return section;

  const exercise = exerciseContent(route.path);
  if (exercise !== undefined) return exercise;

  return { heading: route.title, paragraphs: [route.description] };
}

/** One section of the walkthrough, in the words it is written in. */
function learnContent(path: string): PageContent | undefined {
  const id = idUnder('/learn/', path);
  if (id === undefined) return undefined;
  const index = LEARN_SECTIONS.findIndex((section) => section.id === id);
  const section = LEARN_SECTIONS[index];
  if (section === undefined) return undefined;

  const paragraphs = [
    `Step ${index + 1} of ${LEARN_SECTIONS.length} of the walkthrough. ${plainProse(section.description)}`,
  ];
  if (section.mf !== undefined && section.mf !== '') {
    paragraphs.push(
      `It opens on ${section.mf}, with the calculator under it, so the arithmetic of this step is on screen while you read it.`,
    );
  }
  return { heading: section.title, paragraphs };
}

/** One exercise: what it asks, and how it is marked. Never the answer. */
function exerciseContent(path: string): PageContent | undefined {
  const id = idUnder('/exercises/', path);
  if (id === undefined) return undefined;
  const exercise = EXERCISES.find((candidate) => candidate.id === id);
  if (exercise === undefined) return undefined;

  const hints = exercise.hints.length;
  return {
    heading: exercise.title,
    paragraphs: [
      plainProse(exercise.description),
      `A ${exercise.level} exercise, marked against the formula itself rather than a stored answer${hints === 0 ? '.' : `, with ${hints} hint${hints === 1 ? '' : 's'} if you want them.`}`,
    ],
  };
}

/** The single segment under a section, or `undefined` for anything else. */
function idUnder(section: string, path: string): string | undefined {
  if (!path.startsWith(section)) return undefined;
  const rest = path.slice(section.length);
  return rest === '' || rest.includes('/') ? undefined : rest;
}
