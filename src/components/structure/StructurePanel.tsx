/**
 * The drawing half's input: the canvas.
 *
 * Nothing sits beside it to paste a structure into, because the canvas takes a
 * paste itself — click it and ⌘/Ctrl-V reads a molfile, a SMILES or an idCode
 * out of the clipboard. A structure that arrives from somewhere else — an
 * example, a shared link — is loaded through `revision`, and only the canonical
 * SMILES is stored: a molfile is thousands of characters and an address cannot
 * carry it.
 */

import type { ReactElement } from 'react';
import type { StructureEditorChange } from 'react-cheminfo/structure';
import { StructureEditor } from 'react-cheminfo/structure';

/** What {@link StructurePanel} needs. */
export interface StructurePanelProps {
  /** The structure on the canvas, as SMILES. */
  readonly smiles: string;
  /** Bumped to load {@link smiles} into the canvas again. */
  readonly revision: number;
  /** Called after every burst of strokes, with the drawing read out. */
  readonly onDraw: (change: StructureEditorChange) => void;
}

/**
 * The canvas.
 * @param props - See {@link StructurePanelProps}.
 * @returns The editor, under the label of the drawing half.
 */
export function StructurePanel(props: StructurePanelProps): ReactElement {
  const { smiles, revision, onDraw } = props;

  return (
    <div className="calc-field" data-testid="structure-panel">
      <span className="calc-field__label">Structure</span>
      <StructureEditor
        value={smiles}
        inputFormat="smiles"
        revision={revision}
        minHeight={280}
        onChange={onDraw}
      />
      <span className="calc-field__note">
        Draw a structure, or paste a SMILES, a molfile or an idCode onto the
        canvas.
      </span>
    </div>
  );
}
