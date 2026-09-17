import { assertRoutes, pageMetaFor } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { DESCRIPTION_MAX, DESCRIPTION_MIN } from '../seo/describe.ts';
import {
  FIXED_ROUTES,
  GENERATED_ROUTES,
  NOSCRIPT_ROUTES,
  PAGE_ROUTES,
} from '../seo/routes.ts';

test('the pages that exist whatever the content says are these five', () => {
  expect(FIXED_ROUTES.map((route) => route.path)).toStrictEqual([
    '/',
    '/learn',
    '/exercises',
    '/reference',
    '/about',
  ]);
  expect(NOSCRIPT_ROUTES).toStrictEqual(FIXED_ROUTES);
  expect(PAGE_ROUTES.slice(0, FIXED_ROUTES.length)).toStrictEqual(FIXED_ROUTES);
  expect(PAGE_ROUTES).toHaveLength(
    FIXED_ROUTES.length + GENERATED_ROUTES.length,
  );
});

test('the route table is one a crawler can be handed', () => {
  expect(() => {
    assertRoutes(PAGE_ROUTES);
  }).not.toThrow();
});

test('no two pages carry the same address, title or description', () => {
  const paths = new Set(PAGE_ROUTES.map((route) => route.path));
  const titles = new Set(PAGE_ROUTES.map((route) => route.title));
  const descriptions = new Set(PAGE_ROUTES.map((route) => route.description));

  expect(paths.size).toBe(PAGE_ROUTES.length);
  expect(titles.size).toBe(PAGE_ROUTES.length);
  expect(descriptions.size).toBe(PAGE_ROUTES.length);
});

test('a description is a sentence a search result shows whole', () => {
  for (const route of PAGE_ROUTES) {
    expect(route.description.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(route.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    // 60 characters, because the site name is appended to whatever is here.
    expect(route.title.length).toBeLessThanOrEqual(60);
    // A `[[term]]` marker is a glossary chip on the page and nothing at all in
    // a search result.
    expect(route.description).not.toContain('[[');
    expect(route.title).not.toContain('[[');
  }
});

test('the crawl path reads as a menu, not as a list of search results', () => {
  expect(NOSCRIPT_ROUTES.map((route) => route.short)).toStrictEqual([
    'Calculator',
    'Learn',
    'Exercises',
    'Reference',
    'About',
  ]);
});

test('the explanation and the deck each put their entries on the map', () => {
  const paths = new Set(PAGE_ROUTES.map((route) => route.path));

  // The two the rest of the site links to by name: the section on sulfur, and
  // the question where the formula and the drawing first disagree.
  expect(paths.has('/learn/sulfur')).toBe(true);
  expect(paths.has('/exercises/mf-dmso')).toBe(true);
  for (const route of GENERATED_ROUTES) {
    expect(
      route.path.startsWith('/learn/') || route.path.startsWith('/exercises/'),
    ).toBe(true);
  }
});

test('an entry of its own is a page of its own, and a stale id still lands', () => {
  expect(pageMetaFor(PAGE_ROUTES, '/learn/sulfur').path).toBe('/learn/sulfur');
  expect(pageMetaFor(PAGE_ROUTES, '/exercises/mf-dmso').path).toBe(
    '/exercises/mf-dmso',
  );
  expect(pageMetaFor(PAGE_ROUTES, '/learn/selenium').path).toBe('/learn');
  expect(pageMetaFor(PAGE_ROUTES, '/exercises/mf-selenium').path).toBe(
    '/exercises',
  );
  // A question of a generated series is addressed but never tabulated: its id
  // means nothing without the seed beside it.
  expect(pageMetaFor(PAGE_ROUTES, '/exercises/s4271-3?seed=4271').path).toBe(
    '/exercises',
  );
});

test('an address the site does not know is described as the home page', () => {
  expect(pageMetaFor(PAGE_ROUTES, '/not-a-page').path).toBe('/');
  expect(pageMetaFor(PAGE_ROUTES, '/calculator').path).toBe('/');
});

test('what the calculator is showing is never a page of its own', () => {
  for (const route of PAGE_ROUTES) {
    expect(route.path).not.toContain('?');
  }
  expect(pageMetaFor(PAGE_ROUTES, '/?mf=C2H6OS&valence=S6').path).toBe('/');
  expect(pageMetaFor(PAGE_ROUTES, '/learn/sulfur?smiles=CS(C)%3DO').path).toBe(
    '/learn/sulfur',
  );
  expect(pageMetaFor(PAGE_ROUTES, '/reference/').path).toBe('/reference');
});
