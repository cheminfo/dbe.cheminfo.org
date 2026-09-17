/**
 * Ephemeral cross-component UI state: which page is open, what the calculator
 * is showing, where the reader is in the explanation, which question is open.
 *
 * Session-only. Everything in this file is mirrored into the address by
 * `src/share/route.ts`, and exercise *progress* lives in `preferences` because
 * it is the student's work, not a transient mode.
 */

import { signal } from '@preact/signals-react';

import type { ValenceChoices } from '../dbe/types.ts';
import type { SeriesDirection, SeriesLevel } from '../share/params.ts';
import type { SharePartId } from '../share/parts.ts';

import {
  COUNT_RANGE,
  MAX_MF_LENGTH,
  MAX_STRUCTURE_LENGTH,
  SEED_RANGE,
  clampToRange,
  cutToLength,
} from './ranges.ts';
import type { TabId } from './tabs.ts';
import { DEFAULT_TAB } from './tabs.ts';

/**
 * Where the formula box last got its value, which is what decides whether it
 * follows the drawing.
 *
 * The two halves of the calculator are independent inputs — no structure
 * follows from a formula — but a drawing does produce a formula, and filling
 * the box from it is what lets a student compare the two numbers without typing
 * anything twice. It stops the moment they type a formula of their own.
 */
export type FormulaSource = 'typed' | 'structure';

/** The `view` bucket: plain object, signal leaves, never reassigned. */
export const view = {
  activeTab: signal<TabId>(DEFAULT_TAB),
  learn: {
    /** `id` of the section on screen, or `null` for the first one. */
    sectionId: signal<string | null>(null),
  },
  exercises: {
    /** `id` of the question the Exercises page has open. */
    activeId: signal<string | null>(null),
    /**
     * The seed a link pins, or `null` for the curated deck. `0` is a seed like
     * any other, which is why the absence of one is `null` and not a number.
     */
    seed: signal<number | null>(null),
    /** How many questions a generated series holds. */
    count: signal(COUNT_RANGE.initial),
    /** Which difficulties it draws from. */
    level: signal<SeriesLevel>('mixed'),
    /** Which direction it asks in. */
    direction: signal<SeriesDirection>('both'),
  },
  calculator: {
    /** The formula, exactly as typed. */
    formula: signal(''),
    /** The structure, as SMILES. */
    structure: signal(''),
    /** Whether the formula box still follows the drawing. */
    formulaSource: signal<FormulaSource>('structure'),
    /**
     * Bumped to load {@link view.calculator.structure} into the canvas again —
     * a shared link, a worked example, Clear. Never bumped by the student's own
     * strokes: the editor is uncontrolled, and reseeding it on a stroke would
     * reset every coordinate under the pen.
     */
    editorRevision: signal(0),
  },
  /** The valence each element is counted at; `{}` is the shared table. */
  valences: signal<ValenceChoices>({}),
  /**
   * Regions the link asks the page to leave out, from `?hide=`. How the page is
   * being shown, not what the student did, so it is never persisted — an
   * embedded frame states it on every load.
   */
  hidden: signal<readonly SharePartId[]>([]),
  /**
   * Whether the link frames the page, from `?embed`: no header, no bar, no
   * footer. Never persisted, for the same reason as {@link view.hidden}.
   */
  embedded: signal(false),
};

/**
 * Open a page.
 * @param tab - Page to show.
 */
export function setActiveTab(tab: TabId): void {
  view.activeTab.value = tab;
}

/**
 * Open a section of the explanation, or the first one.
 * @param id - Section id, or `null` for the first section.
 */
export function setLearnSection(id: string | null): void {
  view.learn.sectionId.value = id;
}

/**
 * Open a question, or close the one that is open.
 * @param id - Question id, or `null` to show the list alone.
 */
export function setActiveExercise(id: string | null): void {
  view.exercises.activeId.value = id;
}

/**
 * Put a formula in the box, and stop it following the drawing.
 * @param mf - The formula, as typed; cut to what a link may carry.
 */
export function setFormula(mf: string): void {
  view.calculator.formula.value = cutToLength(mf, MAX_MF_LENGTH);
  view.calculator.formulaSource.value = 'typed';
}

/**
 * Record what is on the canvas, without reloading the canvas.
 *
 * This is what a stroke calls, so it never touches
 * {@link view.calculator.editorRevision}. The formula box is rewritten only
 * while it is following the drawing: once a student has typed a formula of
 * their own, the tool must not overwrite the very input the comparison is
 * about.
 * @param smiles - The structure; cut to what a link may carry.
 * @param mf - The formula read off it, when the caller has already read one.
 */
export function setStructure(smiles: string, mf?: string): void {
  view.calculator.structure.value = cutToLength(smiles, MAX_STRUCTURE_LENGTH);
  if (mf !== undefined && view.calculator.formulaSource.value === 'structure') {
    view.calculator.formula.value = cutToLength(mf, MAX_MF_LENGTH);
  }
}

/**
 * Copy the drawing's formula into the box and let it follow again.
 * @param mf - The formula read off the drawing.
 */
export function adoptStructureFormula(mf: string): void {
  view.calculator.formula.value = cutToLength(mf, MAX_MF_LENGTH);
  view.calculator.formulaSource.value = 'structure';
}

/**
 * Load a structure into the canvas as well as into the state: a shared link, a
 * worked example, a section's demo.
 * @param smiles - The structure.
 * @param mf - The formula read off it, when the caller has already read one.
 */
export function loadStructure(smiles: string, mf?: string): void {
  setStructure(smiles, mf);
  view.calculator.editorRevision.value += 1;
}

/** Empty both halves and reload the canvas. */
export function clearCalculator(): void {
  view.calculator.formula.value = '';
  view.calculator.structure.value = '';
  view.calculator.formulaSource.value = 'structure';
  view.calculator.editorRevision.value += 1;
}

/**
 * Count one element at another valence.
 * @param symbol - The element, as the formula writes it.
 * @param valence - How many bonds to count it as making.
 */
export function setValence(symbol: string, valence: number): void {
  view.valences.value = { ...view.valences.value, [symbol]: valence };
}

/**
 * Apply a whole set of choices: a preset, or what would reconcile a drawing.
 * @param choices - The valences to count at; `{}` is the shared table.
 */
export function setValences(choices: ValenceChoices): void {
  view.valences.value = choices;
}

/** Put every element back to the valence the shared table gives it. */
export function resetValences(): void {
  view.valences.value = {};
}

/**
 * Pin a seed, so the page hands out a generated series.
 * @param seed - The seed, clamped to what a link may carry, or `null` to show
 * the curated deck instead.
 */
export function setSeed(seed: number | null): void {
  view.exercises.seed.value =
    seed === null ? null : clampToRange(seed, SEED_RANGE);
}

/**
 * Set the length of the series.
 * @param count - How many questions, clamped to what the page can serve.
 */
export function setCount(count: number): void {
  view.exercises.count.value = clampToRange(count, COUNT_RANGE);
}

/**
 * Limit the series to one difficulty.
 * @param level - The difficulty, or `mixed` for all of them.
 */
export function setLevel(level: SeriesLevel): void {
  view.exercises.level.value = level;
}

/**
 * Limit the series to one direction.
 * @param direction - Read a formula, read a structure, or alternate.
 */
export function setDirection(direction: SeriesDirection): void {
  view.exercises.direction.value = direction;
}

/**
 * Leave out the parts a shared link named.
 * @param parts - Regions to drop; an empty list shows the whole page.
 */
export function setHiddenParts(parts: readonly SharePartId[]): void {
  view.hidden.value = parts;
}

/**
 * Frame the page without its chrome, or give the chrome back.
 * @param embedded - True to drop the header and the footer.
 */
export function setEmbedded(embedded: boolean): void {
  view.embedded.value = embedded;
}
