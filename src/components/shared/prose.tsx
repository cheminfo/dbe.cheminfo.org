/**
 * How this site draws the marks its prose is written with.
 *
 * A molecular formula in a sentence is written `{{C6H12O6}}` and is drawn by
 * `react-mf`, never as a line of digits: a subscript is what tells a reader
 * that the 6 belongs to the carbon rather than to the sentence. The whole site
 * reads them through one `GlossaryProvider`, so a step, a question, a hint, a
 * cheatsheet line and a definition all draw a formula the same way.
 */

import type { ReactNode } from 'react';
import type { GlossaryExample } from 'react-cheminfo/core';
import { Structure } from 'react-cheminfo/structure';
import { MF } from 'react-mf';

/**
 * One molecular formula of the prose.
 * @param mf - What was written between the braces.
 * @returns The formula, with its subscripts and its charge.
 */
export function renderMf(mf: string): ReactNode {
  return <MF mf={mf} />;
}

/**
 * One worked example of the glossary: the formula, then the drawing it is read
 * against.
 *
 * The structure is drawn, never written: a SMILES is a notation for software,
 * and a reader who has just been told what a ring is cannot see one in
 * `C1CCCCC1`.
 * @param example - The entry's example, `code` the formula and `input` the
 * SMILES of the structure behind it.
 * @returns The line the definition shows above the note.
 */
export function renderGlossaryExample(example: GlossaryExample): ReactNode {
  return (
    <span className="glossary-example">
      <MF mf={example.code} />
      {example.input !== undefined && (
        <span className="glossary-example__drawing">
          <Structure
            smiles={example.input}
            width={96}
            height={64}
            autoCropMargin={2}
          />
        </span>
      )}
    </span>
  );
}
