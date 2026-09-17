/**
 * Session data: what the canvas last produced, and whether the structure the
 * page was given could be read at all.
 *
 * Only what was *given* lives here, never what the count derives from it.
 * `dbeFromFormula` and `dbeFromStructure` are pure and run in well under a
 * frame, so each page derives them where it draws them and there is no second
 * copy to keep in step. Nothing here is persisted: a drawing comes back from
 * the address in milliseconds.
 */

import { signal } from '@preact/signals-react';

/** Where the structure half is in reading what it was given. */
export type ParseStatus = 'idle' | 'ready' | 'error';

/** The `data` bucket: plain object, signal leaves, never reassigned. */
export const data = {
  editor: {
    /** The idCode the canvas last produced, coordinates included. */
    idCode: signal(''),
    /** The molfile it last produced, for the copy button and the download. */
    molfile: signal(''),
  },
  parse: {
    status: signal<ParseStatus>('idle'),
    /** The sentence shown under the box when `status` is `error`. */
    error: signal<string | null>(null),
  },
};

/**
 * Record what the canvas produced.
 *
 * The address is not touched: what a link carries is the SMILES, which a
 * teacher has to be able to read and edit, and the idCode only ever describes
 * where the atoms were put on screen.
 * @param idCode - The idCode, coordinates included.
 * @param molfile - The same drawing as a molfile.
 */
export function setEditorValue(idCode: string, molfile: string): void {
  data.editor.idCode.value = idCode;
  data.editor.molfile.value = molfile;
}

/** Record that the structure the page was given was read. */
export function setParsed(): void {
  data.parse.status.value = 'ready';
  data.parse.error.value = null;
}

/**
 * Record that it was not, with the sentence to show.
 * @param message - What happened and what to do next, in a tutor's voice.
 */
export function failParse(message: string): void {
  data.parse.status.value = 'error';
  data.parse.error.value = message;
}

/** Forget the drawing and its readout. */
export function clearEditor(): void {
  data.editor.idCode.value = '';
  data.editor.molfile.value = '';
  data.parse.status.value = 'idle';
  data.parse.error.value = null;
}
