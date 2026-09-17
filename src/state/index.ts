/**
 * The one global state of the app: `view`, `data`, `preferences`.
 *
 * Components read leaves directly — `state.preferences.flags.breakdown.value` —
 * after calling `useSignals()`, and call the actions re-exported here. The
 * state is never passed as a prop.
 */

import { data } from './data.ts';
import { preferences } from './preferences.ts';
import { view } from './view.ts';

/** One state, three first-level buckets. Built once, never reassigned. */
export const state = { view, data, preferences };

export type { ParseStatus } from './data.ts';
export { clearEditor, failParse, setEditorValue, setParsed } from './data.ts';
export type { DisplayFlagKey, DisplayFlagMeta } from './displayFlags.ts';
export {
  DISPLAY_FLAGS,
  DISPLAY_FLAG_KEYS,
  isDisplayFlagKey,
} from './displayFlags.ts';
export { clearStoredBucket, persistBucket } from './persist.ts';
export type { ExerciseProgress, ExerciseStatus } from './preferences.ts';
export {
  clearAllProgress,
  getExerciseProgress,
  resetExercise,
  revealNextHint,
  setDisplayFlag,
  setExerciseAnswer,
  setExerciseStatus,
  setShowSolution,
  toggleDisplayFlag,
} from './preferences.ts';
export type { NumberRange } from './ranges.ts';
export {
  COUNT_RANGE,
  MAX_MF_LENGTH,
  MAX_STRUCTURE_LENGTH,
  MAX_VALENCE_LENGTH,
  SEED_RANGE,
  clampToRange,
  cutToLength,
} from './ranges.ts';
export type { TabId } from './tabs.ts';
export {
  DEFAULT_TAB,
  NAV_TAB_IDS,
  TAB_IDS,
  TAB_LABELS,
  isTabId,
} from './tabs.ts';
export type { FormulaSource } from './view.ts';
export {
  adoptStructureFormula,
  clearCalculator,
  loadStructure,
  resetValences,
  setActiveExercise,
  setActiveTab,
  setCount,
  setDirection,
  setEmbedded,
  setFormula,
  setHiddenParts,
  setLearnSection,
  setLevel,
  setSeed,
  setStructure,
  setValence,
  setValences,
} from './view.ts';
