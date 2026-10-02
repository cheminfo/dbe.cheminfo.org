/**
 * What the marking says, case by case.
 *
 * Nothing is marked until the student hands the answer in. A question nobody
 * has read yet is not a wrong one, and an answer marked right as the last
 * digit lands tells the student the number before they have decided it is
 * theirs. Once it is handed in, each case carries the marker's own sentence,
 * which names the number that was given and the one that was wanted.
 */

import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import type { ValidationResult } from 'react-cheminfo/core';
import { GlossaryText, TestCaseList } from 'react-cheminfo/ui';

import type { DbeCaseResult } from '../../dbe/index.ts';

/** What {@link ExerciseVerdict} needs. */
export interface ExerciseVerdictProps {
  /** What the marker returned for the answer that was handed in. */
  readonly result: ValidationResult<DbeCaseResult>;
  /** Whether the answer on screen has been handed in. */
  readonly checked: boolean;
  /** The worked answer, shown once every case passes. */
  readonly solution: string;
}

/**
 * The cases, and the one line over them.
 * @param props - See {@link ExerciseVerdictProps}.
 * @returns The verdict.
 */
export function ExerciseVerdict(props: ExerciseVerdictProps): ReactElement {
  const { result, checked, solution } = props;

  return (
    <div className="exercise-verdict">
      {checked && result.error !== null && (
        <Callout intent="warning" icon="issue">
          {result.error}
        </Callout>
      )}

      {checked && result.passed && (
        <Callout intent="success" icon="tick-circle">
          <GlossaryText text={solution} />
        </Callout>
      )}

      {checked && !result.passed && result.error === null && (
        <Callout intent="danger" icon="cross-circle" title="Not yet">
          Each line below says what was counted and what was expected.
        </Callout>
      )}

      <TestCaseList
        results={result.cases}
        pending={!checked}
        label={(testCase: DbeCaseResult) => testCase.label}
      />
    </div>
  );
}
