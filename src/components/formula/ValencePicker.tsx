/**
 * The chips that say how many bonds sulfur and phosphorus are being counted at.
 *
 * They are not a preference. A formula names atoms and nothing else, so the
 * rule has to assume a Lewis structure before it can count anything, and
 * C2H6OS is dimethyl sulfoxide under one assumption and nothing at all under
 * another. The chips ask which structure is being counted, and only for the
 * elements the formula in the box actually carries — a row of sulfur chips over
 * a hydrocarbon would be a question about nothing.
 */

import { Tooltip } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { DEFAULT_VALENCES, VALENCE_OPTIONS } from '../../dbe/index.ts';
import type { ValenceChoices, ValenceOption } from '../../dbe/types.ts';

/** What {@link ValencePicker} needs. */
export interface ValencePickerProps {
  /** The elements of the formula whose valence changes the answer. */
  readonly symbols: readonly string[];
  /** The valence each element is counted at now. */
  readonly valences: ValenceChoices;
  /** Count one element at another valence. */
  readonly onChoose: (symbol: string, valence: number) => void;
  /** Put every element back to the valence the shared table gives it. */
  readonly onReset: () => void;
}

/**
 * The valence chips, or nothing when the formula raises no question.
 * @param props - See {@link ValencePickerProps}.
 * @returns One row of chips per element, with the question they answer.
 */
export function ValencePicker(props: ValencePickerProps): ReactElement | null {
  const { symbols, valences, onChoose, onReset } = props;
  if (symbols.length === 0) return null;

  const chosen = symbols.some(
    (symbol) =>
      valences[symbol] !== undefined &&
      valences[symbol] !== DEFAULT_VALENCES[symbol],
  );

  return (
    <div className="chip-bar">
      <div className="chip-bar__title">
        Which Lewis structure are you counting?
      </div>
      {symbols.map((symbol) => (
        <div className="chip-row" key={symbol}>
          <span className="chip-row__label">{symbol}</span>
          <div className="chip-row__chips">
            {(VALENCE_OPTIONS[symbol] ?? []).map((option) => (
              <ValenceChip
                key={option.valence}
                symbol={symbol}
                option={option}
                active={valenceOf(valences, symbol) === option.valence}
                onChoose={onChoose}
              />
            ))}
          </div>
        </div>
      ))}
      {chosen && (
        <button type="button" className="chip chip--action" onClick={onReset}>
          Back to the standard table
        </button>
      )}
    </div>
  );
}

function ValenceChip(props: {
  symbol: string;
  option: ValenceOption;
  active: boolean;
  onChoose: (symbol: string, valence: number) => void;
}): ReactElement {
  const { symbol, option, active, onChoose } = props;

  return (
    <Tooltip
      compact
      content={`${option.seenIn} — ${option.example}`}
      hoverOpenDelay={150}
    >
      <button
        type="button"
        className="chip"
        data-testid={`valence-chip-${symbol}${option.valence}`}
        aria-pressed={active}
        onClick={() => {
          onChoose(symbol, option.valence);
        }}
      >
        {option.label}
      </button>
    </Tooltip>
  );
}

/** The valence in force for one element: the choice, or the table's own. */
function valenceOf(
  valences: ValenceChoices,
  symbol: string,
): number | undefined {
  return valences[symbol] ?? DEFAULT_VALENCES[symbol];
}
