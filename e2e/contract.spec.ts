/**
 * What every site of the family promises, checked on the built site: each
 * routed address renders its own page, is served with its own title,
 * description and canonical, and logs nothing while doing it.
 *
 * The addresses come from `PAGE_ROUTES`, the table the build prerenders and the
 * sitemap lists, so the five pages plus one section of the explanation and one
 * question are read from the data rather than typed here — a section renamed in
 * `src/data` moves this file with it.
 */

import { expect, test } from '@playwright/test';
import type { RouteMeta } from 'react-cheminfo/core';

import { FIXED_ROUTES, PAGE_ROUTES } from '../src/seo/routes.ts';

import { TITLE_SUFFIX, collectErrors, tabOfPath } from './helpers.ts';

/**
 * The first address the route table carries under a prefix.
 *
 * Used for the two deep links — a section of the explanation and a question —
 * so this file never names an id a content edit could retire.
 * @param prefix - The address prefix, e.g. `/learn/`.
 * @returns That route.
 * @throws {Error} When the table carries no address under the prefix, which
 * would mean the page composes no addresses from its data any more.
 */
function routeUnder(prefix: string): RouteMeta {
  const route = PAGE_ROUTES.find((entry) => entry.path.startsWith(prefix));
  if (route === undefined) {
    throw new Error(`the route table carries no address under ${prefix}`);
  }
  return route;
}

/** The five pages, then one deep link into each of the two that take an id. */
const ADDRESSES: readonly RouteMeta[] = [
  ...FIXED_ROUTES,
  routeUnder('/learn/'),
  routeUnder('/exercises/'),
];

for (const route of ADDRESSES) {
  test(`${route.path} renders its page under its own head, cleanly`, async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto(route.path);

    await expect(
      page.getByTestId(`page-${tabOfPath(route.path)}`),
    ).toBeVisible();
    await expect(page).toHaveTitle(route.title + TITLE_SUFFIX);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      route.description,
    );
    // Absolute, and ending on the address it names: the query carries the
    // formula and the share configuration, which are not other pages.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`^https?://[^?#]*${route.path}$`),
    );

    await page.waitForLoadState('networkidle');
    expect(errors).toStrictEqual([]);
  });
}

test('the seven addresses are indexed under seven different titles', () => {
  // Each address above is asserted to carry exactly this title, so seven
  // distinct expectations are seven distinct served heads — which is what stops
  // a search engine folding the site into one result.
  const titles = ADDRESSES.map((route) => route.title + TITLE_SUFFIX);

  expect(new Set(titles).size).toBe(ADDRESSES.length);
});

test('an address the site does not answer opens the calculator', async ({
  page,
}) => {
  const errors = collectErrors(page);

  await page.goto('/no-such-page/anywhere');

  await expect(page.getByTestId('page-calculator')).toBeVisible();
  await expect(page.getByTestId('formula-input')).toBeVisible();

  await page.waitForLoadState('networkidle');
  expect(errors).toStrictEqual([]);
});
