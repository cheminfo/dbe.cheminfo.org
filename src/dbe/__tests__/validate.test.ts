/**
 * Marking an answer, and the sentence the student reads when it is wrong.
 *
 * What is asserted here is mostly the *reason*, not the verdict: a boolean tells
 * a student nothing, and the reason is the only part of the verdict that
 * teaches. Each one has to name the value that was typed and the value that was
 * wanted, so a failure is read once rather than guessed at.
 */

import { expect, test } from 'vitest';

import { validateDbeAnswer } from '../validate.ts';

test('a right answer passes, in both directions', () => {
  const formula = validateDbeAnswer('formula', { dbe: 4 }, { dbe: '4' });
  const structure = validateDbeAnswer('structure', { dbe: 6 }, { dbe: ' 6 ' });
  expect([formula.passed, formula.error, structure.passed]).toStrictEqual([
    true,
    null,
    true,
  ]);
  expect(
    formula.cases.map((one) => [
      one.label,
      one.expected,
      one.actual,
      one.reason,
    ]),
  ).toStrictEqual([['Degree of unsaturation', '4', '4', '4: right.']]);
});

test('a wrong answer names what was typed and what the formula counts', () => {
  const wrong = validateDbeAnswer('formula', { dbe: 4 }, { dbe: '3' });
  expect([wrong.passed, wrong.error, wrong.cases.length]).toStrictEqual([
    false,
    null,
    1,
  ]);
  expect([wrong.cases[0]?.actual, wrong.cases[0]?.reason]).toStrictEqual([
    '3',
    'you answered 3; the formula counts 4',
  ]);
});

test('a wrong answer to a split question says how the right one is spent', () => {
  const wrong = validateDbeAnswer(
    'structure',
    { dbe: 4, rings: 1, piBonds: 3 },
    { dbe: '3', rings: '1', piBonds: '3' },
  );
  expect(wrong.cases.map((one) => [one.label, one.passed])).toStrictEqual([
    ['Degree of unsaturation', false],
    ['Rings', true],
    ['Pi bonds', true],
  ]);
  expect(wrong.cases[0]?.reason).toBe(
    'you answered 3; the drawing counts 4, which is 1 ring and 3 pi bonds',
  );
});

test('the rings and the pi bonds are marked apart from the total', () => {
  const split = validateDbeAnswer(
    'structure',
    { dbe: 7, rings: 2, piBonds: 5 },
    { dbe: '7', rings: '3', piBonds: '4' },
  );
  expect([split.passed, split.error]).toStrictEqual([false, null]);
  expect(
    split.cases.map((one) => [one.label, one.expected, one.actual, one.reason]),
  ).toStrictEqual([
    ['Degree of unsaturation', '7', '7', '7: right.'],
    ['Rings', '2', '3', 'you answered 3; rings count 2'],
    ['Pi bonds', '5', '4', 'you answered 4; pi bonds count 5'],
  ]);

  const whole = validateDbeAnswer(
    'structure',
    { dbe: 7, rings: 2, piBonds: 5 },
    { dbe: '7', rings: '2', piBonds: '5' },
  );
  expect([whole.passed, whole.cases.length]).toStrictEqual([true, 3]);
});

test('a half is a legitimate answer, because a radical really is one', () => {
  const half = validateDbeAnswer('formula', { dbe: 0.5 }, { dbe: '0.5' });
  expect([half.passed, half.cases[0]?.actual]).toStrictEqual([true, '0.5']);

  const rounded = validateDbeAnswer('formula', { dbe: 0.5 }, { dbe: '1' });
  expect([rounded.passed, rounded.cases[0]?.reason]).toStrictEqual([
    false,
    'you answered 1; the formula counts 0.5',
  ]);
});

test('a negative answer is read as a number, not refused as one', () => {
  const negative = validateDbeAnswer('formula', { dbe: -2 }, { dbe: '-2' });
  expect([negative.passed, negative.cases[0]?.actual]).toStrictEqual([
    true,
    '-2',
  ]);
});

test('a blank answer asks for a number instead of marking nothing wrong', () => {
  const blank = validateDbeAnswer('formula', { dbe: 4 }, { dbe: ' ' });
  expect([blank.passed, blank.cases, blank.missingOptions]).toStrictEqual([
    false,
    [],
    [],
  ]);
  expect(blank.error).toBe('Type the degree of unsaturation as a number.');
});

test('a word is told what a count looks like', () => {
  const word = validateDbeAnswer('structure', { dbe: 4 }, { dbe: 'four' });
  expect([word.passed, word.cases]).toStrictEqual([false, []]);
  expect(word.error).toBe(
    '"four" is not a number. Answer with a count, such as 4 — or 3.5, which a radical really can be.',
  );
});

test('an unanswered or unreadable half is failed in its own words', () => {
  const partial = validateDbeAnswer(
    'structure',
    { dbe: 4, rings: 1, piBonds: 3 },
    { dbe: '4', rings: '', piBonds: 'three' },
  );
  expect([partial.passed, partial.error]).toStrictEqual([false, null]);
  expect(
    partial.cases.map((one) => [one.label, one.actual, one.reason]),
  ).toStrictEqual([
    ['Degree of unsaturation', '4', '4: right.'],
    ['Rings', null, 'not answered; rings count 1'],
    ['Pi bonds', 'three', '"three" is not a number; pi bonds count 3'],
  ]);
});

test('a question that asks for the total alone marks the total alone', () => {
  const total = validateDbeAnswer(
    'structure',
    { dbe: 4 },
    { dbe: '4', rings: '9', piBonds: '9' },
  );
  expect([
    total.passed,
    total.cases.length,
    total.cases[0]?.label,
  ]).toStrictEqual([true, 1, 'Degree of unsaturation']);
});
