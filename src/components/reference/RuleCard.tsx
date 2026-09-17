/**
 * The rule itself, at the top of the printed sheet.
 *
 * The five blocks under it are what each element is worth; this is the
 * identity they are worth it *in*, written twice — once with every valence
 * left as a letter, once with the ones nobody chooses substituted. Sulfur and
 * phosphorus stay as `v` on purpose: that they have no single value is the
 * whole subject of the site, so the sheet states it as part of the rule rather
 * than as a footnote two blocks down.
 *
 * Nothing here is typed: `src/dbe/rule.ts` builds both formulas from the
 * valence table, and a unit test recomputes every coefficient.
 */

import { Card } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  GENERAL_RULE_TEX,
  OPEN_VALENCE_SYMBOLS,
  RULE_LEGEND,
  WRITTEN_RULE_TEX,
  valenceTerms,
} from '../../dbe/index.ts';
import { TeX } from '../shared/TeX.tsx';

/**
 * The rule, its legend, and what each open valence is worth.
 * @returns The block that opens the sheet.
 */
export function RuleCard(): ReactElement {
  return (
    <Card compact className="sheet-rule" data-testid="rule-card">
      <h2 className="sheet-rule__title">The rule</h2>
      <p className="sheet-rule__lead">
        <span>Every atom is worth </span>
        <TeX math={String.raw`\tfrac{v - 2}{2}`} />
        <span>. Only sulfur and phosphorus leave you a valence to choose.</span>
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

      <div className="sheet-rule__valences">
        {OPEN_VALENCE_SYMBOLS.map((symbol) => (
          <p key={symbol} className="sheet-rule__valence">
            {valenceTerms(symbol).map((term) => (
              <span key={term.label} className="sheet-rule__term">
                <span className="sheet-rule__term-label">{term.label}</span>
                <TeX math={term.tex} />
              </span>
            ))}
          </p>
        ))}
      </div>

      <p className="sheet-rule__note">
        Oxygen is divalent, so it is worth 0 and never appears. Selenium follows
        sulfur, arsenic phosphorus.
      </p>
    </Card>
  );
}
