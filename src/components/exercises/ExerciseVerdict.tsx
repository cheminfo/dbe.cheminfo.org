/**
 * What the marking says, case by case.
 *
 * Before the answer is handed in the cases are drawn as not evaluated: an
 * untouched question is not a wrong one, and a column of red crosses on a
 * question nobody has read yet is what makes a student close the page. Once it
 * is, each case carries the marker's own sentence, which names the number that
 * was given and the one that was wanted.
 */

import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import type { ValidationResult } from 'react-cheminfo/core';
import { GlossaryText, TestCaseList } from 'react-cheminfo/ui';

import type { DbeCaseResult } from '../../dbe/index.ts';

/** What {@link ExerciseVerdict} needs. */
export interface ExerciseVerdictProps {
  /** What the marker returned for what is written now. */
  readonly result: ValidationResult<DbeCaseResult>;
  /** Whether the answer has been handed in at least once. */
  readonly attempted: boolean;
  /** Whether there is anything written to mark. */
  readonly blank: boolean;
  /** The worked answer, shown once every case passes. */
  readonly solution: string;
}

/**
 * The cases, and the one line over them.
 * @param props - See {@link ExerciseVerdictProps}.
 * @returns The verdict.
 */
export function ExerciseVerdict(props: ExerciseVerdictProps): ReactElement {
  const { result, attempted, blank, solution } = props;

  return (
    <div className="exercise-verdict">
      {result.error !== null && attempted && (
        <Callout intent="warning" icon="issue">
          {result.error}
        </Callout>
      )}

      {result.passed && !blank && (
        <Callout intent="success" icon="tick-circle">
          <GlossaryText text={solution} />
        </Callout>
      )}

      {attempted && !result.passed && result.error === null && (
        <Callout intent="danger" icon="cross-circle" title="Not yet">
          Each line below says what was counted and what was expected.
        </Callout>
      )}

      <TestCaseList
        results={result.cases}
        pending={blank || !attempted}
        label={(testCase: DbeCaseResult) => testCase.label}
      />
    </div>
  );
}
