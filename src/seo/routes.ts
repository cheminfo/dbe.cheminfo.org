/**
 * Every address the site answers, with the name and the sentence it is indexed
 * under.
 *
 * One table, read by three things: the build, which writes an HTML file per
 * entry and the sitemap listing them; the head injector; and the running app,
 * which retitles the tab after an in-app move. A page missing from here is a
 * page a search engine only ever sees as the home page.
 *
 * The machinery that reads it is `react-cheminfo/core` and
 * `react-cheminfo/vite`; what belongs to this site is the prose below, and the
 * addresses composed from the explanation and the deck — a section on what a
 * sulfoxide does to a formula, and a question about it, are two things somebody
 * searches for by name.
 */

import type { RouteMeta } from 'react-cheminfo/core';

import { EXERCISES } from '../data/exercises.ts';
import { LEARN_SECTIONS } from '../data/learn.ts';

import { exerciseRoutes } from './exerciseRoutes.ts';
import { learnRoutes } from './learnRoutes.ts';

export type { ExerciseEntry } from './exerciseRoutes.ts';
export type { LearnEntry } from './learnRoutes.ts';

/**
 * The pages that exist whatever the data says: the calculator, the
 * explanation, the exercises, the reference and the About.
 *
 * They are also the crawl path — a menu names the exercises, not all twenty of
 * them — so each carries the label it is known by and a note saying what it is
 * for.
 */
export const FIXED_ROUTES: readonly RouteMeta[] = [
  {
    path: '/',
    title: 'Degree of unsaturation, from a formula or a structure',
    description:
      'Type a molecular formula or draw a structure and read its degree of unsaturation, with the contribution of every element shown.',
    short: 'Calculator',
    note: 'both directions, side by side',
  },
  {
    path: '/learn',
    title: 'How DBE is counted, in nine steps',
    description:
      'Rings plus pi bonds, element by element: what each atom contributes, and why a sulfoxide or a phosphate makes the formula read one too low.',
    short: 'Learn',
    note: 'nine steps you can edit',
    // A section id the walkthrough no longer has reads as the explanation
    // rather than as the home page, so a link from a slide of last year still
    // lands in the tour.
    prefix: true,
  },
  {
    path: '/exercises',
    title: 'DBE exercises, formula and structure',
    description:
      'Checked exercises in both directions: read a DBE off a formula, or count rings and pi bonds on a structure, with hints and a worked answer.',
    short: 'Exercises',
    note: 'checked, with hints and an answer',
    // A question of a generated series is addressed but never tabulated: its id
    // means nothing without the seed in the query, so it is indexed here.
    prefix: true,
  },
  {
    path: '/reference',
    title: 'DBE cheatsheet — contributions and valences',
    description:
      'A printable sheet: what each element contributes to the DBE, the sulfur II/IV/VI and phosphorus III/V rows, worked shortcuts and the usual traps.',
    short: 'Reference',
    note: 'printable, one page',
  },
  {
    path: '/about',
    title: 'About — what this tool counts and what it borrows',
    description:
      'What this tool counts from a formula and from a structure, where it stops, the libraries it borrows, how to cite it and where to report a problem.',
    short: 'About',
    note: 'what it counts, and what it borrows',
  },
];

/**
 * The addresses composed from the site's own content: one page per section of
 * the explanation, and one per curated question.
 *
 * A separate table, so composing them never touches the prose above.
 */
export const GENERATED_ROUTES: readonly RouteMeta[] = [
  ...learnRoutes(LEARN_SECTIONS),
  ...exerciseRoutes(EXERCISES),
];

/** Every routed address: the fixed pages, then everything composed from data. */
export const PAGE_ROUTES: readonly RouteMeta[] = [
  ...FIXED_ROUTES,
  ...GENERATED_ROUTES,
];

/**
 * The pages the crawl path lists, for a visitor or a crawler with no
 * JavaScript. A crawl path is a menu: it names the five pages, not every
 * section and question under two of them, which `sitemap.xml` carries instead.
 */
export const NOSCRIPT_ROUTES: readonly RouteMeta[] = FIXED_ROUTES;
