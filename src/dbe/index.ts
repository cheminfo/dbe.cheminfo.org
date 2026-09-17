/**
 * The pure domain, as everything outside it sees it.
 *
 * `structure.ts` and `readMolecule.ts` are deliberately **not** re-exported
 * here. They are the only two modules that import `openchemlib`, which is about
 * two megabytes; a page that only reads a formula — the exercises deck asking
 * for the DBE of `C9H8O4`, the printable reference — must never pull it into
 * its chunk. A page that genuinely draws a structure imports those two by their
 * own path and pays for them knowingly.
 *
 * `compare.ts` and `validate.ts` are safe to re-export because they take
 * {@link StructureDbe} *values* rather than a molecule: the counting has
 * already happened by the time they are called, so their openchemlib imports
 * are type-only and are erased.
 */

export type {
  DbeAnswer,
  DbeComparison,
  DbeExerciseKind,
  DbeExpectation,
  DbeTerm,
  ExpandedAtom,
  FormulaDbe,
  FormulaProblem,
  FormulaReading,
  MultipleBond,
  StructureCaveat,
  StructureDbe,
  StructureFormat,
  StructureProblem,
  ValenceChoices,
  ValenceOption,
} from './types.ts';

export { compareDbe, reconcilingValences } from './compare.ts';
export {
  formatDbe,
  formatHalf,
  formulaWorkingTeX,
  parseValences,
  romanValence,
  serializeValences,
  structureWorkingTeX,
} from './format.ts';
export type { FormulaDbeOptions } from './formula.ts';
export { dbeFromFormula, dbeOfFormula } from './formula.ts';
export type { RuleGroup, RuleSymbol, ValenceTerm } from './rule.ts';
export {
  GENERAL_RULE_TEX,
  OPEN_VALENCE_SYMBOLS,
  RULE_GROUPS,
  RULE_LEGEND,
  WRITTEN_RULE_TEX,
  contributionTex,
  valenceTerms,
} from './rule.ts';
export type { SeriesDirection, SeriesLevel, SeriesOptions } from './series.ts';
export {
  generateSeries,
  isSeriesExerciseId,
  seriesExerciseId,
} from './series.ts';
export type { ValencePreset } from './valences.ts';
export {
  DEFAULT_VALENCES,
  METAL_ELEMENTS,
  VALENCE_ELEMENTS,
  VALENCE_OPTIONS,
  VALENCE_PRESETS,
  ambiguousElements,
  isOfferedValence,
  metalsIn,
  presetOf,
  resolveValences,
} from './valences.ts';
export type { DbeCaseResult } from './validate.ts';
export { validateDbeAnswer } from './validate.ts';
