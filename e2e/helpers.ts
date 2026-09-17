/**
 * What the four specs of this suite share: the string every page's title ends
 * with, the two places a visitor's work is kept, and the three things a spec
 * does before it asserts anything — throw away what a previous test left
 * behind, watch for an error the page logs, and name the page an address
 * opens.
 *
 * The suite runs against `npm run build && npm run preview`, i.e. the files the
 * prerender wrote, one per address. `vite dev` fills every address with the
 * home page's head, so a title assertion there would be checking the client's
 * correction rather than the head a crawler is handed.
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * What the tab writes after each page's own title, on every address.
 *
 * The site's name is its host, because its wordmark splits on the dot rather
 * than on itself.
 */
export const TITLE_SUFFIX = ' — dbe.cheminfo.org';

/**
 * The versioned entries the site keeps a visitor's choices and work in.
 *
 * Both are wiped between tests: a question one spec solved would otherwise
 * open the next one on a filled-in answer box and a solved progress bar.
 */
export const STORAGE_KEYS = ['dbe:preferences:v1', 'dbe:exercises:v1'];

/**
 * Record every uncaught exception and every `console.error` a page raises from
 * now on.
 *
 * The list is returned rather than asserted on, so a test can load the page,
 * work it, and only then hold the whole run against an empty list.
 * @param page - The page under test.
 * @returns The list the messages are appended to, as they happen.
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

/**
 * Forget every answer, hint and display choice stored in this browser.
 *
 * The page has to already be on one of the site's own addresses: storage is
 * per origin, and a blocked or partitioned store throws rather than returning
 * nothing, which is why the removal runs inside a `try`.
 * @param page - The page under test, already loaded.
 */
export async function clearStoredWork(page: Page): Promise<void> {
  await page.evaluate((keys: string[]) => {
    try {
      for (const key of keys) window.localStorage.removeItem(key);
    } catch {
      // A store that cannot be read holds nothing to clear.
    }
  }, STORAGE_KEYS);
}

/**
 * One entry of a list the site's own data carries, by position.
 *
 * The specs read the questions, sections and hints they work on out of
 * `src/data` rather than naming them, so a renamed question moves the suite
 * with it. Under `noUncheckedIndexedAccess` that reading is `T | undefined`,
 * and a spec that silently tested `undefined` would pass while asserting
 * nothing.
 * @param entries - The list.
 * @param position - Where the entry sits, from 0.
 * @param what - What the list holds, for the message when it is too short.
 * @returns The entry.
 * @throws {Error} When the list is shorter than that, which means the content
 * these specs were written against has been removed.
 */
export function entryAt<T>(
  entries: readonly T[],
  position: number,
  what: string,
): T {
  const entry = entries[position];
  if (entry === undefined) {
    throw new Error(`there is no ${what} at position ${position}`);
  }
  return entry;
}

/**
 * The page an address opens, as its `page-<tab>` marker names it.
 *
 * The calculator is the site's root — there is no `/calculator` — and the two
 * pages that address an entry keep their own marker on a deep link.
 * @param path - An address from the site's own root, e.g. `/exercises/mf-dmso`.
 * @returns The tab id, e.g. `exercises`.
 */
export function tabOfPath(path: string): string {
  const segment = path.split('/', 2)[1] ?? '';
  return segment === '' ? 'calculator' : segment;
}

/**
 * Assert the page a framed link opened carries none of the site's chrome.
 *
 * Asserted as absence from the tree rather than as invisibility: a course page
 * frames one figure, and a header merely hidden still takes its space and is
 * still read out.
 * @param page - The page under test.
 */
export async function expectNoChrome(page: Page): Promise<void> {
  await expect(page.getByRole('banner')).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Share', exact: true }),
  ).toHaveCount(0);
}
