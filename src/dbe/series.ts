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

import type {
  DbeExercise,
  FormulaExercise,
  StructureExercise,
} from '../data/exercises/types.ts';
import { MOLECULE_POOL } from '../data/molecules.ts';

import { formatDbe } from './format.ts';
import { dbeOfFormula } from './formula.ts';

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
interface SeriesSource {
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
      asFormula && agreesOnPaper(entry)
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
  const levelled =
    options.level === 'mixed'
      ? pool
      : keep(pool, (entry) => entry.level === options.level);
  const wide = levelled.length === 0 ? pool : levelled;
  if (options.direction !== 'formula') return wide;
  const paper = keep(wide, agreesOnPaper);
  return paper.length === 0 ? keep(pool, agreesOnPaper) : paper;
}

/**
 * Whether the standard table already gives this molecule's drawn count.
 *
 * It is the hypervalent sulfur and phosphorus this sorts out: their formula is
 * a lower bound rather than an answer, so a generated question would be asking
 * for a number the student cannot reach from what is shown.
 */
function agreesOnPaper(entry: SeriesSource): boolean {
  return dbeOfFormula(entry.mf) === entry.dbe;
}

function formulaQuestion(id: string, entry: SeriesSource): FormulaExercise {
  return {
    id,
    kind: 'formula',
    title: `Read the formula ${entry.mf}`,
    level: entry.level,
    description: `Give the degree of unsaturation of ${entry.mf} from the formula alone. Open the structure once your answer is in and see how it was spent.`,
    hints: [
      'Oxygen adds nothing and a halogen counts exactly like a hydrogen, so strike those out first.',
      'Carbon adds 1, hydrogen takes away a half, nitrogen and phosphorus add a half — then add 1 for the molecule itself.',
    ],
    solution: `${entry.mf} counts ${formatDbe(entry.dbe)}, and the drawing behind it is ${entry.name}.`,
    mf: entry.mf,
    expected: { dbe: entry.dbe },
    smiles: entry.smiles,
  };
}

function structureQuestion(id: string, entry: SeriesSource): StructureExercise {
  const onPaper = dbeOfFormula(entry.mf);
  const disagrees =
    onPaper !== null && onPaper !== entry.dbe
      ? ` Its formula ${entry.mf} says ${formatDbe(onPaper)}, because the table counts every atom at its standard valence.`
      : '';
  return {
    id,
    kind: 'structure',
    title: `Count the drawing of ${entry.name}`,
    level: entry.level,
    description: `Count the rings and the pi bonds of this structure and give the total.`,
    hints: [
      'Count the rings first: a ring is worth exactly as much as a double bond.',
      'Then add 1 for every double bond and 2 for every triple bond.',
    ],
    solution: `${entry.name} counts ${formatDbe(entry.dbe)}.${disagrees}`,
    smiles: entry.smiles,
    name: entry.name,
    mf: entry.mf,
    expected: { dbe: entry.dbe },
  };
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
