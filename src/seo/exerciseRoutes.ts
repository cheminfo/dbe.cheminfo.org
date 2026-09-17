/**
 * The address each curated question answers on.
 *
 * A question is what a course links to, so each is a page with its own name and
 * its own sentence. A question of a *generated* series is not: its id only
 * means anything beside the seed that produced it, so `/exercises/s4271-3` is
 * indexed under the exercises page, which claims every address beneath it.
 */

import type { RouteMeta } from 'react-cheminfo/core';

import { describe, summarize } from './describe.ts';

/** What a route needs from one question of the deck. */
export interface ExerciseEntry {
  /** The id the address already carries: `/exercises/<id>`. */
  readonly id: string;
  /** The question's own name, as the list offers it. */
  readonly title: string;
  /** What it asks, `[[term]]` markers and all. */
  readonly description: string;
}

/** `/exercises/<id>` for every question, in the order the deck hands them out. */
export function exerciseRoutes(
  exercises: readonly ExerciseEntry[],
): readonly RouteMeta[] {
  return exercises.map((exercise, index) => ({
    path: `/exercises/${exercise.id}`,
    title: `${exercise.title} — exercise ${index + 1}`,
    description: describe(summarize(exercise.description), [
      [
        `Exercise ${index + 1} of ${exercises.length}, checked as you type, with hints and an answer you can reveal.`,
        `Exercise ${index + 1} of ${exercises.length}, checked as you type.`,
      ],
      ['Every case says what it got and what it expected.'],
    ]),
    short: exercise.title,
  }));
}
