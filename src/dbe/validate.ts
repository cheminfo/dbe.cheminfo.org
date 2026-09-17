/**
 * Marking an answer to one of the two questions the site asks.
 *
 * The expected number is never compared as a string: `4`, `4.0` and ` 4 ` are
 * one answer, and a student who typed `four` is told what a count looks like
 * rather than being marked wrong.
 *
 * Every failing case names the value and what was wanted — `you answered 3;
 * the drawing counts 4, which is 1 ring and 3 pi bonds` — because a student
 * staring at `incorrect` has learned nothing. The verdict comes back in the
 * family's own shape, so the shared `TestCaseList` and `ExerciseActions` draw
 * it with no adapter.
 *
 * A structure is marked from the values `dbeFromStructure` counted, never from
 * a molecule, which is what keeps openchemlib out of this module.
 */

import type { TestCaseResult, ValidationResult } from 'react-cheminfo/core';
import {
  failedValidation,
  finishValidation,
  pluralize,
} from 'react-cheminfo/core';

import { formatDbe } from './format.ts';
import type { DbeAnswer, DbeExerciseKind, DbeExpectation } from './types.ts';

/** One marked case, carrying what it was about. */
export interface DbeCaseResult extends TestCaseResult {
  /** What the case asked: `Degree of unsaturation`, `Rings`, `Pi bonds`. */
  label: string;
  /** The value that was wanted, written out. */
  expected: string;
}

/**
 * Mark an answer against the question.
 * @param kind - Which direction the question asks in, which is only ever used
 * to name what counts: a formula, or the drawing.
 * @param expectation - What the right answer is.
 * @param answer - What the student typed.
 * @returns The verdict, in the family's shape.
 */
export function validateDbeAnswer(
  kind: DbeExerciseKind,
  expectation: DbeExpectation,
  answer: DbeAnswer,
): ValidationResult<DbeCaseResult> {
  if (answer.dbe.trim() === '') {
    return failedValidation('Type the degree of unsaturation as a number.');
  }
  const given = readCount(answer.dbe);
  if (given === null) {
    return failedValidation(
      `"${answer.dbe.trim()}" is not a number. Answer with a count, such as 4 — or 3.5, which a radical really can be.`,
    );
  }

  const source = kind === 'structure' ? 'the drawing' : 'the formula';
  const cases: DbeCaseResult[] = [markTotal(source, expectation, given)];
  if (expectation.rings !== undefined) {
    cases.push(markPart('Rings', expectation.rings, answer.rings));
  }
  if (expectation.piBonds !== undefined) {
    cases.push(markPart('Pi bonds', expectation.piBonds, answer.piBonds));
  }
  return finishValidation(cases);
}

/**
 * The total, which every question asks for.
 *
 * A wrong total is told how the right one is spent, when the question knows:
 * `4` on its own teaches nothing, `1 ring and 3 pi bonds` teaches where it
 * came from.
 */
function markTotal(
  source: string,
  expectation: DbeExpectation,
  given: number,
): DbeCaseResult {
  const wanted = formatDbe(expectation.dbe);
  const passed = given === expectation.dbe;
  return {
    label: 'Degree of unsaturation',
    expected: wanted,
    passed,
    actual: formatDbe(given),
    reason: passed
      ? `${wanted}: right.`
      : `you answered ${formatDbe(given)}; ${source} counts ${wanted}${spentOn(expectation)}`,
  };
}

/** One half of a split answer: the rings, or the pi bonds. */
function markPart(
  label: string,
  expected: number,
  typed: string | undefined,
): DbeCaseResult {
  const wanted = formatDbe(expected);
  const text = typed?.trim() ?? '';
  if (text === '') {
    return {
      label,
      expected: wanted,
      passed: false,
      actual: null,
      reason: `not answered; ${label.toLowerCase()} count ${wanted}`,
    };
  }
  const given = readCount(text);
  if (given === null) {
    return {
      label,
      expected: wanted,
      passed: false,
      actual: text,
      reason: `"${text}" is not a number; ${label.toLowerCase()} count ${wanted}`,
    };
  }
  const passed = given === expected;
  return {
    label,
    expected: wanted,
    passed,
    actual: formatDbe(given),
    reason: passed
      ? `${wanted}: right.`
      : `you answered ${formatDbe(given)}; ${label.toLowerCase()} count ${wanted}`,
  };
}

/** How the answer is spent, when the question carries the split. */
function spentOn(expectation: DbeExpectation): string {
  const { rings, piBonds } = expectation;
  if (rings === undefined || piBonds === undefined) return '';
  return `, which is ${rings} ${pluralize(rings, 'ring')} and ${piBonds} ${pluralize(piBonds, 'pi bond')}`;
}

/**
 * A typed count, or `null` when it is not one.
 *
 * A half is accepted on purpose: a radical and an ion both produce one, and
 * refusing `3.5` would teach that the half is a mistake.
 */
function readCount(text: string): number | null {
  const trimmed = text.trim();
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}
