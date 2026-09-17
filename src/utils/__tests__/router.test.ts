import { expect, test } from 'vitest';

import type { Route } from '../router.ts';
import {
  DEFAULT_ROUTE,
  formatRoute,
  parseAddress,
  pathOf,
  routesEqual,
  tabTakesId,
} from '../router.ts';

test('an empty address is the calculator', () => {
  const home: Route = { tab: 'calculator', id: null, query: {} };

  expect(parseAddress('')).toStrictEqual(home);
  expect(parseAddress('/')).toStrictEqual(home);
  expect(parseAddress('#')).toStrictEqual(home);
  expect(parseAddress('#/')).toStrictEqual(home);
  expect(DEFAULT_ROUTE).toStrictEqual(home);
});

test('the calculator is `/`, and `/calculator` is not a second door', () => {
  expect(pathOf('calculator')).toBe('/');
  expect(formatRoute({ tab: 'calculator', id: null, query: {} })).toBe('/');
  expect(formatRoute({ tab: 'calculator', id: 'benzene', query: {} })).toBe(
    '/',
  );
  // A link that names it anyway still opens the page it means.
  expect(parseAddress('/calculator')).toStrictEqual({
    tab: 'calculator',
    id: null,
    query: {},
  });
});

test('an unknown page falls back to the calculator', () => {
  expect(parseAddress('/dbe')).toStrictEqual(DEFAULT_ROUTE);
  expect(parseAddress('/Learn')).toStrictEqual(DEFAULT_ROUTE);
  expect(parseAddress('/exercise/mf-dmso')).toStrictEqual(DEFAULT_ROUTE);
});

test('every page of the bar is its own address', () => {
  expect(parseAddress('/learn').tab).toBe('learn');
  expect(parseAddress('/exercises').tab).toBe('exercises');
  expect(parseAddress('/reference').tab).toBe('reference');
  expect(parseAddress('/about').tab).toBe('about');
  expect(formatRoute({ tab: 'learn', id: null, query: {} })).toBe('/learn');
  expect(formatRoute({ tab: 'about', id: null, query: {} })).toBe('/about');
});

test('the calculator addresses no entry; the explanation and the deck do', () => {
  expect(tabTakesId('calculator')).toBe(false);
  expect(tabTakesId('reference')).toBe(false);
  expect(tabTakesId('about')).toBe(false);
  expect(tabTakesId('learn')).toBe(true);
  expect(tabTakesId('exercises')).toBe(true);
  // A second segment on a page that addresses nothing is dropped, not kept.
  expect(parseAddress('/reference/sulfur')).toStrictEqual({
    tab: 'reference',
    id: null,
    query: {},
  });
});

test('an entry keeps its id, and an index keeps none', () => {
  expect(parseAddress('/learn/sulfur').id).toBe('sulfur');
  expect(parseAddress('/learn/phosphorus/').id).toBe('phosphorus');
  expect(parseAddress('/exercises/mf-dmso').id).toBe('mf-dmso');
  // A question of a generated series is addressed exactly like a curated one.
  expect(parseAddress('/exercises/s4271-3?seed=4271').id).toBe('s4271-3');
  expect(parseAddress('/learn').id).toBe(null);
  expect(parseAddress('/exercises/').id).toBe(null);
});

test('the query is carried whole, and a bare flag survives the parse', () => {
  expect(parseAddress('/?mf=C2H6OS&valence=S6').query).toStrictEqual({
    mf: 'C2H6OS',
    valence: 'S6',
  });
  expect(parseAddress('/?embed').query).toStrictEqual({ embed: '' });
  expect(
    parseAddress('/exercises?embed=1&hide=list,series').query,
  ).toStrictEqual({ embed: '1', hide: 'list,series' });
  // An entry carrying nothing is never written back out.
  expect(formatRoute({ tab: 'calculator', id: null, query: { mf: '' } })).toBe(
    '/',
  );
});

test('a charged SMILES survives the round trip, plus sign and all', () => {
  const route = parseAddress('/?smiles=CC[N+](C)C');

  expect(route.query.smiles).toBe('CC[N+](C)C');
  // Written back escaped, because every other parser of an address reads a
  // bare `+` as a space and would hand the tool a neutral amine.
  expect(formatRoute(route)).toBe('/?smiles=CC%5BN%2B%5D(C)C');
  expect(parseAddress(formatRoute(route)).query.smiles).toBe('CC[N+](C)C');
});

test('a percent escape survives, and a broken one does not throw', () => {
  expect(parseAddress('/?smiles=%5BNa%2B%5D.%5BCl-%5D').query.smiles).toBe(
    '[Na+].[Cl-]',
  );
  expect(parseAddress('/?mf=%').query.mf).toBe('%');
  expect(parseAddress('/learn/sul%fur').id).toBe('sul%fur');
});

test('every address the site answers round-trips through both directions', () => {
  const addresses = [
    '/',
    '/?mf=C6H6',
    '/?smiles=c1ccccc1',
    '/?mf=C2H6OS&smiles=CS(C)%3DO&valence=S6',
    '/learn',
    '/learn/sulfur',
    '/exercises',
    '/exercises/mf-dmso',
    '/exercises?seed=4271&count=6&level=beginner',
    '/exercises/s4271-3?seed=4271',
    '/reference',
    '/about?embed=1',
  ];

  for (const address of addresses) {
    expect(formatRoute(parseAddress(address))).toBe(address);
  }
});

test('two routes are equal when they name the same page, entry and query', () => {
  const first: Route = {
    tab: 'exercises',
    id: 's4271-3',
    query: { seed: '4271' },
  };

  expect(routesEqual(first, { ...first })).toBe(true);
  expect(routesEqual(first, { ...first, id: 's4271-4' })).toBe(false);
  expect(routesEqual(first, { ...first, tab: 'learn' })).toBe(false);
  expect(routesEqual(first, { ...first, query: {} })).toBe(false);
  // An empty entry is not part of the address, so it is not part of the route.
  expect(
    routesEqual(first, { ...first, query: { seed: '4271', mf: '' } }),
  ).toBe(true);
});
