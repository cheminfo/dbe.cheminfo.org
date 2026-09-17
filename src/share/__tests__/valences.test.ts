import { expect, test } from 'vitest';

import { parseValenceParam, serializeValenceParam } from '../valences.ts';

test('a link that says nothing counts every element at the shared table', () => {
  expect(parseValenceParam(undefined)).toStrictEqual({});
  expect(parseValenceParam('')).toStrictEqual({});
  expect(serializeValenceParam({})).toBe('');
});

test('the valences a link pins are the valences the class counts at', () => {
  expect(parseValenceParam('S6')).toStrictEqual({ S: 6 });
  expect(parseValenceParam('S6,P5')).toStrictEqual({ S: 6, P: 5 });
  expect(serializeValenceParam({ S: 6, P: 5 })).toBe('S6,P5');
});

test('one selection makes one link, whatever order it was chosen in', () => {
  expect(serializeValenceParam({ P: 5, S: 4 })).toBe('S4,P5');
  expect(parseValenceParam('P5,S4')).toStrictEqual({ S: 4, P: 5 });
});

test('a symbol the site offers no choice for is dropped, not obeyed', () => {
  expect(parseValenceParam('Xx9,S6')).toStrictEqual({ S: 6 });
  expect(parseValenceParam('Xx9')).toStrictEqual({});
});

test('a hand-edited link longer than the tool reads is cut, not refused', () => {
  // Forty characters of nothing the site knows, and then a valence that would
  // have changed the answer: the cut drops it, and the page still opens.
  const padding = 'Xx1,'.repeat(10);

  expect(padding).toHaveLength(40);
  expect(parseValenceParam(`${padding}S6`)).toStrictEqual({});
});
