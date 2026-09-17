/**
 * How many bonds each element is counted as making, and which of those counts
 * a student is allowed to change.
 *
 * The table is written as **valences**, so the number in it is the one a
 * chemist says out loud. `chemical-elements`' `unsaturationsObject` is not
 * reused for three measured reasons: it fixes sulfur at 2 and phosphorus at 3
 * with no way to choose, which is the one thing this site exists to teach; it
 * gives calcium a valence of 0, so `CaCl2` reads −1 where the drawing reads 0;
 * and it has no B, Se or As, so boric acid, dimethyl selenoxide and
 * triphenylarsine all come back undefined.
 *
 * An element is listed only when its covalent bond count is a convention worth
 * assuming: a transition metal is absent on purpose, so the formula panel
 * refuses rather than guessing and the drawing answers instead.
 */

import type { ValenceChoices, ValenceOption } from './types.ts';

/**
 * The valence every element is counted at unless a choice says otherwise.
 *
 * Sulfur is 2 and phosphorus is 3 here — the assumption every tool makes
 * silently, and the one the site asks the student to question.
 */
export const DEFAULT_VALENCES: ValenceChoices = {
  H: 1,
  // mf-parser folds D and T into H, so these two are only reached by a caller
  // that parses a formula itself. They are hydrogen either way.
  D: 1,
  T: 1,
  B: 3,
  C: 4,
  N: 3,
  O: 2,
  F: 1,
  Si: 4,
  P: 3,
  S: 2,
  Cl: 1,
  Br: 1,
  I: 1,
  Se: 2,
  As: 3,
  Li: 1,
  Na: 1,
  K: 1,
  Ca: 2,
};

/**
 * The elements a link, a chip or an exercise may set a valence on.
 *
 * Sulfur and phosphorus first, because they are the cases a student meets;
 * selenium and arsenic repeat the same story one row down the table.
 *
 * Nitrogen is deliberately absent: it cannot expand its octet, so nitro never
 * disagrees with its formula and a switch offering N(V) would teach the
 * opposite of the lesson.
 */
export const VALENCE_ELEMENTS: readonly string[] = ['S', 'P', 'Se', 'As'];

/**
 * The elements whose formula almost always describes an ionic solid, so the
 * covalent assumption behind the whole rule is the wrong one. They keep a
 * valence — a salt written as one lump still has to produce a number — but a
 * page showing that number says what it assumed.
 */
export const METAL_ELEMENTS: readonly string[] = ['Li', 'Na', 'K', 'Ca'];

/**
 * `[valence, label, what is built at it, one formula that needs it]`.
 *
 * Which entry is the standard one is not written here: it is read back from
 * {@link DEFAULT_VALENCES}, so the table and the default cannot drift apart.
 */
const OPTION_TABLE: Readonly<
  Record<string, ReadonlyArray<readonly [number, string, string, string]>>
> = {
  S: [
    [2, 'S(II)', 'thioether, thiol, thiophene, thioketone', 'C2H6S'],
    [4, 'S(IV)', 'sulfoxide, sulfite, sulfur dioxide', 'C2H6OS'],
    [6, 'S(VI)', 'sulfone, sulfonic acid, sulfate', 'C2H6O2S'],
  ],
  P: [
    [3, 'P(III)', 'phosphine, phosphite', 'C18H15P'],
    [5, 'P(V)', 'phosphine oxide, phosphate, phosphonate', 'C18H15OP'],
  ],
  Se: [
    [2, 'Se(II)', 'selenide, selenol', 'C2H6Se'],
    [4, 'Se(IV)', 'selenoxide, selenite', 'C2H6OSe'],
    [6, 'Se(VI)', 'selenone, selenate', 'C2H6O2Se'],
  ],
  As: [
    [3, 'As(III)', 'arsine, arsenite', 'C18H15As'],
    [5, 'As(V)', 'arsine oxide, arsenate', 'C18H15OAs'],
  ],
};

/** Every valence each of {@link VALENCE_ELEMENTS} can be counted at. */
export const VALENCE_OPTIONS: Readonly<
  Record<string, readonly ValenceOption[]>
> = buildOptions();

/** A whole set of choices a link can ask for in one word. */
export interface ValencePreset {
  /** What the link and the chip call it. */
  id: 'table' | 'expanded';
  /** How the chip reads. */
  label: string;
  /** One line on what it assumes. */
  description: string;
  /** The choices it stands for. */
  choices: ValenceChoices;
}

/** The two presets, in the order the chips show them. */
export const VALENCE_PRESETS: readonly ValencePreset[] = [
  {
    id: 'table',
    label: 'Standard table',
    description:
      'Sulfur makes two bonds and phosphorus three, as oxygen and nitrogen do.',
    choices: {},
  },
  {
    id: 'expanded',
    label: 'Expanded octet',
    description:
      'Every element that can expand counted at its highest valence: sulfone, sulfonic acid, phosphate.',
    choices: { S: 6, P: 5, Se: 6, As: 5 },
  },
];

/**
 * The valence every element of a formula is counted at.
 *
 * A symbol the site offers no choice for keeps its default whatever the
 * choices say, and so does a valence the element does not have: a link written
 * before an option was renamed still opens on a number rather than on an error.
 * @param choices - What the link, the chips or the exercise asked for.
 * @returns The defaults with the usable choices laid over them.
 */
export function resolveValences(choices?: ValenceChoices): ValenceChoices {
  if (choices === undefined) return DEFAULT_VALENCES;
  const resolved: Record<string, number> = { ...DEFAULT_VALENCES };
  for (const symbol of VALENCE_ELEMENTS) {
    const wanted = choices[symbol];
    if (wanted !== undefined && isOfferedValence(symbol, wanted)) {
      resolved[symbol] = wanted;
    }
  }
  return resolved;
}

/**
 * The elements of a formula whose valence changes the answer.
 * @param atoms - Atom counts, as a formula reading holds them.
 * @returns Their symbols, in {@link VALENCE_ELEMENTS} order.
 */
export function ambiguousElements(
  atoms: Readonly<Record<string, number>>,
): readonly string[] {
  return presentIn(atoms, VALENCE_ELEMENTS);
}

/**
 * The metals a formula carries, so the page can say what it assumed.
 * @param atoms - Atom counts.
 * @returns Their symbols, in {@link METAL_ELEMENTS} order.
 */
export function metalsIn(
  atoms: Readonly<Record<string, number>>,
): readonly string[] {
  return presentIn(atoms, METAL_ELEMENTS);
}

/**
 * Which preset a set of choices is, when it is one.
 * @param choices - The choices in force.
 * @returns The preset's id, or `null` when the choices mix the two.
 */
export function presetOf(choices: ValenceChoices): ValencePreset['id'] | null {
  const resolved = resolveValences(choices);
  for (const preset of VALENCE_PRESETS) {
    if (sameValences(resolved, resolveValences(preset.choices))) {
      return preset.id;
    }
  }
  return null;
}

/**
 * Whether the site offers an element a given valence.
 * @param symbol - The element symbol.
 * @param valence - The valence asked for.
 * @returns True when that element is offered that valence.
 */
export function isOfferedValence(symbol: string, valence: number): boolean {
  const options = VALENCE_OPTIONS[symbol];
  if (options === undefined) return false;
  for (const option of options) {
    if (option.valence === valence) return true;
  }
  return false;
}

function buildOptions(): Record<string, readonly ValenceOption[]> {
  const built: Record<string, readonly ValenceOption[]> = {};
  for (const symbol of Object.keys(OPTION_TABLE)) {
    const rows = OPTION_TABLE[symbol] as ReadonlyArray<
      readonly [number, string, string, string]
    >;
    const options: ValenceOption[] = [];
    for (const [valence, label, seenIn, example] of rows) {
      options.push({
        valence,
        label,
        seenIn,
        example,
        standard: DEFAULT_VALENCES[symbol] === valence,
      });
    }
    built[symbol] = options;
  }
  return built;
}

function presentIn(
  atoms: Readonly<Record<string, number>>,
  symbols: readonly string[],
): readonly string[] {
  const found: string[] = [];
  for (const symbol of symbols) {
    const count = atoms[symbol];
    if (count !== undefined && count > 0) found.push(symbol);
  }
  return found;
}

function sameValences(left: ValenceChoices, right: ValenceChoices): boolean {
  for (const symbol of VALENCE_ELEMENTS) {
    if (left[symbol] !== right[symbol]) return false;
  }
  return true;
}
