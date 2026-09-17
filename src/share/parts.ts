/**
 * The regions of a page a shared link can leave out.
 *
 * A link on a course page is rarely the whole site: it is one figure, without
 * the chrome, and often without the panel a student would use to change what it
 * shows. `?embed` drops the header, its bar and the footer; `?hide=` names what
 * else to drop, and the share dialog only offers what the open page has.
 *
 * The parts are described in the family's own vocabulary, so `?hide=` is read
 * and written by `react-cheminfo` rather than by a second implementation here.
 */

import type { HideablePart } from 'react-cheminfo/core';

import type { TabId } from '../state/tabs.ts';

export { EMBED_PARAM, HIDE_PARAM } from 'react-cheminfo/core';

/** Every hideable region, in the order a link and the dialog list them. */
export const SHARE_PART_IDS = [
  'tabs',
  'intro',
  'formula',
  'breakdown',
  'valences',
  'editor',
  'structure',
  'compare',
  'examples',
  'steps',
  'text',
  'demos',
  'list',
  'series',
  'hints',
  'solution',
] as const;

/** One of {@link SHARE_PART_IDS}. */
export type SharePartId = (typeof SHARE_PART_IDS)[number];

/** The label and the one-line explanation the dialog shows for each part. */
export const SHARE_PARTS: Record<SharePartId, HideablePart> = {
  tabs: {
    key: 'tabs',
    label: 'Page bar',
    description: 'The pages of the site, on a page that keeps its header.',
    inHeader: true,
  },
  intro: {
    key: 'intro',
    label: 'Page heading',
    description: 'The title and the sentence under it saying what this is.',
    hiddenByDefault: true,
  },
  formula: {
    key: 'formula',
    label: 'Formula box',
    description: 'The box a formula is typed in; the link keeps its own.',
  },
  breakdown: {
    key: 'breakdown',
    label: 'Element breakdown',
    description: 'What each element contributes, leaving the number alone.',
  },
  valences: {
    key: 'valences',
    label: 'Valence chips',
    description: 'The S, P and N chips; the link keeps its own valences.',
  },
  editor: {
    key: 'editor',
    label: 'Structure editor',
    description: 'The drawing canvas, so the structure cannot be changed.',
  },
  structure: {
    key: 'structure',
    label: 'Structure readout',
    description: 'The rings, the pi bonds and the counts under the drawing.',
  },
  compare: {
    key: 'compare',
    label: 'Comparison',
    description: 'The line saying whether the two numbers agree, and why not.',
  },
  examples: {
    key: 'examples',
    label: 'Examples',
    description: 'The row of worked molecules under the inputs.',
    hiddenByDefault: true,
  },
  steps: {
    key: 'steps',
    label: 'Section picker',
    description: 'The numbered sections and the Previous/Next pager.',
  },
  text: {
    key: 'text',
    label: 'Section text',
    description: 'The prose of the section, leaving the calculator on its own.',
  },
  demos: {
    key: 'demos',
    label: 'Demo links',
    description: 'The buttons opening a section in the calculator.',
  },
  list: {
    key: 'list',
    label: 'Question list',
    description: 'The deck and the progress bar, leaving one question alone.',
  },
  series: {
    key: 'series',
    label: 'Series controls',
    description: 'The length, level, direction and seed of a generated set.',
    hiddenByDefault: true,
  },
  hints: {
    key: 'hints',
    label: 'Hints',
    description: 'The hint ladder under a question.',
  },
  solution: {
    key: 'solution',
    label: 'Solution',
    description: 'The button revealing the answer.',
  },
};

/**
 * What each page offers to hide. The header and the footer are not parts:
 * `?embed` drops them, and the page bar with them. The number itself is the
 * figure, so it is never a part.
 */
export const TAB_PARTS: Record<TabId, readonly SharePartId[]> = {
  calculator: [
    'tabs',
    'intro',
    'formula',
    'breakdown',
    'valences',
    'editor',
    'structure',
    'compare',
    'examples',
  ],
  learn: [
    'tabs',
    'formula',
    'breakdown',
    'valences',
    'editor',
    'structure',
    'compare',
    'steps',
    'text',
    'demos',
  ],
  exercises: ['tabs', 'list', 'series', 'hints', 'solution'],
  reference: ['tabs', 'intro'],
  about: ['tabs'],
};

/**
 * The parts a page can leave out.
 * @param tab - Page the link points at.
 * @returns Its part identifiers, in {@link SHARE_PART_IDS} order.
 */
export function partsOf(tab: TabId): readonly SharePartId[] {
  return TAB_PARTS[tab];
}
