/**
 * The one big number, with the sum that produced it written under it.
 *
 * Both halves of the calculator print their answer through this component, so
 * the formula's number and the drawing's number are the same size in the same
 * place and can be read against each other in one glance — which is what the
 * page is for. Each half hands over the value the domain counted rather than a
 * number and a sentence, so the two are written the same way every time.
 *
 * The number is never rounded: `3.5` means an odd number of bonds, so a radical
 * or an impossible formula, and printing `4` would delete the one thing that
 * half was saying.
 */

import type { ReactElement } from 'react';

import {
  formatDbe,
  formulaWorkingTeX,
  structureWorkingTeX,
} from '../../dbe/index.ts';
import type { FormulaDbe, StructureDbe } from '../../dbe/types.ts';
import { TeX } from '../shared/TeX.tsx';

/** What one half counted, or `null` while it has nothing to say. */
export type DbeSource =
  | { kind: 'formula'; value: FormulaDbe }
  | { kind: 'structure'; value: StructureDbe }
  | null;

/** What {@link DbeReadout} needs. */
export interface DbeReadoutProps {
  /** Which half answered: `From the formula`, `From the drawing`. */
  readonly label: string;
  /** What that half counted. */
  readonly source: DbeSource;
  /** What the end-to-end tests read the number off. */
  readonly testId: string;
  /**
   * Which of the site's two colours the number takes: the leading one for the
   * formula, the answering one for the drawing. Two colours rather than one so
   * a glance tells which half is which before either number is read.
   * @default 'lead'
   */
  readonly tone?: 'lead' | 'answer';
}

/**
 * One half's answer.
 * @param props - See {@link DbeReadoutProps}.
 * @returns The caption, the number, and the sum under it.
 */
export function DbeReadout(props: DbeReadoutProps): ReactElement {
  const { label, source, testId, tone = 'lead' } = props;

  return (
    <div
      className={
        tone === 'answer' ? 'dbe-readout dbe-readout--answer' : 'dbe-readout'
      }
    >
      <span className="dbe-readout__label">{label}</span>
      <span className="dbe-readout__value" data-testid={testId}>
        {source === null ? '—' : formatDbe(source.value.dbe)}
      </span>
      {source !== null && (
        <TeX className="dbe-readout__working" math={workingTeX(source)} />
      )}
    </div>
  );
}

/**
 * How that half arrived at its number, as the expression a chemist would
 * write: `1\,\text{part} + \tfrac{1}{2}(6) = 4` from a formula,
 * `2\,\text{rings} + 5\,\pi\text{ bonds} = 7` from a drawing.
 */
function workingTeX(source: NonNullable<DbeSource>): string {
  return source.kind === 'structure'
    ? structureWorkingTeX(source.value)
    : formulaWorkingTeX(source.value);
}
