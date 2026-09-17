/**
 * The address each section of the explanation answers on.
 *
 * Nine sections, nine pages: somebody searching for what a sulfoxide does to a
 * molecular formula has to land on the section about it rather than on the
 * index above it. The sentence is read off the section's own prose, so nine
 * pages are nine different pages to a crawler rather than one template
 * repeated.
 */

import type { RouteMeta } from 'react-cheminfo/core';

import { describe, summarize } from './describe.ts';

/** What a route needs from one section of the explanation. */
export interface LearnEntry {
  /** The id the address already carries: `/learn/<id>`. */
  readonly id: string;
  /** The section's own name, as the page heads it. */
  readonly title: string;
  /** Its prose, `[[term]]` markers and all. */
  readonly description: string;
  /**
   * A sentence written for a search result rather than for the page, when the
   * section has one to offer.
   * @default undefined — the section's own prose is cut down instead
   */
  readonly summary?: string;
}

/** `/learn/<id>` for every section, in the order the explanation reads them. */
export function learnRoutes(
  sections: readonly LearnEntry[],
): readonly RouteMeta[] {
  return sections.map((section, index) => ({
    path: `/learn/${section.id}`,
    // The section titles are sentences already, so a step number appended to
    // the longest of them would not fit in a search result: the description
    // says where in the walkthrough it is instead.
    title: section.title,
    description: describe(summarize(section.summary ?? section.description), [
      [
        `Step ${index + 1} of ${sections.length} of the DBE walkthrough, with the calculator under it.`,
        `Step ${index + 1} of ${sections.length} of the DBE walkthrough.`,
      ],
      ['Edit any of it and the number follows.'],
    ]),
    short: section.title,
  }));
}
