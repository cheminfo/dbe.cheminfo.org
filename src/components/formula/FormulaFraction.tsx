/**
 * The working behind the formula's number, as the one fraction the rule is.
 *
 * Everything above the bar is in **half-DBE units** — carbon pushes up by two
 * per atom, hydrogen pulls down by one, oxygen does nothing at all — so every
 * coefficient is a whole number and the halving is one visible step at the
 * end rather than a fraction on every term. The charge sits above the bar with
 * the rest, because it is already in those units.
 *
 * A sulfur or a phosphorus keeps every valence it could be counted at, the one
 * in force marked and the others struck out. A reader who only ever sees the
 * branch the tool took cannot see that there was a branch.
 */

import type { ReactElement } from 'react';
import { Fragment } from 'react';
import { pluralize } from 'react-cheminfo/core';

import type { FractionTerm } from '../../dbe/index.ts';
import { formatDbe, formulaFraction } from '../../dbe/index.ts';
import type { FormulaDbe } from '../../dbe/types.ts';
import { TeX } from '../shared/TeX.tsx';

/** What {@link FormulaFraction} needs. */
export interface FormulaFractionProps {
  /** The reading whose working is drawn. */
  readonly value: FormulaDbe;
}

/**
 * The fraction, with this formula's numbers in it.
 * @param props - See {@link FormulaFractionProps}.
 * @returns The fraction and the caption under it.
 */
export function FormulaFraction(props: FormulaFractionProps): ReactElement {
  const { value } = props;
  const fraction = formulaFraction(value);

  return (
    <figure className="calc-fraction" data-testid="formula-fraction">
      <div className="calc-fraction__sum">
        <TeX
          className="calc-fraction__lead"
          math={String.raw`\mathrm{DBE} =`}
        />

        <span className="calc-fraction__ratio">
          <span className="calc-fraction__numerator">
            {fraction.terms.map((term, index) => (
              <Fragment key={term.key}>
                {(index > 0 || term.sign === '-') && (
                  <span className={operatorClass(term)}>
                    {term.sign === '-' ? '−' : '+'}
                  </span>
                )}
                <span className={termClass(term)}>
                  <TeX className="calc-fraction__math" math={term.tex} />
                  <span className="calc-fraction__label calc-fraction__label--term">
                    {term.label}
                  </span>
                </span>
              </Fragment>
            ))}
          </span>
          <span className="calc-fraction__denominator">2</span>
        </span>

        <span className="calc-fraction__tail">
          <span className="calc-fraction__op">+</span>

          <span className="calc-fraction__term">
            <TeX
              className="calc-fraction__math"
              math={`${fraction.fragments}`}
            />
            <span className="calc-fraction__label">
              {pluralize(fraction.fragments, 'part')}
            </span>
          </span>

          <span className="calc-fraction__op">=</span>
          <span className="calc-fraction__answer">
            {formatDbe(fraction.dbe)}
          </span>
        </span>
      </div>

      <figcaption className="calc-fraction__caption">
        Above the bar everything is in half-DBE units, so every coefficient is a
        whole number and one ring or one pi bond is two.
        {fraction.terms.some((term) => !term.counted) &&
          ' A valence struck out is one this reading does not use.'}
      </figcaption>
    </figure>
  );
}

/** Which of the three tones a term is drawn in. */
function termClass(term: FractionTerm): string {
  if (!term.counted) return 'calc-fraction__term calc-fraction__term--unused';
  if (term.chosen) return 'calc-fraction__term calc-fraction__term--chosen';
  return 'calc-fraction__term';
}

/** The sign in front of a term, faint when the term is not counted. */
function operatorClass(term: FractionTerm): string {
  return term.counted
    ? 'calc-fraction__op'
    : 'calc-fraction__op calc-fraction__op--unused';
}
