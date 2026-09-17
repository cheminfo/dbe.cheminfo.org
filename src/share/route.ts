/**
 * The two directions between the view state and the address.
 *
 * A link is the whole configuration of what is on screen: the page, the entry
 * it has open, what the calculator is showing, the valences it is counting at,
 * which layers it is drawn with, whether it is framed, and the parts a course
 * page asked to leave out. Both functions are plain state code — no React — so
 * the round trip is unit-tested without a DOM.
 */

import { batch } from '@preact/signals-react';

import type { DisplayFlagKey } from '../state/index.ts';
import {
  DISPLAY_FLAGS,
  adoptStructureFormula,
  loadStructure,
  setActiveExercise,
  setActiveTab,
  setCount,
  setDirection,
  setDisplayFlag,
  setEmbedded,
  setFormula,
  setHiddenParts,
  setLearnSection,
  setLevel,
  setSeed,
  setValences,
  state,
} from '../state/index.ts';
import type { TabId } from '../state/tabs.ts';
import type { Route } from '../utils/router.ts';

import { EMBED_PARAM, parseEmbed } from './embed.ts';
import {
  FLAGS_PARAM,
  defaultFlagsValue,
  parseFlags,
  serializeFlags,
} from './flags.ts';
import { parseHidden, serializeHidden } from './hidden.ts';
import type { ShareParamSet } from './params.ts';
import { SHARE_PARAMS, readShareParams } from './params.ts';
import { HIDE_PARAM } from './parts.ts';
import {
  VALENCE_PARAM,
  parseValenceParam,
  serializeValenceParam,
} from './valences.ts';

/**
 * Where the state says the visitor is, as a route.
 *
 * Reads signals, so it is meant to be called inside an `effect`: every leaf it
 * touches is a leaf that must rewrite the address when it changes. A setting
 * already at its default is left out, so a plain visit keeps a plain address.
 * @returns The route mirroring the current state.
 */
export function currentRoute(): Route {
  const tab = state.view.activeTab.value;
  const query: Record<string, string> = {};
  if (countsAMolecule(tab)) {
    writeCalculator(query);
    writeFlags(query);
  }
  if (tab === 'exercises') writeSeries(query);
  if (state.view.embedded.value) query[EMBED_PARAM] = '1';
  const hidden = serializeHidden(state.view.hidden.value);
  if (hidden !== '') query[HIDE_PARAM] = hidden;
  return { tab, id: idOf(tab), query };
}

/**
 * Move the state to a route: the address on load, and every back or forward
 * after it.
 *
 * Everything the address carries has already been clamped or cut by the share
 * codecs, and an id naming nothing is handed to the page rather than obeyed
 * here — a link from a slide of last year must land on the page it names, not
 * on an empty one.
 * @param route - Route to apply.
 */
export function applyRoute(route: Route): void {
  const params = readShareParams(route.query);
  batch(() => {
    setEmbedded(parseEmbed(route.query));
    setHiddenParts(parseHidden(route.query[HIDE_PARAM]));
    applyFlags(route.query[FLAGS_PARAM]);
    setActiveTab(route.tab);
    applyPage(route, params);
  });
}

function applyPage(route: Route, params: ShareParamSet): void {
  const { tab, id } = route;
  if (countsAMolecule(tab)) {
    if (tab === 'learn') setLearnSection(id);
    applyCalculator(params);
    return;
  }
  if (tab === 'exercises') {
    // The series before the question: `/exercises/s4271-3` names the third
    // question *of that seed*, and is meaningless without it.
    setSeed(params.seed);
    setCount(params.count);
    setLevel(params.level);
    setDirection(params.direction);
    setActiveExercise(id);
  }
}

function applyCalculator(params: ShareParamSet): void {
  setValences(parseValenceParam(params.valence));
  // The drawing first, and through `loadStructure` so the canvas is reseeded:
  // this is a link being opened, not a stroke.
  loadStructure(params.smiles);
  // A link carrying `?mf` is a formula somebody typed, and the box stops
  // following the drawing; one carrying only `?smiles` leaves it following.
  if (params.mf === '') {
    adoptStructureFormula('');
  } else {
    setFormula(params.mf);
  }
}

function applyFlags(value: string | undefined): void {
  const flags = parseFlags(value);
  if (flags === null) return;
  for (const meta of DISPLAY_FLAGS) {
    setDisplayFlag(meta.key, flags.has(meta.key));
  }
}

/**
 * The formula, the structure and the valences.
 *
 * The formula is written only while the box is not following the drawing: a
 * formula read off the structure is derived from the `?smiles` the link already
 * carries, and writing it as well would pin it as typed on the next load.
 */
function writeCalculator(query: Record<string, string>): void {
  const { formula, formulaSource, structure } = state.view.calculator;
  const typed = formulaSource.value === 'typed';
  write(query, 'mf', SHARE_PARAMS.mf.serialize(typed ? formula.value : ''));
  write(query, 'smiles', SHARE_PARAMS.smiles.serialize(structure.value));
  write(
    query,
    VALENCE_PARAM,
    SHARE_PARAMS.valence.serialize(
      serializeValenceParam(state.view.valences.value),
    ),
  );
}

function writeSeries(query: Record<string, string>): void {
  const { count, direction, level, seed } = state.view.exercises;
  write(query, 'seed', SHARE_PARAMS.seed.serialize(seed.value));
  write(query, 'count', SHARE_PARAMS.count.serialize(count.value));
  write(query, 'level', SHARE_PARAMS.level.serialize(level.value));
  write(query, 'direction', SHARE_PARAMS.direction.serialize(direction.value));
}

/**
 * The layers, written only when they differ from the site's own defaults: a
 * visitor who has changed nothing must not grow a query string.
 */
function writeFlags(query: Record<string, string>): void {
  const value = serializeFlags(readFlags());
  if (value !== defaultFlagsValue()) query[FLAGS_PARAM] = value;
}

/** Every layer, read in one place so the `effect` tracks all of them. */
function readFlags(): Record<DisplayFlagKey, boolean> {
  const flags: Partial<Record<DisplayFlagKey, boolean>> = {};
  for (const meta of DISPLAY_FLAGS) {
    flags[meta.key] = state.preferences.flags[meta.key].value;
  }
  return flags as Record<DisplayFlagKey, boolean>;
}

/** Whether the page carries the calculator, and therefore its configuration. */
function countsAMolecule(tab: TabId): boolean {
  return tab === 'calculator' || tab === 'learn';
}

/** The second path segment of a page, for the pages that address an entry. */
function idOf(tab: TabId): string | null {
  if (tab === 'learn') return state.view.learn.sectionId.value;
  if (tab === 'exercises') return state.view.exercises.activeId.value;
  return null;
}

/** A setting the codec did not delete for being at its default. */
function write(
  query: Record<string, string>,
  key: string,
  raw: string | null,
): void {
  if (raw !== null) query[key] = raw;
}
