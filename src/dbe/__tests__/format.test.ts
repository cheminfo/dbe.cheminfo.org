/**
 * Writing the numbers out, and the codec the address uses for a valence choice.
 *
 * A degree of unsaturation is never rounded: `3.5` says an odd number of bonds,
 * and printing `4` deletes the one thing that half was telling the reader. The
 * codec is asserted as a round trip, because the two halves are only useful
 * together — a link is written by one and read by the other.
 */

import { expect, test } from 'vitest';

import {
  formatDbe,
  formatHalf,
  parseValences,
  romanValence,
  serializeValences,
} from '../format.ts';
import type { ValenceChoices } from '../types.ts';
import { resolveValences } from '../valences.ts';

test('a count is written as it is, half included', () => {
  expect([
    formatDbe(4),
    formatDbe(0),
    formatDbe(12),
    formatDbe(3.5),
    formatDbe(0.5),
    formatDbe(-0.5),
    formatDbe(-2),
  ]).toStrictEqual(['4', '0', '12', '3.5', '0.5', '-0.5', '-2']);
});

test('a term of the sum carries its sign, so the column reads as a sum', () => {
  expect([
    formatHalf(12),
    formatHalf(2),
    formatHalf(0),
    formatHalf(-6),
    formatHalf(-1),
    formatHalf(0.5),
  ]).toStrictEqual(['+12', '+2', '0', '-6', '-1', '+0.5']);
});

test('a valence is written the way a chemist says it', () => {
  expect([
    romanValence(1),
    romanValence(2),
    romanValence(3),
    romanValence(4),
    romanValence(5),
    romanValence(6),
    romanValence(9),
  ]).toStrictEqual(['I', 'II', 'III', 'IV', 'V', 'VI', '9']);
});

test('a choice is written in table order, and a default is left out', () => {
  expect([
    serializeValences({ S: 6, P: 5 }),
    serializeValences({ As: 5, Se: 4, S: 6 }),
    serializeValences({ S: 4 }),
    serializeValences({}),
    serializeValences({ S: 2, P: 3 }),
    serializeValences({ S: 3, P: 9 }),
    serializeValences({ C: 6 }),
  ]).toStrictEqual(['S6,P5', 'S6,Se4,As5', 'S4', '', '', '', '']);
});

test('a link is read back into the choices it was written from', () => {
  const sets: readonly ValenceChoices[] = [
    { S: 6, P: 5 },
    { S: 4 },
    { Se: 6, As: 5 },
    {},
  ];
  for (const choices of sets) {
    const written = serializeValences(choices);
    expect([written, parseValences(written)]).toStrictEqual([written, choices]);
  }
});

test('a preset word is read as the whole set it stands for', () => {
  expect([
    parseValences('expanded'),
    parseValences('EXPANDED'),
    parseValences(' table '),
  ]).toStrictEqual([
    { S: 6, P: 5, Se: 6, As: 5 },
    { S: 6, P: 5, Se: 6, As: 5 },
    {},
  ]);
  expect(resolveValences(parseValences('expanded')).S).toBe(6);
});

test('a link a teacher retyped still opens', () => {
  expect([
    parseValences('s6'),
    parseValences('S6, p5'),
    parseValences('S6,,P5'),
  ]).toStrictEqual([{ S: 6 }, { S: 6, P: 5 }, { S: 6, P: 5 }]);
});

test('an unusable pair is dropped and the rest of the link still reads', () => {
  expect([
    parseValences('Xx9,S4'),
    parseValences('S3'),
    parseValences('N5'),
    parseValences('C4'),
    parseValences('S'),
    parseValences(''),
    parseValences(' '),
    parseValences(undefined),
  ]).toStrictEqual([{ S: 4 }, {}, {}, {}, {}, {}, {}, {}]);
});
