/**
 * The exercises: the deck on the left, the open question on the right, in both
 * directions.
 *
 * The address carries the question's id, so `/exercises/mf-dmso` is what a
 * teacher hands out and what the back button returns to. An id nobody minted
 * opens the list rather than an error — a link from a course made two years
 * ago must still land somewhere useful.
 *
 * A pinned seed replaces the written deck with a generated one. Its questions
 * are addressed the same way and remembered under the same keys, so a series
 * handed out as a link behaves exactly like the deck it stands in for.
 */

import { Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { GlossaryProvider, PagePart, useIsHidden } from 'react-cheminfo/ui';

import { ExerciseCard } from '../components/exercises/ExerciseCard.tsx';
import { ExerciseList } from '../components/exercises/ExerciseList.tsx';
import { SeriesControls } from '../components/exercises/SeriesControls.tsx';
import { EXERCISES, exerciseById } from '../data/exercises.ts';
import { GLOSSARY } from '../data/glossary.ts';
import { generateSeries } from '../dbe/index.ts';
import { setActiveExercise, state } from '../state/index.ts';

/**
 * The exercises page.
 * @returns The deck, the generator and the open question.
 */
export function Exercises(): ReactElement {
  useSignals();
  const isHidden = useIsHidden();
  const { activeId, count, direction, level, seed } = state.view.exercises;
  const pinned = seed.value;
  const series = useMemo(
    () =>
      pinned === null
        ? null
        : generateSeries({
            seed: pinned,
            count: count.value,
            level: level.value,
            direction: direction.value,
          }),
    [pinned, count.value, level.value, direction.value],
  );
  const deck = series ?? EXERCISES;
  const open =
    activeId.value === null
      ? undefined
      : exerciseById(activeId.value, series ?? undefined);
  const aside = !isHidden('list') || !isHidden('series');

  return (
    <GlossaryProvider glossary={GLOSSARY}>
      <section className="exercises-layout">
        {aside && (
          <div className="exercises-sidebar">
            <PagePart part="series">
              <SeriesControls />
            </PagePart>
            <PagePart part="list">
              <ExerciseList
                exercises={deck}
                activeId={open?.id ?? null}
                onSelect={setActiveExercise}
              />
            </PagePart>
          </div>
        )}

        <div className="exercises-open">
          {open === undefined ? (
            <Callout
              intent="primary"
              icon="properties"
              title={isHidden('list') ? 'No question here' : 'Pick a question'}
            >
              {isHidden('list')
                ? 'This link names no question. A question is addressed by its id, after /exercises/.'
                : `${deck.length} questions in both directions: read the count off a formula, or off a drawing. Each is marked against what the site itself counts, so the working is the answer.`}
            </Callout>
          ) : (
            <ExerciseCard key={open.id} exercise={open} />
          )}
        </div>
      </section>
    </GlossaryProvider>
  );
}
