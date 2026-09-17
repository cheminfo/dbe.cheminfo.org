/**
 * Path routing for the pages, through the History API.
 *
 * ```
 * /                          /?mf=C2H6OS&valence=S6      /?smiles=CS(C)%3DO
 * /learn                     /learn/sulfur
 * /exercises                 /exercises/mf-dmso          /exercises?seed=4271
 * /reference                 /about
 * ```
 *
 * The path says which page is open and which entry of it; the query says how
 * that page is configured and which parts of it a shared link leaves out. The
 * router itself knows none of those parameter names — it carries them — so
 * `src/share` owns the meaning and this file stays a string to route mapping.
 *
 * `/` **is** the calculator: there is no `/calculator`, because two addresses
 * for one page is the second front door the family forbids. A link that names
 * it anyway still opens, and the bar is rewritten to `/`.
 *
 * A fragment never reaches the server, so a hash-routed site is one address to
 * every crawler and its pages are folded into a single result; a `#` is also
 * dropped by half the tools that pass links around — LMS editors, chat clients,
 * QR generators. Links written when a tool routed by the hash still open:
 * {@link readRoute} rewrites `#/exercises` to `/exercises` once, in place.
 *
 * The parser and the serialiser are pure: they never touch `window`, and are
 * unit-tested on their own. Only the three helpers at the bottom read or write
 * the real location.
 */

import {
  adoptLegacyHashAddress,
  formatQueryString,
  parseQueryString,
} from 'react-cheminfo/core';

import { pathWithoutBase, withBase } from '../state/site.ts';
import type { TabId } from '../state/tabs.ts';
import { DEFAULT_TAB, isTabId } from '../state/tabs.ts';

import { splitPath, splitQuery } from './address.ts';

/** Where the app is: which page, what that page has open, and how it is set up. */
export interface Route {
  tab: TabId;
  /**
   * Second path segment: a section of the explanation, a question — or `null`
   * for a page that addresses no entry.
   */
  id: string | null;
  /** Decoded query of the address. Empty entries never survive a round trip. */
  query: Record<string, string>;
}

/** Shown when the address is empty, or names a page that does not exist. */
export const DEFAULT_ROUTE: Route = { tab: DEFAULT_TAB, id: null, query: {} };

/**
 * Parse an address into a route.
 *
 * Forgiving by design: a leading `#`, a trailing slash, an empty string, an
 * unknown page, a segment beyond an entry and a lone `%` in an encoded value
 * all resolve to something sensible rather than throwing, because the address
 * is hand-editable and arrives from bookmarks, lecture slides and course pages.
 *
 * An id the data does not know is carried through rather than refused: the page
 * decides what to do with it, so a link from a slide of last year lands where it
 * says rather than on the home page.
 * @param address - Path and query, with or without a leading `#` or `/`.
 * @returns The route it denotes, or {@link DEFAULT_ROUTE} when it denotes none.
 */
export function parseAddress(address: string): Route {
  const { path, search } = splitQuery(address);
  const query = parseQueryString(search);
  const segments = splitPath(path);
  const tab = segments[0];
  if (tab === undefined || !isTabId(tab)) {
    return { tab: DEFAULT_TAB, id: null, query };
  }
  const id = segments[1];
  if (id === undefined || id === '' || !tabTakesId(tab)) {
    return { tab, id: null, query };
  }
  return { tab, id, query };
}

/**
 * Serialise a route into the address that parses back to it.
 * @param route - Route to serialise.
 * @returns An absolute path, with its query when it carries one.
 */
export function formatRoute(route: Route): string {
  const path =
    route.id === null || !tabTakesId(route.tab)
      ? pathOf(route.tab)
      : `${pathOf(route.tab)}/${encodeURIComponent(route.id)}`;
  const search = formatQueryString(route.query);
  return search === '' ? path : `${path}?${search}`;
}

/**
 * The address a page answers on, with no entry and no query.
 *
 * The calculator is the site's root, so it is the one page whose path is not
 * its own name.
 * @param tab - Page to address.
 * @returns Its path, from the site's own root.
 */
export function pathOf(tab: TabId): string {
  return tab === 'calculator' ? '/' : `/${tab}`;
}

/**
 * Whether a page addresses one of its entries in the path.
 *
 * The explanation names its section and the exercises name the open question,
 * so a lecturer can hand out a deep link to either. The calculator names
 * nothing: what it is showing is a formula, a structure and a set of valences,
 * and those live in the query. The reference and the About address no entry.
 * @param tab - Page to ask about.
 * @returns True for `learn` and `exercises`.
 */
export function tabTakesId(tab: TabId): boolean {
  return tab === 'learn' || tab === 'exercises';
}

/**
 * Compare two routes by value.
 * @param first - One route.
 * @param second - The other.
 * @returns True when both name the same page, entry and configuration.
 */
export function routesEqual(first: Route, second: Route): boolean {
  if (first.tab !== second.tab || first.id !== second.id) return false;
  return formatQueryString(first.query) === formatQueryString(second.query);
}

/**
 * Read the route the browser is currently showing.
 *
 * A link written for a hash — the two visualizer views this site replaces were
 * addressed that way — is rewritten to its path once, in place, so a course
 * page made years ago opens the page it names.
 * @returns The parsed address.
 */
export function readRoute(): Route {
  const { pathname, search, hash } = window.location;
  const path = pathWithoutBase(pathname);
  const legacy = adoptLegacyHashAddress(`${path}${search}${hash}`);
  if (legacy !== null) {
    const route = parseAddress(legacy);
    window.history.replaceState(null, '', withBase(formatRoute(route)));
    return route;
  }
  return parseAddress(`${path}${search}`);
}

/**
 * Point the browser at a route.
 *
 * Changing page pushes a history entry, so back and forward walk the pages.
 * Moving inside one — the next section, another question, a keystroke in the
 * formula box — *replaces* it instead: the link stays shareable, but nine
 * sections do not bury the back button under nine entries and a formula typed
 * character by character does not bury it under twenty. Writing the address the
 * location already carries is skipped, so echoing state back into the URL
 * cannot loop.
 * @param route - Route to show.
 */
export function writeRoute(route: Route): void {
  const address = formatRoute(route);
  const { pathname, search } = window.location;
  const current = `${pathWithoutBase(pathname)}${search}`;
  if (current === address) return;
  const mounted = withBase(address);
  // Neither call fires `popstate`, so this cannot echo back through the
  // subscription below.
  if (parseAddress(current).tab === route.tab) {
    window.history.replaceState(null, '', mounted);
    return;
  }
  window.history.pushState(null, '', mounted);
}

/**
 * Follow the browser's own navigation — back, forward, an edited address bar.
 * @param listener - Called with the new route on every `popstate`.
 * @returns A function removing the listener.
 */
export function subscribeToRoute(listener: (route: Route) => void): () => void {
  function handlePopState(): void {
    listener(readRoute());
  }
  window.addEventListener('popstate', handlePopState);
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}
