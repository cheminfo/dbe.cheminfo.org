import { beforeEach, expect, test } from 'vitest';

import { setStructure, state } from '../../state/index.ts';
import { formatRoute, parseAddress } from '../../utils/router.ts';
import { defaultFlagsValue } from '../flags.ts';
import { applyRoute, currentRoute } from '../route.ts';

/** The address the state says it is on, in its canonical form. */
function address(): string {
  return formatRoute(currentRoute());
}

/** Apply an address exactly as the shell does on load or on a back button. */
function open(value: string): string {
  applyRoute(parseAddress(value));
  return address();
}

beforeEach(() => {
  // The layers are stored preferences, so one test's link would otherwise be
  // in force in the next.
  open(`/?flags=${defaultFlagsValue()}`);
});

test('a plain visit keeps a plain address', () => {
  expect(open('/')).toBe('/');
  expect(open('/learn')).toBe('/learn');
  expect(open('/exercises')).toBe('/exercises');
  expect(open('/reference')).toBe('/reference');
  expect(open('/about')).toBe('/about');
});

test('a link naming a setting already at its default writes it no more', () => {
  expect(open('/exercises?count=8&level=mixed&direction=both')).toBe(
    '/exercises',
  );
  expect(open('/?mf=&smiles=&valence=')).toBe('/');
  expect(open(`/?flags=${defaultFlagsValue()}`)).toBe('/');
});

test('what the calculator is showing survives parse, apply and parse', () => {
  expect(open('/?mf=C6H6')).toBe('/?mf=C6H6');
  expect(open('/?smiles=c1ccccc1')).toBe('/?smiles=c1ccccc1');
  expect(open('/?mf=C2H6OS&smiles=CS(C)%3DO&valence=S6')).toBe(
    '/?mf=C2H6OS&smiles=CS(C)%3DO&valence=S6',
  );
  expect(state.view.valences.value).toStrictEqual({ S: 6 });
});

test('a link carrying only a structure leaves the box following the drawing', () => {
  open('/?smiles=c1ccccc1');

  expect(state.view.calculator.formulaSource.value).toBe('structure');

  // What the drawing says fills the box, and is not written into the address
  // as well: it is derived from the `smiles` the link already carries.
  setStructure('c1ccccc1', 'C6H6');

  expect(state.view.calculator.formula.value).toBe('C6H6');
  expect(address()).toBe('/?smiles=c1ccccc1');
});

test('a link carrying a formula pins it, and the box stops following', () => {
  expect(open('/?mf=C6H6&smiles=c1ccccc1')).toBe('/?mf=C6H6&smiles=c1ccccc1');
  expect(state.view.calculator.formulaSource.value).toBe('typed');

  // A stroke on the canvas now leaves the typed formula alone, which is the
  // whole point: the comparison is about that formula.
  setStructure('c1ccccc1C', 'C7H8');

  expect(state.view.calculator.formula.value).toBe('C6H6');
});

test('a section and a question keep their place in the path', () => {
  expect(open('/learn/sulfur')).toBe('/learn/sulfur');
  expect(open('/learn/sulfur?mf=C2H6OS&valence=S6')).toBe(
    '/learn/sulfur?mf=C2H6OS&valence=S6',
  );
  expect(open('/exercises/mf-dmso')).toBe('/exercises/mf-dmso');
  // A generated question is meaningless without the seed that produced it, so
  // the two travel together.
  expect(open('/exercises/s4271-3?seed=4271')).toBe(
    '/exercises/s4271-3?seed=4271',
  );
  expect(state.view.exercises.seed.value).toBe(4271);
});

test('a series a link asks for beyond the ceiling opens clamped', () => {
  expect(open('/exercises?seed=1000000000&count=400')).toBe(
    '/exercises?seed=999999&count=30',
  );
  expect(state.view.exercises.seed.value).toBe(999_999);
  expect(state.view.exercises.count.value).toBe(30);

  expect(open('/exercises?seed=4271&count=6&level=beginner')).toBe(
    '/exercises?seed=4271&count=6&level=beginner',
  );
  expect(state.view.exercises.level.value).toBe('beginner');
});

test('the layers a link pins are the layers the class sees', () => {
  expect(open('/?flags=none')).toBe('/?flags=none');
  expect(state.preferences.flags.breakdown.value).toBe(false);

  expect(open('/?flags=breakdown')).toBe('/?flags=breakdown');
  expect(state.preferences.flags.breakdown.value).toBe(true);
  expect(state.preferences.flags.highlight.value).toBe(false);

  // A link that says nothing about them leaves them where the visitor left
  // them, and the next address still carries what is in force.
  expect(open('/learn')).toBe('/learn?flags=breakdown');
});

test('an embedded link keeps its configuration across the round trip', () => {
  expect(open('/?embed=1&hide=intro,examples')).toBe(
    '/?embed=1&hide=intro,examples',
  );
  expect(state.view.embedded.value).toBe(true);
  expect(state.view.hidden.value).toStrictEqual(['intro', 'examples']);

  // A bare switch, as a teacher retypes it, and a key the site cannot name.
  expect(open('/exercises?embed&hide=list,sidebar')).toBe(
    '/exercises?embed=1&hide=list',
  );

  open('/about');

  expect(state.view.embedded.value).toBe(false);
  expect(state.view.hidden.value).toStrictEqual([]);
});
