/**
 * The deck: a question is marked against what `src/dbe` computes, a wrong
 * answer is told what was wanted, hints open one at a time, a question has an
 * address of its own, and a seed hands the same set to everybody who opens the
 * link.
 *
 * The question, its answer and its hints are read out of `src/data`, so
 * renaming a question or rewriting a hint moves this file with it rather than
 * breaking it. Playwright gives each test its own storage, and the deck is
 * cleared on top of that, so a run configured to share a profile cannot make
 * one test pass on the answer another test gave.
 */

import { expect, test } from '@playwright/test';

import { EXERCISES, FORMULA_EXERCISES } from '../src/data/exercises.ts';
import { generateSeries } from '../src/dbe/series.ts';

import { clearStoredWork, entryAt } from './helpers.ts';

/** The seed a link pins here, and how long a set it asks for. */
const SERIES = { seed: 4271, count: 6 };

/** Its address, as a teacher hands it out. */
const SERIES_ADDRESS = `/exercises?seed=${SERIES.seed}&count=${SERIES.count}`;

/** The questions that seed hands out, in the order it hands them out. */
const SERIES_QUESTIONS = generateSeries({
  ...SERIES,
  // The defaults a link naming neither falls back to, so these are the
  // questions the address above opens on.
  level: 'mixed',
  direction: 'both',
});

/** The question most of these specs work on: the first of the formula deck. */
const QUESTION = entryAt(FORMULA_EXERCISES, 0, 'formula question');

const ADDRESS = `/exercises/${QUESTION.id}`;
const RIGHT = String(QUESTION.expected.dbe);
const WRONG = String(QUESTION.expected.dbe + 3);

test.beforeEach(async ({ page }) => {
  await page.goto('/exercises');
  await clearStoredWork(page);
});

test('the right answer is marked right, and counts towards the deck', async ({
  page,
}) => {
  await page.goto(ADDRESS);
  const card = page.getByTestId('exercise-card');
  await expect(card).toBeVisible();

  await page.getByTestId('answer-dbe').fill(RIGHT);
  await page.getByTestId('check-button').click();

  // The validator's own sentence, which is what the student reads.
  await expect(card).toContainText(`${RIGHT}: right.`);
  await expect(
    page.getByText(`1 / ${EXERCISES.length} solved`, { exact: true }),
  ).toBeVisible();
});

test('a wrong answer is marked wrong and says what was wanted', async ({
  page,
}) => {
  await page.goto(ADDRESS);
  const card = page.getByTestId('exercise-card');

  await page.getByTestId('answer-dbe').fill(WRONG);
  await page.getByTestId('check-button').click();

  // Both halves matter: what was given, and what the formula rule counts. A
  // student told only "wrong" has learned nothing.
  await expect(card).toContainText(`you answered ${WRONG}`);
  await expect(card).toContainText(`the formula counts ${RIGHT}`);
  await expect(
    page.getByText(`0 / ${EXERCISES.length} solved`, { exact: true }),
  ).toBeVisible();
});

test('the hints open one at a time, and stop at the last one', async ({
  page,
}) => {
  await page.goto(ADDRESS);
  const card = page.getByTestId('exercise-card');
  const reveal = card.getByRole('button', { name: /Reveal hint/ });
  const hints = QUESTION.hints.length;
  const first = entryAt(QUESTION.hints, 0, 'hint');
  const last = entryAt(QUESTION.hints, hints - 1, 'hint');
  // A ladder is two to four rungs; one is the answer with a lightbulb on it,
  // and the two ends below would be the same hint.
  expect(hints).toBeGreaterThanOrEqual(2);

  // The ladder starts closed: a hint on screen before it is asked for is a
  // solution with extra steps.
  await expect(card).not.toContainText(first);
  await expect(reveal).toHaveText(`Reveal hint (0/${hints})`);

  await reveal.click();
  await expect(card).toContainText(first);
  await expect(card).not.toContainText(last);

  for (let opened = 1; opened < hints; opened++) {
    // eslint-disable-next-line no-await-in-loop -- one rung at a time is the thing under test
    await reveal.click();
  }
  await expect(card).toContainText(last);
  await expect(reveal).toBeDisabled();
});

test('a question has an address of its own', async ({ page }) => {
  const question = entryAt(FORMULA_EXERCISES, 1, 'formula question');

  await page.goto(`/exercises/${question.id}`);

  const card = page.getByTestId('exercise-card');
  await expect(card).toContainText(question.title);
  await expect(card).toContainText(question.mf);
});

test('a seed hands the same set to everybody who opens the link', async ({
  page,
}) => {
  // What the seeded generator produces, asked of the page rather than of
  // itself: the deck must be these questions, in this order.
  const asked = SERIES_QUESTIONS.map((question) => question.title);
  const titles = page
    .getByTestId('exercise-list')
    .locator('.exercise-deck__title');

  await page.goto(SERIES_ADDRESS);
  await expect(titles).toHaveText(asked);

  // Opened again, by the next student, from the same link.
  await page.goto(SERIES_ADDRESS);
  await expect(titles).toHaveText(asked);

  // A different seed is a different set, so the sameness above is the
  // generator being reproducible rather than the page ignoring the seed.
  await page.goto(`/exercises?seed=99&count=${SERIES.count}`);
  await expect(titles).not.toHaveText(asked);
});

test('a question of a generated set is addressed like any other', async ({
  page,
}) => {
  const third = entryAt(SERIES_QUESTIONS, 2, 'generated question');

  await page.goto(`/exercises/${third.id}?seed=${SERIES.seed}`);

  await expect(page.getByTestId('exercise-card')).toContainText(third.title);
});
