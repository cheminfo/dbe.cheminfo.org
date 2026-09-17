/**
 * The drawing half's input: the canvas, and the box that takes a structure
 * written down.
 *
 * The canvas is the live input — every stroke is counted — while the box is
 * where a structure arrives from somewhere else: a SMILES out of a paper, a
 * molfile off a colleague, an idCode out of one of our own links. It commits on
 * Enter or on its button rather than on every keystroke, so a half-typed SMILES
 * never reseeds the canvas under the pen, and only the canonical SMILES is
 * stored — a molfile is thousands of characters and an address cannot carry it.
 */

import { Button, InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';
import type { StructureEditorChange } from 'react-cheminfo/structure';
import { StructureEditor } from 'react-cheminfo/structure';

import { moleculeSmiles, readMolecule } from '../../dbe/readMolecule.ts';
import type { StructureFormat } from '../../dbe/types.ts';

/** What {@link StructurePanel} needs. */
export interface StructurePanelProps {
  /** The structure on the canvas, as SMILES. */
  readonly smiles: string;
  /** Bumped to load {@link smiles} into the canvas again. */
  readonly revision: number;
  /** Called after every burst of strokes, with the drawing read out. */
  readonly onDraw: (change: StructureEditorChange) => void;
  /** Put a structure typed into the box on the canvas. */
  readonly onLoad: (smiles: string) => void;
}

/** What the line under the box says after a structure was written into it. */
interface BoxNote {
  text: string;
  bad: boolean;
}

/** How the notations read in the line under the box. */
const FORMAT_NAMES: Readonly<Record<StructureFormat, string>> = {
  smiles: 'SMILES',
  molfile: 'a molfile',
  idcode: 'an idCode',
};

/**
 * The canvas and the notation box.
 * @param props - See {@link StructurePanelProps}.
 * @returns The editor, the box, and the line saying how the box was read.
 */
export function StructurePanel(props: StructurePanelProps): ReactElement {
  const { smiles, revision, onDraw, onLoad } = props;
  const [draft, setDraft] = useState(smiles);
  const [shown, setShown] = useState(smiles);
  const [note, setNote] = useState<BoxNote | null>(null);

  // The canvas, a worked example and a shared link all write the structure;
  // when one of them does, the box shows what was written rather than what was
  // last typed into it.
  if (shown !== smiles) {
    setShown(smiles);
    setDraft(smiles);
    setNote(null);
  }

  function commit(): void {
    if (draft.trim() === '') {
      onLoad('');
      setNote(null);
      return;
    }
    const reading = readMolecule(draft);
    if (!reading.ok) {
      setNote({ text: reading.problem.message, bad: true });
      return;
    }
    setNote({ text: `Read as ${FORMAT_NAMES[reading.format]}.`, bad: false });
    onLoad(moleculeSmiles(reading.molecule));
  }

  return (
    <div className="calc-field">
      <span className="calc-field__label">Structure</span>
      <StructureEditor
        value={smiles}
        inputFormat="smiles"
        revision={revision}
        minHeight={280}
        onChange={onDraw}
      />
      <div className="calc-notation">
        <InputGroup
          data-testid="structure-input"
          value={draft}
          placeholder="CS(C)=O"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Structure as SMILES, a molfile or an idCode"
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
          }}
        />
        <Button variant="outlined" icon="arrow-right" onClick={commit}>
          Draw it
        </Button>
      </div>
      <span
        className={
          note?.bad === true
            ? 'calc-field__note calc-field__note--bad'
            : 'calc-field__note'
        }
      >
        {note?.text ?? 'A SMILES, a molfile or an idCode. Enter draws it.'}
      </span>
    </div>
  );
}
