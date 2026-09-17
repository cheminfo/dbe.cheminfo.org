/**
 * Whether the two halves agree, and — when they do not — which atom is
 * responsible.
 *
 * The sentence is the lesson and the button is only its demonstration: nothing
 * here quietly rewrites the formula's number to match the drawing's. A student
 * reads why a sulfoxide splits the two answers, then presses the button and
 * watches the split close.
 */

import { Button, Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { romanValence } from '../../dbe/index.ts';
import type { DbeComparison, ValenceChoices } from '../../dbe/types.ts';

/** What {@link AgreementCallout} needs. */
export interface AgreementCalloutProps {
  /** The two answers side by side, or `null` while one half is empty. */
  readonly comparison: DbeComparison | null;
  /** What to say while there is nothing to compare. */
  readonly waiting: string;
  /** Count the elements the way the drawing does. */
  readonly onReconcile: (choices: ValenceChoices) => void;
}

/**
 * The comparison between the two halves.
 * @param props - See {@link AgreementCalloutProps}.
 * @returns The sentence, and the button that closes the gap when one can.
 */
export function AgreementCallout(props: AgreementCalloutProps): ReactElement {
  const { comparison, waiting, onReconcile } = props;

  if (comparison === null) {
    return (
      <div className="calc-compare" data-testid="compare-callout">
        <Callout compact icon="comparison">
          {waiting}
        </Callout>
      </div>
    );
  }

  const { agree, explanation, reconciling } = comparison;
  const offer = agree || reconciling === null ? null : reconciling;

  return (
    <div className="calc-compare" data-testid="compare-callout">
      <Callout compact intent={agree ? 'success' : 'warning'}>
        {explanation}
        {offer !== null && (
          <div className="calc-compare__action">
            <Button
              variant="outlined"
              size="small"
              icon="refresh"
              onClick={() => {
                onReconcile(offer);
              }}
            >
              {reconcileLabel(offer)}
            </Button>
          </div>
        )}
      </Callout>
    </div>
  );
}

/**
 * What the button offers to do, named element by element.
 *
 * An empty set of choices means the *current* choices are what disagree with
 * the drawing, so the offer is to put them back rather than to expand anything.
 * @param choices - The valences that would make the two agree.
 * @returns The button's label.
 */
function reconcileLabel(choices: ValenceChoices): string {
  const symbols = Object.keys(choices);
  if (symbols.length === 0) return 'Count every element at the standard table';
  const named = symbols.map(
    (symbol) =>
      `the ${symbol} as ${symbol}(${romanValence(choices[symbol] as number)})`,
  );
  return `Count ${named.join(' and ')}`;
}
