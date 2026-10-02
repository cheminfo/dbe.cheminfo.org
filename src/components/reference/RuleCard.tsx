/**
 * The rule itself, at the top of the printed sheet.
 *
 * It is written twice: once compactly, as the sum a chemist states it as, and
 * once as one fraction with every possibility in it. The second is the one a
 * student copies out — every element the rule knows, including the ones worth
 * nothing, and each valence sulfur and phosphorus can be counted at, so the
 * reader can see that oxygen contributes 0 rather than guessing it was
 * forgotten.
 *
 * Nothing here is typed: `src/dbe/rule.ts` builds both formulas out of the
 * valence table, and a unit test recomputes every coefficient.
 */

import { Card } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  GENERAL_RULE_TEX,
  RULE_LEGEND,
  WRITTEN_RULE_TEX,
} from '../../dbe/index.ts';
import { TeX } from '../shared/TeX.tsx';

/**
 * The rule and its legend.
 * @returns The block that opens the sheet.
 */
export function RuleCard(): ReactElement {
  return (
    <Card compact className="sheet-rule" data-testid="rule-card">
      <h2 className="sheet-rule__title">The rule</h2>
      <p className="sheet-rule__lead">
        <span>Every atom adds </span>
        <TeX math={'v - 2'} />
        <span>
          {
            ' above the bar, so the halving happens once, at the end. Only sulfur and phosphorus leave you a valence to choose.'
          }
        </span>
      </p>

      <TeX className="sheet-rule__display" math={GENERAL_RULE_TEX} />
      <TeX className="sheet-rule__display" math={WRITTEN_RULE_TEX} />

      <ul className="sheet-rule__legend">
        {RULE_LEGEND.map((entry) => (
          <li key={entry.tex} className="sheet-rule__legend-item">
            <TeX math={entry.tex} />
            <span>{entry.meaning}</span>
          </li>
        ))}
      </ul>

      <p className="sheet-rule__note">
        Each sulfur is counted once, in whichever of the three terms you put it.
        Oxygen is divalent, so its coefficient is 0 and counting it changes
        nothing. Selenium follows sulfur, arsenic phosphorus.
      </p>
    </Card>
  );
}
