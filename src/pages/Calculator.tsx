/**
 * The tool, at `/`: a formula on the left, a drawing on the right, and the
 * comparison between the two answers under them.
 *
 * Both directions are first class. A formula has to *assume* how many bonds
 * each of its atoms makes; a drawing states them. So the two halves are
 * independent inputs and neither derives the other — except that a drawing
 * produces a formula, which fills the box while nobody has typed in it. That is
 * what lets a student draw dimethyl sulfoxide and watch the formula half answer
 * 0 against the drawing's 1 without typing anything twice.
 */

import { effect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';
import type { StructureEditorChange } from 'react-cheminfo/structure';
import { PagePart } from 'react-cheminfo/ui';

import { AgreementCallout } from '../components/compare/AgreementCallout.tsx';
import { DbeReadout } from '../components/formula/DbeReadout.tsx';
import { FormulaBreakdown } from '../components/formula/FormulaBreakdown.tsx';
import { FormulaInput } from '../components/formula/FormulaInput.tsx';
import { ValencePicker } from '../components/formula/ValencePicker.tsx';
import { ExampleRow } from '../components/shared/ExampleRow.tsx';
import { StructureBreakdown } from '../components/structure/StructureBreakdown.tsx';
import { StructurePanel } from '../components/structure/StructurePanel.tsx';
import type { PoolEntry } from '../data/molecules.ts';
import { CALCULATOR_EXAMPLES } from '../data/molecules.ts';
import { compareDbe, dbeFromFormula } from '../dbe/index.ts';
import { readMolecule } from '../dbe/readMolecule.ts';
import { countIsExact, dbeFromStructure } from '../dbe/structure.ts';
import type { StructureDbe } from '../dbe/types.ts';
import {
  adoptStructureFormula,
  clearCalculator,
  loadStructure,
  resetValences,
  setEditorValue,
  setFormula,
  setStructure,
  setValence,
  setValences,
  state,
} from '../state/index.ts';

/**
 * The calculator.
 * @returns The two halves, their working, and the sentence comparing them.
 */
export function Calculator(): ReactElement {
  useSignals();
  const { calculator } = state.view;
  const formula = calculator.formula.value;
  const structureText = calculator.structure.value;
  const following = calculator.formulaSource.value === 'structure';
  const revision = calculator.editorRevision.value;
  const valences = state.view.valences.value;

  const reading = useMemo(
    () => dbeFromFormula(formula, { valences }),
    [formula, valences],
  );
  const drawing = useMemo(() => readDrawing(structureText), [structureText]);
  const comparison = useMemo(
    () =>
      reading.ok && drawing !== null
        ? compareDbe(reading.value, drawing)
        : null,
    [reading, drawing],
  );

  const drawnFormula = drawing?.mf ?? '';
  useFormulaFollowsDrawing();

  return (
    <>
      <PagePart part="intro">
        <header className="calc-intro">
          <div>
            <h1 className="calc-intro__title">
              Degree of unsaturation, both ways
            </h1>
            <p className="calc-intro__lead">
              Type a formula, draw a structure, and read the two answers against
              each other.
            </p>
          </div>
          <button
            type="button"
            className="chip chip--action"
            onClick={clearCalculator}
          >
            Clear both
          </button>
        </header>
      </PagePart>

      <div className="calc-grid">
        <section className="calc-pane">
          <PagePart part="formula">
            <FormulaInput
              value={formula}
              reading={reading}
              following={following}
              drawnFormula={drawnFormula}
              onChange={setFormula}
              onFollowDrawing={() => {
                adoptStructureFormula(drawnFormula);
              }}
            />
          </PagePart>

          <PagePart part="valences">
            <ValencePicker
              symbols={reading.ok ? reading.value.ambiguous : []}
              valences={valences}
              onChoose={setValence}
              onReset={resetValences}
            />
          </PagePart>

          <DbeReadout
            label="From the formula"
            testId="formula-dbe"
            source={
              reading.ok ? { kind: 'formula', value: reading.value } : null
            }
          />

          <PagePart part="breakdown">
            {reading.ok && <FormulaBreakdown value={reading.value} />}
          </PagePart>
        </section>

        <section className="calc-pane">
          <PagePart part="editor">
            <StructurePanel
              smiles={structureText}
              revision={revision}
              onDraw={handleDraw}
              onLoad={loadStructure}
            />
          </PagePart>

          {/* A drawing whose bonds could not all be added up prints the reason
              rather than a number, so the caveat under it is the answer. */}
          <DbeReadout
            label="From the drawing"
            testId="structure-dbe"
            tone="answer"
            source={
              drawing !== null && countIsExact(drawing)
                ? { kind: 'structure', value: drawing }
                : null
            }
          />

          <PagePart part="structure">
            {drawing !== null && <StructureBreakdown value={drawing} />}
          </PagePart>
        </section>
      </div>

      <PagePart part="compare">
        <AgreementCallout
          comparison={comparison}
          waiting={waitingSentence(reading.ok, drawing !== null)}
          onReconcile={setValences}
        />
      </PagePart>

      <PagePart part="examples">
        <ExampleRow entries={CALCULATOR_EXAMPLES} onPick={handlePick} />
      </PagePart>
    </>
  );
}

/**
 * Record a burst of strokes: the structure, and the notations the copy button
 * and the download hand out.
 * @param change - The canvas, read out at the moment it stopped moving.
 */
function handleDraw(change: StructureEditorChange): void {
  setStructure(change.smiles);
  setEditorValue(change.idCode, change.molfile);
}

/**
 * Put a worked example in both halves.
 *
 * It starts from the shared table, because half of the examples exist to show
 * that the shared table disagrees with the drawing.
 * @param entry - The molecule picked.
 */
function handlePick(entry: PoolEntry): void {
  resetValences();
  adoptStructureFormula(entry.mf);
  loadStructure(entry.smiles);
}

/**
 * Count whatever the structure half was given, however it was written.
 * @param text - The structure, as SMILES, a molfile or an idCode.
 * @returns What it counts, or `null` when there is nothing countable.
 */
function readDrawing(text: string): StructureDbe | null {
  if (text.trim() === '') return null;
  const reading = readMolecule(text);
  if (!reading.ok) return null;
  const counted = dbeFromStructure(reading.molecule);
  return counted.atoms === 0 ? null : counted;
}

/**
 * Fill the formula box from the drawing while nobody has typed in it.
 *
 * A shared link carries only `?smiles`, and reading the formula off it needs
 * the structure toolkit that `src/share` deliberately cannot import — so this
 * is where the box catches up with the canvas. It stops the moment a formula is
 * typed, because overwriting it would erase the very input the comparison is
 * about.
 */
function useFormulaFollowsDrawing(): void {
  useEffect(
    () =>
      effect(() => {
        const { formula, formulaSource, structure } = state.view.calculator;
        if (formulaSource.value !== 'structure') return;
        const mf = readDrawing(structure.value)?.mf ?? '';
        // `peek` rather than `.value`: the box is what this effect writes, so
        // subscribing to it would make each write its own next trigger.
        if (formula.peek() !== mf) adoptStructureFormula(mf);
      }),
    [],
  );
}

/** What the comparison says while one of the two halves is still empty. */
function waitingSentence(hasFormula: boolean, hasDrawing: boolean): string {
  if (hasFormula) return 'Draw a structure, and the two answers meet here.';
  if (hasDrawing) return 'Type a formula, and the two answers meet here.';
  return 'Type a formula and draw a structure: the two answers meet here.';
}
