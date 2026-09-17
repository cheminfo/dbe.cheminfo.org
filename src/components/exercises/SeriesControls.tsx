/**
 * The generator a teacher hands out as one link.
 *
 * A seed, a length, a difficulty and a direction are the whole of it: two
 * people opening the same address get the same questions in the same order, so
 * a class can be given a problem set without a file, an account or a deadline.
 * The seed is written where it can be read out to a room.
 */

import { Button, Card, HTMLSelect, NumericInput } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { XSadd } from 'ml-xsadd';
import type { ReactElement } from 'react';

import type { SeriesDirection, SeriesLevel } from '../../share/params.ts';
import { SERIES_DIRECTIONS, SERIES_LEVELS } from '../../share/params.ts';
import {
  COUNT_RANGE,
  SEED_RANGE,
  setActiveExercise,
  setCount,
  setDirection,
  setLevel,
  setSeed,
  state,
} from '../../state/index.ts';

/** What each direction is called where it is picked. */
const DIRECTION_LABELS: Readonly<Record<SeriesDirection, string>> = {
  formula: 'From the formula',
  structure: 'From the drawing',
  both: 'Both, alternating',
};

/** What each difficulty is called where it is picked. */
const LEVEL_LABELS: Readonly<Record<SeriesLevel, string>> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  mixed: 'Every level',
};

/**
 * The series controls.
 * @returns The card, or nothing on a page that hides it.
 */
export function SeriesControls(): ReactElement {
  useSignals();
  const seed = state.view.exercises.seed.value;
  const count = state.view.exercises.count.value;
  const level = state.view.exercises.level.value;
  const direction = state.view.exercises.direction.value;

  return (
    <Card compact className="series no-print" data-testid="series-controls">
      <p className="series__lead">
        {seed === null
          ? 'Generate a set and hand out the address: the seed is in the link, so everybody gets the same questions.'
          : `Set ${seed}. The address carries it, so everybody opening this link gets these questions in this order.`}
      </p>

      <div className="series__row">
        <label className="series__field">
          <span className="series__label">Questions</span>
          <NumericInput
            value={count}
            min={COUNT_RANGE.minimum}
            max={COUNT_RANGE.maximum}
            clampValueOnBlur
            fill
            onValueChange={(value) => {
              setCount(value);
            }}
          />
        </label>

        <label className="series__field">
          <span className="series__label">Level</span>
          <HTMLSelect
            value={level}
            fill
            onChange={(event) => {
              setLevel(event.currentTarget.value as SeriesLevel);
            }}
          >
            {SERIES_LEVELS.map((option) => (
              <option key={option} value={option}>
                {LEVEL_LABELS[option]}
              </option>
            ))}
          </HTMLSelect>
        </label>

        <label className="series__field">
          <span className="series__label">Direction</span>
          <HTMLSelect
            value={direction}
            fill
            onChange={(event) => {
              setDirection(event.currentTarget.value as SeriesDirection);
            }}
          >
            {SERIES_DIRECTIONS.map((option) => (
              <option key={option} value={option}>
                {DIRECTION_LABELS[option]}
              </option>
            ))}
          </HTMLSelect>
        </label>

        <label className="series__field">
          <span className="series__label">Seed</span>
          <NumericInput
            value={seed ?? ''}
            min={SEED_RANGE.minimum}
            max={SEED_RANGE.maximum}
            clampValueOnBlur
            fill
            placeholder="none"
            onValueChange={(value) => {
              openSeries(value);
            }}
          />
        </label>
      </div>

      <div className="series__actions">
        <Button
          intent="primary"
          icon="random"
          text={seed === null ? 'Generate a set' : 'Reroll'}
          onClick={() => {
            openSeries(freshSeed());
          }}
        />
        {seed !== null && (
          <Button
            icon="book"
            text="Back to the written deck"
            onClick={() => {
              setSeed(null);
              setActiveExercise(null);
            }}
          />
        )}
      </div>
    </Card>
  );
}

/**
 * Hand out another set.
 *
 * The open question is closed with it: its id names a position in the set that
 * is being replaced, so leaving it open would show a question nobody can reach
 * from the list any more.
 * @param seed - The seed to pin.
 */
function openSeries(seed: number): void {
  setSeed(seed);
  setActiveExercise(null);
}

/**
 * A seed nobody chose.
 *
 * `ml-xsadd` unseeded, rather than `Math.random`, so the one generator the
 * site draws from is the one every link pins: a second source of randomness is
 * a second sequence to keep honest.
 * @returns A seed inside the range a link may carry.
 */
function freshSeed(): number {
  return new XSadd().getUint32() % (SEED_RANGE.maximum + 1);
}
