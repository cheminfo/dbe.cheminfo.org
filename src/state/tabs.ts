/**
 * Every page the site routes to, and what each is called.
 *
 * Kept apart from the state bucket so the router can name a page without
 * pulling the signals in with it.
 */

/**
 * The pages the header lists, in its own order: the tool first — it is what `/`
 * renders — then the explanation, the practice and the reference. That is
 * discovery, practice and lookup, with the tool itself standing where a
 * pedagogic site would put a Playground: here the calculator *is* the
 * playground, because reading a DBE off a formula and off a drawing is the
 * whole tool.
 */
export const NAV_TAB_IDS = [
  'calculator',
  'learn',
  'exercises',
  'reference',
] as const;

/**
 * Every routed page: the four of the bar, and the About.
 *
 * The About is a page like any other — a real address, indexed and printable —
 * but it is about the site rather than a place in the tool, so it sits with the
 * utilities at the right of the bar and never among {@link NAV_TAB_IDS}.
 */
export const TAB_IDS = [...NAV_TAB_IDS, 'about'] as const;

/** One of {@link TAB_IDS}. */
export type TabId = (typeof TAB_IDS)[number];

/** What the bar, the share dialog and the crawl path call each page. */
export const TAB_LABELS: Record<TabId, string> = {
  calculator: 'Calculator',
  learn: 'Learn',
  exercises: 'Exercises',
  reference: 'Reference',
  about: 'About',
};

/**
 * The page shown when the address is empty or unknown: the calculator, which is
 * what `/` renders and what a course links to.
 */
export const DEFAULT_TAB: TabId = 'calculator';

/**
 * Narrow an arbitrary string — a path segment — to a page.
 * @param value - Candidate page name.
 * @returns True when it is one of {@link TAB_IDS}.
 */
export function isTabId(value: string): value is TabId {
  for (const tab of TAB_IDS) {
    if (tab === value) return true;
  }
  return false;
}
