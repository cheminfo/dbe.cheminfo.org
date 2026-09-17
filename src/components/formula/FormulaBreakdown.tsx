/**
 * The working behind the formula's number: what every element contributes, and
 * what is done to the sum afterwards.
 *
 * The column is in **half-DBE units**, because that is where the rule is
 * legible — carbon pushes up by two, hydrogen pulls down by one, oxygen does
 * nothing at all — and halving at the end is one visible step rather than a
 * fraction on every line. The charge sits in the same column, and the two
 * closing rows do the halving and add the one unit each separate molecule
 * carries.
 */

import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import { formatDbe, formatHalf, romanValence } from '../../dbe/index.ts';
import type { FormulaDbe } from '../../dbe/types.ts';

/** What {@link FormulaBreakdown} needs. */
export interface FormulaBreakdownProps {
  /** The reading whose working is drawn. */
  readonly value: FormulaDbe;
}

/** One line of the table, with the sum as it stands after it. */
interface BreakdownRow {
  key: string;
  symbol: string | null;
  label: string | null;
  count: string;
  valence: string;
  each: string;
  adds: string;
  running: string;
  chosen: boolean;
}

/**
 * The per-element table.
 * @param props - See {@link FormulaBreakdownProps}.
 * @returns The contributions, the charge, and the two steps that close the sum.
 */
export function FormulaBreakdown(props: FormulaBreakdownProps): ReactElement {
  const { value } = props;
  const rows = breakdownRows(value);

  return (
    <table className="calc-table" data-testid="formula-breakdown">
      <caption className="calc-table__caption">
        Every count is in half-DBE units, so one ring or one pi bond is two.
      </caption>
      <thead>
        <tr>
          <th scope="col">Element</th>
          <th scope="col">Atoms</th>
          <th scope="col">Valence</th>
          <th scope="col">v − 2</th>
          <th scope="col">Adds</th>
          <th scope="col">Sum</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className={row.chosen ? 'is-chosen' : undefined}>
            <th scope="row">
              {row.symbol === null ? row.label : <MF mf={row.symbol} />}
            </th>
            <td>{row.count}</td>
            <td>{row.valence}</td>
            <td>{row.each}</td>
            <td>{row.adds}</td>
            <td>{row.running}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={5}>
            Half of the sum
          </th>
          <td>{formatDbe(value.half / 2)}</td>
        </tr>
        <tr>
          <th scope="row" colSpan={5}>
            One per separate part
          </th>
          <td>{formatHalf(value.fragments)}</td>
        </tr>
        <tr className="calc-table__answer">
          <th scope="row" colSpan={5}>
            Degree of unsaturation
          </th>
          <td>{formatDbe(value.dbe)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

/**
 * The element lines, then the charge when there is one, each carrying the sum
 * as it stands after it.
 * @param value - The reading being drawn.
 * @returns The rows, in the order the formula writes its elements.
 */
function breakdownRows(value: FormulaDbe): readonly BreakdownRow[] {
  const rows: BreakdownRow[] = [];
  let running = 0;
  for (const term of value.terms) {
    running += term.half;
    rows.push({
      key: term.symbol,
      symbol: term.symbol,
      label: null,
      count: String(term.count),
      valence: romanValence(term.valence),
      each: formatHalf(term.contribution),
      adds: formatHalf(term.half),
      running: formatHalf(running),
      chosen: term.chosen,
    });
  }
  if (value.charge !== 0) {
    running += value.chargeHalf;
    rows.push({
      key: 'charge',
      symbol: null,
      label: 'Charge',
      count: formatHalf(value.charge),
      valence: '',
      each: '',
      adds: formatHalf(value.chargeHalf),
      running: formatHalf(running),
      chosen: false,
    });
  }
  return rows;
}
