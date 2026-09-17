/**
 * The worked molecules under the inputs.
 *
 * They are an argument rather than a sample. Read left to right they go from a
 * ring, to a fused pair, to a cage, to a molecule whose formula and drawing
 * agree — and then to three where they do not. Clicking through them is the
 * whole site in eight clicks.
 */

import { Tooltip } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import type { PoolEntry } from '../../data/molecules.ts';

/** What {@link ExampleRow} needs. */
export interface ExampleRowProps {
  /** The molecules offered, in the order they are read. */
  readonly entries: readonly PoolEntry[];
  /** Put one of them in both halves of the calculator. */
  readonly onPick: (entry: PoolEntry) => void;
}

/**
 * The row of examples.
 * @param props - See {@link ExampleRowProps}.
 * @returns One button per molecule, each carrying its name and its formula.
 */
export function ExampleRow(props: ExampleRowProps): ReactElement {
  const { entries, onPick } = props;

  return (
    <div className="example-row" data-testid="example-row">
      <span className="example-row__label">Try</span>
      {entries.map((entry) => (
        <Tooltip
          compact
          key={entry.id}
          content={entry.note}
          hoverOpenDelay={150}
        >
          <button
            type="button"
            className="example-row__item"
            onClick={() => {
              onPick(entry);
            }}
          >
            <span>{entry.name}</span>
            <span className="example-row__formula">
              <MF mf={entry.mf} />
            </span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
