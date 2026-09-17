/**
 * The box a molecular formula is typed in, with the line under it saying what
 * was read or why nothing was.
 *
 * The box is filled from the drawing while nobody has typed in it, and stops
 * following the moment somebody does — otherwise the tool would overwrite the
 * very input the comparison is about. When the two have parted, the line offers
 * the drawing's formula back rather than taking it silently.
 */

import { Button, InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import type { FormulaReading } from '../../dbe/types.ts';

/** What {@link FormulaInput} needs. */
export interface FormulaInputProps {
  /** What is in the box, exactly as typed. */
  readonly value: string;
  /** Called with the new text on every keystroke. */
  readonly onChange: (value: string) => void;
  /** What the domain made of it. */
  readonly reading: FormulaReading;
  /** Whether the box is still filled from the drawing. */
  readonly following: boolean;
  /** The formula the drawing has, `''` when nothing is drawn. */
  readonly drawnFormula: string;
  /** Fill the box from the drawing again, and let it follow. */
  readonly onFollowDrawing: () => void;
}

/**
 * The formula half's input.
 * @param props - See {@link FormulaInputProps}.
 * @returns The field, its echo of what was parsed, and its error line.
 */
export function FormulaInput(props: FormulaInputProps): ReactElement {
  const { value, onChange, reading, following, drawnFormula, onFollowDrawing } =
    props;
  const failed = !reading.ok && reading.problem.kind !== 'empty';
  const parted = !following && drawnFormula !== '' && drawnFormula !== value;

  return (
    <div className="calc-field">
      <label className="calc-field__label" htmlFor="dbe-formula">
        Molecular formula
      </label>
      <InputGroup
        id="dbe-formula"
        data-testid="formula-input"
        size="large"
        value={value}
        placeholder="C6H6"
        intent={failed ? 'danger' : 'none'}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        aria-label="Molecular formula"
        onValueChange={onChange}
      />
      {reading.ok ? (
        <span className="calc-field__note">
          Read as <MF mf={reading.value.mf} />
        </span>
      ) : (
        <span
          className={
            failed
              ? 'calc-field__note calc-field__note--bad'
              : 'calc-field__note'
          }
        >
          {reading.problem.message}
        </span>
      )}
      {parted && (
        <Button
          variant="minimal"
          size="small"
          icon="arrow-left"
          onClick={onFollowDrawing}
        >
          Take the drawing’s formula
        </Button>
      )}
    </div>
  );
}
