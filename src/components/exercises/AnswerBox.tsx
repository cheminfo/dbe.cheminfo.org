/**
 * Where the student writes the count.
 *
 * One box on most questions, three on the ones that ask how the answer is
 * spent. The boxes take text rather than a number widget: a spinner invites
 * clicking upwards until the test goes green, and half an answer — `3.5`, what
 * a radical really counts — is a legitimate thing to type.
 */

import { InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { DbeAnswer } from '../../dbe/index.ts';

/** What {@link AnswerBox} needs. */
export interface AnswerBoxProps {
  /** What is written now. */
  readonly answer: DbeAnswer;
  /**
   * Whether the question also asks for the rings and the pi bonds.
   * @default false
   */
  readonly split?: boolean;
  /** Called with the whole answer whenever any box changes. */
  readonly onChange: (answer: DbeAnswer) => void;
}

/**
 * The answer fields.
 * @param props - See {@link AnswerBoxProps}.
 * @returns The boxes.
 */
export function AnswerBox(props: AnswerBoxProps): ReactElement {
  const { answer, split = false, onChange } = props;

  return (
    <div className="answer-box">
      <Field
        label="Degree of unsaturation"
        testId="answer-dbe"
        value={answer.dbe}
        onValueChange={(dbe) => {
          onChange({ ...answer, dbe });
        }}
      />
      {split && (
        <>
          <Field
            label="Rings"
            testId="answer-rings"
            value={answer.rings ?? ''}
            onValueChange={(rings) => {
              onChange({ ...answer, rings });
            }}
          />
          <Field
            label="Pi bonds"
            testId="answer-pi-bonds"
            value={answer.piBonds ?? ''}
            onValueChange={(piBonds) => {
              onChange({ ...answer, piBonds });
            }}
          />
        </>
      )}
    </div>
  );
}

interface FieldProps {
  readonly label: string;
  readonly testId: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

function Field(props: FieldProps): ReactElement {
  const { label, testId, value, onValueChange } = props;

  return (
    <label className="answer-box__field">
      <span className="answer-box__label">{label}</span>
      <InputGroup
        data-testid={testId}
        value={value}
        placeholder="0"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        onValueChange={onValueChange}
      />
    </label>
  );
}
