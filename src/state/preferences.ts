/**
 * Everything the student chose that must survive a reload: which layers the
 * readout draws, and how far they got in the exercises.
 *
 * Two persisted buckets, two versioned keys — display settings are cheap and
 * change constantly, a student's work is precious and changes rarely, and a
 * corrupt payload in one must not take the other down with it.
 */

import type { Signal } from '@preact/signals-react';
import { signal } from '@preact/signals-react';
import type { ExerciseProgress, ExerciseStatus } from 'react-cheminfo/core';
import { emptyProgress } from 'react-cheminfo/core';

import type { DisplayFlagKey } from './displayFlags.ts';
import { DISPLAY_FLAGS } from './displayFlags.ts';
import { persistBucket } from './persist.ts';

/** How far a student got on one question, and what they left in the box. */
export type { ExerciseProgress, ExerciseStatus } from 'react-cheminfo/core';

const display = persistBucket('dbe:preferences', {
  /**
   * One signal per layer, so a chip re-renders only its own consumers. Built
   * from {@link DISPLAY_FLAGS} so the chips and the stored defaults cannot name
   * two different sets.
   */
  flags: defaultFlags(),
});

const exercises = persistBucket('dbe:exercises', {
  /**
   * Progress by question id, generated questions included: a link that pins a
   * seed hands out the same ids to everyone, so `s4271-3` is remembered exactly
   * like `mf-dmso`.
   */
  progress: signal<Record<string, ExerciseProgress>>({}),
});

/** The `preferences` bucket: plain object, signal leaves, never reassigned. */
export const preferences = { ...display, exercises };

/**
 * Flip one layer.
 * @param key - Layer to flip.
 */
export function toggleDisplayFlag(key: DisplayFlagKey): void {
  const flag = preferences.flags[key];
  flag.value = !flag.value;
}

/**
 * Force one layer, e.g. when a learn section or a shared link asks for it.
 * @param key - Layer to set.
 * @param value - Its new state.
 */
export function setDisplayFlag(key: DisplayFlagKey, value: boolean): void {
  preferences.flags[key].value = value;
}

/**
 * Read one question's progress, defaults included.
 *
 * Reads the signal, so a component calling it re-renders when progress moves.
 * @param id - Question id.
 * @returns Its progress, or a blank record when it has not been touched.
 */
export function getExerciseProgress(id: string): ExerciseProgress {
  return { ...emptyProgress(), ...preferences.exercises.progress.value[id] };
}

/**
 * Record an attempt or a success.
 * @param id - Question id.
 * @param status - New status.
 */
export function setExerciseStatus(id: string, status: ExerciseStatus): void {
  updateProgress(id, { status });
}

/**
 * Keep what the student typed, exactly as they left it, so a reload does not
 * throw their work away.
 * @param id - Question id.
 * @param answer - What is in the box.
 */
export function setExerciseAnswer(id: string, answer: string): void {
  updateProgress(id, { answer });
}

/**
 * Reveal the next hint of a question, one at a time.
 * @param id - Question id.
 * @param hintCount - How many hints it has, to stop at the last one.
 * Unbounded when omitted.
 */
export function revealNextHint(id: string, hintCount?: number): void {
  const revealed = getExerciseProgress(id).hintsRevealed + 1;
  updateProgress(id, {
    hintsRevealed:
      hintCount === undefined ? revealed : Math.min(revealed, hintCount),
  });
}

/**
 * Show or hide the worked answer.
 * @param id - Question id.
 * @param show - Whether the solution is on screen.
 */
export function setShowSolution(id: string, show: boolean): void {
  updateProgress(id, { showSolution: show });
}

/**
 * Forget one question: status, answer, hints and revealed solution.
 * @param id - Question id.
 */
export function resetExercise(id: string): void {
  const next: Record<string, ExerciseProgress> = {};
  for (const [key, value] of Object.entries(
    preferences.exercises.progress.value,
  )) {
    if (key !== id) next[key] = value;
  }
  preferences.exercises.progress.value = next;
}

/**
 * Forget every question. The UI puts this behind a confirmation dialog,
 * because it wipes a week of a student's work.
 */
export function clearAllProgress(): void {
  preferences.exercises.progress.value = {};
}

function updateProgress(id: string, patch: Partial<ExerciseProgress>): void {
  preferences.exercises.progress.value = {
    ...preferences.exercises.progress.value,
    [id]: { ...getExerciseProgress(id), ...patch },
  };
}

function defaultFlags(): Record<DisplayFlagKey, Signal<boolean>> {
  const flags: Partial<Record<DisplayFlagKey, Signal<boolean>>> = {};
  for (const meta of DISPLAY_FLAGS) {
    flags[meta.key] = signal(meta.initial);
  }
  return flags as Record<DisplayFlagKey, Signal<boolean>>;
}
