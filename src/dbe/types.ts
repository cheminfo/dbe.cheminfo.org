/**
 * What the two halves of this site hand each other.
 *
 * A degree of unsaturation is one identity read from two sides. Over a
 * molecular graph with `N` atoms, `S` bonds whose orders sum to `B`, and `F`
 * disconnected fragments:
 *
 * ```
 * rings = S − N + F        (the cyclomatic number)
 * π     = B − S
 * DBE   = rings + π = B − N + F
 * ```
 *
 * and since every bond of order `k` adds `k` to the valence of both its atoms,
 * `Σvᵢ = 2B`, so the same number is `F + ½·Σ(vᵢ − 2)`. The structure side reads
 * every `vᵢ` off the drawing; the formula side has to *assume* them. Sulfur and
 * phosphorus are where the assumption breaks, and that is the whole subject.
 *
 * No runtime code, no `openchemlib`: a page that only reads a formula must not
 * pull two megabytes of structure toolkit into its chunk.
 */

/** How many bonds an element is counted as making, keyed by element symbol. */
export type ValenceChoices = Readonly<Record<string, number>>;

/** One valence an element can legitimately be counted at. */
export interface ValenceOption {
  /** Bonds the element makes in this state — 6 for the sulfur of a sulfone. */
  valence: number;
  /** How a chemist writes it: `S(VI)`. */
  label: string;
  /** What is built at this valence: `sulfone, sulfonic acid, sulfate`. */
  seenIn: string;
  /** One formula that needs it: `C2H6O2S`. */
  example: string;
  /**
   * Whether this is the valence the family's shared table assumes — what
   * `chemical-elements`' `unsaturationsObject` encodes, and what every tool
   * that has not thought about sulfur silently uses.
   */
  standard: boolean;
}

/** One element's line in the breakdown the calculator draws. */
export interface DbeTerm {
  /** Element symbol, as the formula writes it. */
  symbol: string;
  /** How many of them the formula carries. */
  count: number;
  /** The valence this term is counted at. */
  valence: number;
  /** `valence − 2`: the contribution of one atom, in half-DBE units. */
  contribution: number;
  /** `count × contribution`, in half-DBE units. */
  half: number;
  /** `half / 2`: what this element adds to the answer. */
  dbe: number;
  /** Whether the valence differs from the one {@link ValenceOption.standard} marks. */
  chosen: boolean;
  /** The other valences it could be counted at; empty when it has none. */
  options: readonly ValenceOption[];
}

/** What a molecular formula says the degree of unsaturation is. */
export interface FormulaDbe {
  /** The formula as `mf-parser` canonicalises it. */
  mf: string;
  /** The formula exactly as it was typed, for echoing it back. */
  input: string;
  /** Atom counts, isotopes folded into their element. */
  atoms: Readonly<Record<string, number>>;
  /** Total charge the formula carries. */
  charge: number;
  /** Separate molecules the formula describes: `C6H12O6.H2O` is two. */
  fragments: number;
  /** One line per element, in the order the formula writes them. */
  terms: readonly DbeTerm[];
  /**
   * `+ charge`, in half-DBE units, written as its own row because an ion is
   * exactly where a student loses the thread.
   *
   * It is **plus** the charge, not minus. A main-group atom keeping its octet
   * makes one bond *more* per unit of positive charge — N⁺ makes four, O⁺
   * three, O⁻ one — so `Σvᵢ` shifts by `+q` and the answer by `q/2`. Checked
   * against the drawings: ammonium 0, acetate 1, methoxide 0.
   *
   * `mf-parser` subtracts it instead, and therefore disagrees with the drawn
   * structure for every full-octet ion (acetate 2, methoxide 1, `NH4+` −1).
   * This site prints both numbers on one page, so it cannot ship a
   * disagreement of its own making. `getInfo().unsaturation` is never read.
   */
  chargeHalf: number;
  /** `sum(terms.half) + chargeHalf`. */
  half: number;
  /** `fragments + half / 2` — the answer. */
  dbe: number;
  /**
   * Whether {@link dbe} is a whole number. A half means an odd number of
   * odd-valence atoms: a radical, or a formula that cannot exist.
   */
  whole: boolean;
  /** Elements whose valence changed the answer and had to be chosen: `['S']`. */
  ambiguous: readonly string[];
}

/** Why a formula could not be turned into a number. */
export interface FormulaProblem {
  /** Nothing typed, unreadable, or carrying an element with no known valence. */
  kind: 'empty' | 'syntax' | 'unsupported';
  /** What happened and what to do next. Two lines at most, no stack trace. */
  message: string;
  /** For `unsupported`: the symbols no valence is known for. */
  unknown: readonly string[];
}

/** Reading a formula: a number, or the reason there is none. */
export type FormulaReading =
  { ok: true; value: FormulaDbe } | { ok: false; problem: FormulaProblem };

/** One multiple bond of a drawing, as the readout lists it. */
export interface MultipleBond {
  /** openchemlib bond index. */
  bond: number;
  /** 2 or 3. */
  order: number;
  /** `order − 1`: what it adds to the count. */
  pi: number;
  /** How it reads: `C=O`, `C#N`. */
  label: string;
}

/** An atom drawn making more bonds than the shared table counts it at. */
export interface ExpandedAtom {
  /** openchemlib atom index. */
  atom: number;
  symbol: string;
  /** Bonds it actually makes in the drawing, implicit hydrogens included. */
  valence: number;
  /** The valence the shared table counts it at. */
  standard: number;
}

/**
 * Something about a drawing that makes its count a guess rather than a fact.
 *
 * Each is refused rather than papered over: a dative bond reads as order 0, a
 * bond left delocalised reads as order 1, and an R group has no valence at all.
 */
export interface StructureCaveat {
  kind: 'dative' | 'delocalized' | 'rGroup' | 'radical';
  /** What was found and why it stops the count, in a tutor's voice. */
  message: string;
  /** The atoms or bonds responsible, by openchemlib index. */
  indices: readonly number[];
}

/** What a drawing says the degree of unsaturation is. */
export interface StructureDbe {
  /** The molecular formula read off the drawing, in cheminfo notation. */
  mf: string;
  /**
   * Independent rings: `bonds − atoms + fragments`, the cyclomatic number.
   *
   * Never openchemlib's ring set, which enumerates cycles rather than a ring
   * basis: measured, `getRingSet().getSize()` returns 22 for cubane where the
   * answer is 5, and it stops counting above its small-ring ceiling, so a
   * macrocycle would read as acyclic.
   */
  rings: number;
  /** `Σ(order − 1)` over every bond of order two or more. */
  piBonds: number;
  /** `rings + piBonds` — the answer. */
  dbe: number;
  /** Every atom of the drawing, explicit hydrogens included. */
  atoms: number;
  /** Every bond of the drawing. */
  bonds: number;
  /** Disconnected pieces: a salt is two. */
  fragments: number;
  /** Sum of the formal charges drawn. */
  charge: number;
  /** The multiple bonds, for the readout and the highlight. */
  multiple: readonly MultipleBond[];
  /** The hypervalent atoms: the sulfur of a sulfone, the phosphorus of a phosphate. */
  expanded: readonly ExpandedAtom[];
  /** What makes this count untrustworthy, when anything does. */
  caveats: readonly StructureCaveat[];
}

/** Why a structure could not be read. */
export interface StructureProblem {
  /** Nothing drawn, unreadable text, or a query rather than a molecule. */
  kind: 'empty' | 'syntax' | 'query';
  message: string;
}

/** How a piece of structure text turned out to be written. */
export type StructureFormat = 'smiles' | 'molfile' | 'idcode';

/** The two answers side by side — the point of the whole site. */
export interface DbeComparison {
  /** What the formula says, at the valences in force. */
  formula: FormulaDbe;
  /** What the drawing says. */
  structure: StructureDbe;
  /** Whether the two describe the same molecule at all. */
  sameFormula: boolean;
  /** Whether the two numbers agree. */
  agree: boolean;
  /** `structure.dbe − formula.dbe`. */
  difference: number;
  /**
   * The valences that would make the formula agree with the drawing, or `null`
   * when no choice of valence can — a charge, or a different molecule.
   */
  reconciling: ValenceChoices | null;
  /**
   * One sentence naming what is responsible, in a tutor's voice: `the drawing
   * counts 1 and the formula 0, because the sulfur is drawn making 4 bonds and
   * the table counts it at 2`.
   */
  explanation: string;
}

/**
 * Which direction a question asks in.
 *
 * Two, because a DBE has two sides and the site teaches both. There is no
 * "draw a structure with this DBE" kind: it asks for a structure rather than
 * for a count, and grading it is a different subject.
 */
export type DbeExerciseKind = 'formula' | 'structure';

/** What the right answer is, and how much of it the question asks for. */
export interface DbeExpectation {
  /** The whole answer: rings plus pi bonds. */
  dbe: number;
  /**
   * How many independent rings, when the question asks for the split.
   * @default undefined — the question asks for the total alone
   */
  rings?: number;
  /**
   * How many pi bonds, when the question asks for the split.
   * @default undefined — the question asks for the total alone
   */
  piBonds?: number;
}

/** What the student typed, exactly as they left it. */
export interface DbeAnswer {
  /** The total, as typed; `''` before anything is typed. */
  dbe: string;
  /**
   * The rings box, on a question that asks for the split.
   * @default ''
   */
  rings?: string;
  /**
   * The pi-bonds box, on a question that asks for the split.
   * @default ''
   */
  piBonds?: string;
}
