/**
 * The deck: how far the student has got, and every question with where they
 * stand on it.
 *
 * The hint count is shown rather than hidden. It is not a mark against
 * anybody — it is the honest record of which questions were hard, which is
 * what a student coming back a week later wants to know.
 */

import { Card, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { progressSummary } from 'react-cheminfo/core';
import {
  ExerciseLevelTag,
  ExerciseProgressHeader,
  ExerciseStatusIcon,
  useListKeyboardNavigation,
} from 'react-cheminfo/ui';

import type { DbeExercise } from '../../data/exercises.ts';
import { clearAllProgress, state } from '../../state/index.ts';

/** What {@link ExerciseList} needs. */
export interface ExerciseListProps {
  /** The deck on screen: the curated one, or a generated series. */
  readonly exercises: readonly DbeExercise[];
  /** The question that is open, or `null` for none. */
  readonly activeId: string | null;
  /** Called with the id of the question to open. */
  readonly onSelect: (id: string) => void;
}

/**
 * The progress bar and the list of questions.
 * @param props - See {@link ExerciseListProps}.
 * @returns The deck.
 */
export function ExerciseList(props: ExerciseListProps): ReactElement {
  useSignals();
  const { exercises, activeId, onSelect } = props;
  const records = state.preferences.exercises.progress.value;
  const summary = progressSummary(
    records,
    exercises.map((exercise) => exercise.id),
  );
  const activeIndex = exercises.findIndex(
    (exercise) => exercise.id === activeId,
  );
  const onKeyDown = useListKeyboardNavigation({
    length: exercises.length,
    selectedIndex: activeIndex,
    onSelect: (index) => {
      const next = exercises[index];
      if (next !== undefined) onSelect(next.id);
    },
  });

  return (
    <Card compact className="exercise-deck">
      <ExerciseProgressHeader
        summary={summary}
        clearDisabled={Object.keys(records).length === 0}
        clearWarning="This forgets every answer, every revealed hint and every solved question, on this browser. There is no undo."
        onClearAll={clearAllProgress}
      />

      <div
        className="exercise-deck__list"
        data-testid="exercise-list"
        tabIndex={0}
        role="listbox"
        aria-label="Questions"
        onKeyDown={onKeyDown}
      >
        {exercises.map((exercise) => {
          const progress = records[exercise.id];
          const status = progress?.status ?? 'idle';
          const hints = progress?.hintsRevealed ?? 0;
          const active = exercise.id === activeId;
          return (
            <button
              key={exercise.id}
              type="button"
              role="option"
              aria-selected={active}
              className={
                active
                  ? 'exercise-deck__item exercise-deck__item--active'
                  : 'exercise-deck__item'
              }
              onClick={() => {
                onSelect(exercise.id);
              }}
            >
              <ExerciseStatusIcon
                status={status}
                title={STATUS_TITLE[status]}
              />
              <span className="exercise-deck__title">{exercise.title}</span>
              {/*
                The tags travel together: left loose in the row, a long title
                strands the level tag at the right of one line and drops the
                kind tag onto the next.
              */}
              <span className="exercise-deck__tags">
                <ExerciseLevelTag level={exercise.level} active={active} />
                <Tag minimal round>
                  {exercise.kind === 'formula' ? 'Formula' : 'Structure'}
                </Tag>
                {status === 'solved' && hints > 0 && (
                  <Tag minimal round intent="success">
                    {`Solved with ${hints} hint${hints === 1 ? '' : 's'}`}
                  </Tag>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/** What the status icon says to a pointer and to a screen reader. */
const STATUS_TITLE = {
  idle: 'not started',
  attempted: 'handed in, not right yet',
  solved: 'right',
} as const;
