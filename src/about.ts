/**
 * What this site says about itself, as the record the shared About page draws.
 *
 * Content only: the page, its sections and their order belong to
 * `react-cheminfo`, so a reader who has seen one About of the family knows
 * where the credits are on this one.
 */

import { BUILD_INFO } from 'react-cheminfo/build-info';
import type { AboutContent } from 'react-cheminfo/core';
import { PLATFORM_WORK, TEACHING_WORK } from 'react-cheminfo/core';

/** The record `/about` renders. */
export const ABOUT: AboutContent = {
  siteId: 'dbe',
  // Which release, built when, from which commit: the build says so,
  // because a version written by hand is wrong by the next release.
  build: BUILD_INFO,
  what: 'Read the degree of unsaturation of a molecule from its formula, from its structure, and see where the two disagree.',
  can: [
    'Type a formula and read its DBE, with every element’s contribution shown.',
    'Draw a structure and count its rings and pi bonds.',
    'Watch the two answers split on a sulfoxide, a sulfone or a phosphate.',
    'Work exercises in both directions, with hints and a checked answer.',
    'Hand out a seeded problem set as one link.',
    'Print the contribution table and the valence rules.',
  ],
  paragraphs: [
    'DBE counts rings and pi bonds together, so a formula of C9H8O4 reading 6 says aspirin carries a ring and two carbonyls before anything is drawn. It is the first number to take off a formula proposed by a mass spectrum, and the fastest check that a structure fits the formula it claims.',
    'The formula rule assumes every sulfur is divalent and every phosphorus trivalent. A sulfoxide, a sulfone, a sulfonamide and a phosphate all break that assumption, and the formula then reads one low per S=O and per P=O. Both numbers are shown here side by side rather than one of them chosen for you.',
  ],
  people: [{ name: 'Luc Patiny' }],
  providedBy: ['epfl'],
  credits: [
    'openchemlib',
    'openchemlib-utils',
    'mass-tools',
    'react-mf',
    'react-ocl',
    'ml-xsadd',
    'katex',
    'blueprint',
    'react',
    'vite',
    'react-cheminfo',
    'cheminfo-font',
  ],
  cite: [PLATFORM_WORK, TEACHING_WORK],
};
