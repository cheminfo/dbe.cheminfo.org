/**
 * What a link handed to a course page can say: `?embed` drops the site's
 * chrome, and `?hide=` drops the parts of the page a host page has no use for.
 *
 * A framed page is one figure, so every absence here is asserted as absence
 * from the tree — `toHaveCount(0)`, never invisibility. A header merely hidden
 * still takes its space and is still read out.
 *
 * What is dropped is never what the figure is for: the number stays when its
 * breakdown goes, and the open question stays when the deck goes.
 */

import { expect, test } from '@playwright/test';

import { FORMULA_EXERCISES } from '../src/data/exercises.ts';
import { LEARN_SECTIONS } from '../src/data/learn.ts';

import { entryAt, expectNoChrome } from './helpers.ts';

/** The question a framed link opens on its own. */
const QUESTION = entryAt(FORMULA_EXERCISES, 0, 'formula question');

/** The section a framed deep link opens. */
const SECTION = entryAt(LEARN_SECTIONS, 0, 'section of the explanation');

for (const query of ['?embed', '?embed=1']) {
  test(`/${query} drops the chrome and keeps the tool`, async ({ page }) => {
    await page.goto(`/${query}`);

    // The tool first: an unmounted page would otherwise pass every assertion
    // of absence below.
    await expect(page.getByTestId('page-calculator')).toBeVisible();
    await expect(page.getByTestId('formula-input')).toBeVisible();
    await expect(page.getByTestId('structure-input')).toBeVisible();

    await expectNoChrome(page);
  });
}

test('?hide=breakdown drops the table and keeps the number', async ({
  page,
}) => {
  await page.goto('/?embed=1&mf=C6H6&hide=breakdown');

  await expect(page.getByTestId('formula-dbe')).toHaveText('4');
  await expect(page.getByTestId('formula-breakdown')).toHaveCount(0);
});

test('?hide=list leaves the question the link names, with no deck', async ({
  page,
}) => {
  await page.goto(`/exercises/${QUESTION.id}?embed=1&hide=list`);

  await expect(page.getByTestId('exercise-card')).toBeVisible();
  await expect(page.getByTestId('exercise-card')).toContainText(QUESTION.title);
  await expect(page.getByTestId('answer-dbe')).toBeVisible();
  await expect(page.getByTestId('exercise-list')).toHaveCount(0);
});

test('a framed deep link still opens the page it names', async ({ page }) => {
  await page.goto(`/learn/${SECTION.id}?embed=1`);

  await expect(page.getByTestId('page-learn')).toBeVisible();
  await expect(page.getByTestId('learn-step')).toContainText(SECTION.title);
  await expectNoChrome(page);
});
