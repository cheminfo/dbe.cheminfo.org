/**
 * A problem set built from a seed, reproducibly.
 *
 * Two people opening `/exercises?seed=4271&count=8` get the same eight
 * questions in the same order, which is what lets a teacher hand a series out
 * as a link. `ml-xsadd` and nothing else does the drawing: a hand-rolled
 * generator is undocumented, untested, and silently changes its sequence the
 * day somebody improves it — and every link that pinned that seed then opens a
 * different problem set.
 *
 * **A generated question never traps the student.** A formula question is only
 * asked about a molecule whose formula, at the standard table, already agrees
 * with its drawing; sulfur and phosphorus at an expanded valence are asked
 * about their drawing instead. The disagreement is worth teaching, but it is
 * worth teaching with prose around it, which is what the curated deck and
 * `/learn` are for.
 */

import { XSadd } from 'ml-xsadd';
import type { ExerciseLevel } from 'react-cheminfo/core';

import type { DbeExercise } from '../data/exercises/types.ts';
import { MOLECULE_POOL } from '../data/molecules.ts';

import { dbeOfFormula } from './formula.ts';
import { formulaExerciseLevel } from './level.ts';
import { formulaQuestion, structureQuestion } from './question.ts';
import type { ValenceChoices } from './types.ts';

/** Which direction a generated series asks in. */
export type SeriesDirection = 'formula' | 'structure' | 'both';

/** Which difficulties it draws from. */
export type SeriesLevel = ExerciseLevel | 'mixed';

/** What a link has to carry for a series to be reproduced exactly. */
export interface SeriesOptions {
  /** The seed the link pins. Two links with one seed are one problem set. */
  seed: number;
  /** How many questions, already clamped by the caller. */
  count: number;
  /** Which difficulties to draw from. */
  level: SeriesLevel;
  /** Which kinds to draw from; `both` alternates formula and structure. */
  direction: SeriesDirection;
}

/** What a generated question needs of a molecule. */
export interface SeriesSource {
  /** Stable and URL-safe. */
  id: string;
  /** What it is called. */
  name: string;
  /** Its structure. */
  smiles: string;
  /** Its formula, in cheminfo notation. */
  mf: string;
  /** What its drawing counts. */
  dbe: number;
  /**
   * The valences at which the formula rule also gives {@link dbe}, for a
   * molecule that expands an octet.
   * @default undefined — the standard table already agrees with the drawing
   */
  valences?: ValenceChoices;
  /** How hard it is. */
  level: ExerciseLevel;
}

/**
 * Build a problem set from a seed.
 *
 * A level nothing in the pool matches is ignored rather than handing out an
 * empty page, and a count larger than the pool wraps round it, so the series
 * is always exactly as long as it was asked to be.
 * @param options - The seed, the length, the difficulty and the kinds.
 * @returns The questions, in the order the series hands them out.
 */
export function generateSeries(options: SeriesOptions): readonly DbeExercise[] {
  const wanted = Math.max(0, Math.trunc(options.count));
  const candidates = poolFor(options);
  if (wanted === 0 || candidates.length === 0) return [];

  const order = shuffled(candidates, options.seed);
  const series: DbeExercise[] = [];
  for (let position = 0; position < wanted; position++) {
    const entry = order[position % order.length] as SeriesSource;
    const id = seriesExerciseId(options.seed, position);
    const asFormula =
      options.direction === 'formula' ||
      (options.direction === 'both' && position % 2 === 0);
    series.push(
      asFormula && answerableOnPaper(entry)
        ? formulaQuestion(id, entry)
        : structureQuestion(id, entry),
    );
  }
  return series;
}

/**
 * The id a generated question takes, so `/exercises/s4271-3` deep-links into a
 * series and the progress store keeps the answer.
 *
 * The number written is the one on screen: the third question is `-3`, never
 * `-2`, because a link nobody can read is a link nobody hands out.
 * @param seed - The series seed.
 * @param position - Zero-based position in the series.
 * @returns The id, `s4271-3` for the third question of seed 4271.
 */
export function seriesExerciseId(seed: number, position: number): string {
  return `s${seed}-${position + 1}`;
}

/**
 * Whether an id names a question of a generated series rather than a curated one.
 * @param id - The id from the address.
 * @returns True when {@link seriesExerciseId} could have made it.
 */
export function isSeriesExerciseId(id: string): boolean {
  return /^s\d+-\d+$/.test(id);
}

/** Every pool entry a series with these options may draw. */
function poolFor(options: SeriesOptions): readonly SeriesSource[] {
  const pool: readonly SeriesSource[] = MOLECULE_POOL;
  const levelled = keep(pool, (entry) => fitsLevel(entry, options));
  const wide = levelled.length === 0 ? pool : levelled;
  if (options.direction !== 'formula') return wide;
  const paper = keep(wide, answerableOnPaper);
  return paper.length === 0 ? keep(pool, answerableOnPaper) : paper;
}

/**
 * Whether an entry is of the level this series asked for, in the direction it
 * will be asked in.
 *
 * A formula question is levelled by its **elements** — nitrogen and the
 * halogens one step up, sulfur and phosphorus another — because that is all
 * the student is shown; a drawing keeps the level written on the entry. A
 * series that asks both ways therefore needs both to agree, or a question
 * would carry a colour its own card contradicts.
 */
function fitsLevel(entry: SeriesSource, options: SeriesOptions): boolean {
  if (options.level === 'mixed') return true;
  const byFormula = formulaExerciseLevel(entry.mf) === options.level;
  const byDrawing = entry.level === options.level;
  if (options.direction === 'formula') return byFormula;
  if (options.direction === 'structure') return byDrawing;
  return byFormula && byDrawing;
}

/**
 * Whether a formula question about this molecule has an answer the student can
 * reach from what is shown.
 *
 * It is the hypervalent sulfur and phosphorus this sorts out. Their formula is
 * a lower bound at the standard table, so the question states the valence it
 * is asked at — `the S as S(VI)` — and is then answerable like any other; an
 * entry whose declared valences still miss its drawing is asked as a drawing
 * instead, because nothing written on the card would reach the number.
 */
function answerableOnPaper(entry: SeriesSource): boolean {
  return dbeOfFormula(entry.mf, { valences: entry.valences }) === entry.dbe;
}

/**
 * The pool in a seeded order.
 *
 * Fisher–Yates over a copy, drawing from `getUint32`, so the same seed always
 * produces the same order and the pool itself is never reordered.
 */
function shuffled(
  entries: readonly SeriesSource[],
  seed: number,
): readonly SeriesSource[] {
  const generator = new XSadd(seed);
  const order = entries.slice();
  for (let index = order.length - 1; index > 0; index--) {
    const swap = generator.getUint32() % (index + 1);
    const held = order[index] as SeriesSource;
    order[index] = order[swap] as SeriesSource;
    order[swap] = held;
  }
  return order;
}

function keep(
  entries: readonly SeriesSource[],
  wanted: (entry: SeriesSource) => boolean,
): readonly SeriesSource[] {
  const kept: SeriesSource[] = [];
  for (const entry of entries) {
    if (wanted(entry)) kept.push(entry);
  }
  return kept;
}
