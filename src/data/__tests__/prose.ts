/**
 * Every authored string, and how many sentences it holds.
 *
 * The marker test walks all of it, so a `[[term]]` written into a hint, a
 * cheatsheet row or a glossary summary is checked exactly as one written into
 * a learn section.
 */

import { EXERCISES } from '../exercises.ts';
import { GLOSSARY } from '../glossary.ts';
import { LEARN_SECTIONS } from '../learn.ts';
import { MOLECULE_POOL } from '../molecules.ts';
import { REFERENCE_SECTIONS } from '../reference.ts';

/** A period inside a formula or a number never ends a sentence. */
const SENTENCE = /[.!?](?:\s|$)/g;

/** Words that say nothing, and words that praise or scold. */
export const BANNED =
  /welcome to|powerful|comprehensive|seamless|intuitive|state-of-the-art|revolutionary|cutting-edge|feel free|please note|important to note|as you may know|great job|well done|congratul|unfortunately|sorry/i;

/** How many sentences a string holds. */
export function sentenceCount(text: string): number {
  return text.match(SENTENCE)?.length ?? 0;
}

/** Every authored string that may carry a marker, with where it came from. */
export function authoredProse(): ReadonlyArray<readonly [string, string]> {
  const prose: Array<readonly [string, string]> = [];
  for (const section of LEARN_SECTIONS) {
    prose.push(
      [section.id, section.description],
      [section.id, section.summary],
    );
    if (section.notice !== undefined) prose.push([section.id, section.notice]);
  }
  for (const exercise of EXERCISES) {
    prose.push([exercise.id, exercise.description]);
    for (const hint of exercise.hints) prose.push([exercise.id, hint]);
    prose.push([exercise.id, exercise.solution]);
  }
  for (const [term, entry] of Object.entries(GLOSSARY)) {
    prose.push([term, entry.summary]);
    for (const example of entry.examples) {
      if (example.note !== undefined) prose.push([term, example.note]);
    }
  }
  for (const section of REFERENCE_SECTIONS) {
    if (section.intro !== undefined) prose.push([section.id, section.intro]);
    for (const line of section.rows) prose.push([section.id, line.description]);
  }
  for (const entry of MOLECULE_POOL) prose.push([entry.id, entry.note]);
  return prose;
}
