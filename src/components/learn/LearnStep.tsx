/**
 * One section of the explanation: what it says, what its molecules count, and
 * the button that carries them into the calculator.
 *
 * The numbers under the prose are counted live rather than written into the
 * content, so a section claiming a sulfoxide reads 0 and counts 1 is showing
 * the site's own two answers side by side. That disagreement is the subject,
 * which is why the sulfur, phosphorus and ylide sections open on both halves
 * at once.
 */

import { Button, Callout, Card, Tag } from '@blueprintjs/core';
import { batch } from '@preact/signals-react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { pluralize } from 'react-cheminfo/core';
import { Structure } from 'react-cheminfo/structure';
import { GlossaryText, InlineText, PagePart } from 'react-cheminfo/ui';
import { MF } from 'react-mf';

import type { LearnSection } from '../../data/learn.ts';
import type { FormulaReading, StructureDbe } from '../../dbe/index.ts';
import { compareDbe, dbeFromFormula, formatDbe } from '../../dbe/index.ts';
import { readMolecule } from '../../dbe/readMolecule.ts';
import { dbeFromStructure } from '../../dbe/structure.ts';
import {
  adoptStructureFormula,
  loadStructure,
  setActiveTab,
  setFormula,
  setValences,
} from '../../state/index.ts';

/** What {@link LearnStep} needs. */
export interface LearnStepProps {
  /** The section on screen. Give the step `key={section.id}`. */
  readonly section: LearnSection;
  /** Where it sits in the tour, counted from 1 as the strip numbers it. */
  readonly position: number;
  /** How many sections there are. */
  readonly total: number;
}

/**
 * The open section.
 * @param props - See {@link LearnStepProps}.
 * @returns The prose, the live numbers, and the way into the calculator.
 */
export function LearnStep(props: LearnStepProps): ReactElement {
  const { section, position, total } = props;
  const reading = useMemo(
    () =>
      section.mf === undefined
        ? null
        : dbeFromFormula(section.mf, { valences: section.valences }),
    [section],
  );
  const drawing = useMemo(() => countDrawing(section.smiles), [section]);
  const comparison = useMemo(
    () =>
      reading !== null && reading.ok && drawing !== null
        ? compareDbe(reading.value, drawing)
        : null,
    [reading, drawing],
  );

  return (
    <Card className="learn-step" data-testid="learn-step">
      <div className="learn-step__heading">
        <h1>{section.title}</h1>
        <Tag minimal round>{`Step ${position} of ${total}`}</Tag>
      </div>

      <PagePart part="text">
        <p className="learn-step__prose">
          <GlossaryText text={section.description} />
        </p>
      </PagePart>

      <div className="learn-readout">
        {reading !== null && section.mf !== undefined && (
          <PagePart part="formula">
            <div className="learn-readout__card">
              <span className="learn-readout__label">From the formula</span>
              <span className="learn-readout__subject">
                <MF mf={section.mf} />
              </span>
              <FormulaNumber reading={reading} />
            </div>
          </PagePart>
        )}

        {drawing !== null && section.smiles !== undefined && (
          <PagePart part="structure">
            <div className="learn-readout__card learn-readout__card--drawing">
              <span className="learn-readout__label">From the drawing</span>
              <Structure smiles={section.smiles} width={190} height={130} />
              <span
                className="learn-readout__number"
                data-testid="structure-dbe"
              >
                {formatDbe(drawing.dbe)}
              </span>
              <span className="learn-readout__detail">{spentOn(drawing)}</span>
            </div>
          </PagePart>
        )}
      </div>

      {comparison !== null && (
        <PagePart part="compare">
          <Callout
            data-testid="compare-callout"
            intent={comparison.agree ? 'success' : 'warning'}
            icon={comparison.agree ? 'tick-circle' : 'comparison'}
          >
            {comparison.explanation}
          </Callout>
        </PagePart>
      )}

      {section.notice !== undefined && (
        <p className="learn-step__notice">
          <InlineText text={section.notice} />
        </p>
      )}

      <PagePart part="demos">
        <Button
          className="no-print"
          icon="calculator"
          intent="primary"
          text="Open this in the calculator"
          onClick={() => {
            openInCalculator(section);
          }}
        />
      </PagePart>
    </Card>
  );
}

/** The formula's number, or the sentence saying why there is none. */
function FormulaNumber(props: {
  readonly reading: FormulaReading;
}): ReactElement {
  const { reading } = props;
  if (!reading.ok) {
    return (
      <span className="learn-readout__detail">{reading.problem.message}</span>
    );
  }
  return (
    <>
      <span className="learn-readout__number" data-testid="formula-dbe">
        {formatDbe(reading.value.dbe)}
      </span>
      <span className="learn-readout__detail">
        {reading.value.fragments === 1
          ? 'at the valences the table assumes'
          : `${reading.value.fragments} separate molecules, at the valences the table assumes`}
      </span>
    </>
  );
}

/** What a drawing counts, or `null` when the section draws nothing. */
function countDrawing(smiles: string | undefined): StructureDbe | null {
  if (smiles === undefined || smiles === '') return null;
  const read = readMolecule(smiles);
  return read.ok ? dbeFromStructure(read.molecule) : null;
}

/** How a drawing spends its answer, written out. */
function spentOn(drawing: StructureDbe): string {
  const { rings, piBonds } = drawing;
  return `${rings} ${pluralize(rings, 'ring')} and ${piBonds} ${pluralize(piBonds, 'pi bond')}`;
}

/**
 * Load the section's molecule into the calculator and go there.
 *
 * The formula is written after the drawing, so a section that names both ends
 * up comparing the formula it wrote with the drawing it drew rather than with
 * the formula read off that drawing.
 * @param section - The open section.
 */
function openInCalculator(section: LearnSection): void {
  batch(() => {
    setValences(section.valences ?? {});
    loadStructure(section.smiles ?? '');
    if (section.mf === undefined) {
      adoptStructureFormula('');
    } else {
      setFormula(section.mf);
    }
    setActiveTab('calculator');
  });
}
