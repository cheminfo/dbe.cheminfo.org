/**
 * The printable cheatsheet: five blocks a student takes into an exam room.
 *
 * Every number on it comes from `src/data/reference`, which a unit test
 * recomputes with `src/dbe`, so the sheet cannot contradict the tool. This
 * page only paints the blocks and keeps the chrome off the paper.
 */

import type { ReactElement } from 'react';
import { useMemo } from 'react';
import type { ExerciseLevel } from 'react-cheminfo/core';
import type { ReferenceSection } from 'react-cheminfo/ui';
import {
  PagePart,
  ReferenceGrid,
  TUTORIAL_LEVEL_COLOURS,
} from 'react-cheminfo/ui';

import { RuleCard } from '../components/reference/RuleCard.tsx';
import type { DbeReferenceSection } from '../data/reference.ts';
import { REFERENCE_ROW_COUNT, REFERENCE_SECTIONS } from '../data/reference.ts';

/** How narrow a column may get before it wraps to the next line, in pixels. */
const MIN_COLUMN = 300;

/** How wide the left column of every block is, so the blocks line up. */
const SYNTAX_WIDTH = 132;

/**
 * How much of the pale level colour survives once it is dark enough to read as
 * text. At 45 % the hue is still obvious and the contrast on white is past 6:1,
 * which a 13 px heading needs.
 */
const INK = 45;

/** What each coloured level covers on this sheet, for the printed line. */
const LEGEND: ReadonlyArray<{
  readonly level: ExerciseLevel;
  readonly label: string;
  readonly covers: string;
}> = [
  {
    level: 'beginner',
    label: 'Beginner',
    covers: 'what each element is worth',
  },
  {
    level: 'intermediate',
    label: 'Intermediate',
    covers: 'sulfur and phosphorus',
  },
  { level: 'advanced', label: 'Advanced', covers: 'shortcuts and traps' },
];

/**
 * The cheatsheet.
 * @returns The sheet, with its heading dropped from the printed page.
 */
export function Reference(): ReactElement {
  const sections = useMemo(() => colouredSections(REFERENCE_SECTIONS), []);

  return (
    <section className="sheet">
      <PagePart part="intro">
        <div className="sheet-head no-print">
          <div>
            <h1>DBE cheatsheet</h1>
            <p className="sheet-lead">
              {`What each element contributes, the sulfur and phosphorus rows the formula rule guesses at, and the traps. ${REFERENCE_SECTIONS.length} blocks, ${REFERENCE_ROW_COUNT} lines, one sheet of paper.`}
            </p>
          </div>
          <ul className="sheet-legend">
            {LEGEND.map((entry) => (
              <li key={entry.level} className="sheet-legend__item">
                <span
                  className="sheet-legend__swatch"
                  style={{ background: levelColour(entry.level) }}
                />
                {`${entry.label}: ${entry.covers}`}
              </li>
            ))}
          </ul>
        </div>
      </PagePart>

      <p className="sheet-print-line">
        {`dbe.cheminfo.org — ${LEGEND.map((entry) => `${entry.label}: ${entry.covers}`).join(' · ')}`}
      </p>

      <RuleCard />

      <div data-testid="reference-grid">
        <ReferenceGrid
          sections={sections}
          minColumnWidth={MIN_COLUMN}
          syntaxWidth={SYNTAX_WIDTH}
        />
      </div>
    </section>
  );
}

/**
 * The blocks, each carrying the colour of the level that taught it.
 * @param sections - From `REFERENCE_SECTIONS`.
 * @returns The same blocks, ready for `ReferenceGrid`.
 */
function colouredSections(
  sections: readonly DbeReferenceSection[],
): ReferenceSection[] {
  const coloured: ReferenceSection[] = [];
  for (const section of sections) {
    coloured.push({ ...section, color: levelColour(section.level) });
  }
  return coloured;
}

/**
 * The colour a heading of that level is set in.
 *
 * The family's level shades are made to sit *behind* a strip of buttons, so a
 * heading set in one is unreadable. Mixing towards black keeps the hue and
 * buys the contrast, and invents no fourth colour.
 * @param level - Which of the three.
 * @returns A CSS colour, ready for an inline style.
 */
function levelColour(level: ExerciseLevel): string {
  return `color-mix(in oklab, ${TUTORIAL_LEVEL_COLOURS[level].activeBackground} ${INK}%, black)`;
}
