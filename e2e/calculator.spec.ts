/**
 * The tool at `/`: a formula read one way, a drawing read the other, and the
 * sentence under them saying whether the two agree.
 *
 * The sulfoxide case below is the site's whole subject end to end — the formula
 * rule counts sulfur at two bonds, dimethyl sulfoxide draws it at four, the two
 * numbers part company, and one chip closes the gap. If only one test of this
 * suite is ever read, it is that one.
 *
 * Every number asserted here is the one `src/dbe` computes and the domain tests
 * pin: benzene 1 ring and 3 pi bonds, dimethyl sulfoxide 0 rings and 1 pi bond
 * against a formula reading 0.
 */

import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

/** Dimethyl sulfoxide, as a teacher would retype it into a link. */
const SULFOXIDE = 'CS(C)=O';

/** What openchemlib-utils reads off that drawing, in cheminfo notation. */
const SULFOXIDE_MF = 'C2H6OS';

test('the formula box is read element by element, one row each', async ({
  page,
}) => {
  await page.goto('/');
  const formula = page.getByTestId('formula-input');
  // The row headings of the table's body: one element each, in the order the
  // formula writes them.
  const elements = page.getByTestId('formula-breakdown').locator('tbody th');

  await formula.fill('C6H6');
  await expect(page.getByTestId('formula-dbe')).toHaveText('4');
  await expect(elements).toHaveText(['C', 'H']);

  // Aspirin brings the element that contributes nothing, and it still gets a
  // line of its own: a student has to see the zero to believe it.
  await formula.fill('C9H8O4');
  await expect(page.getByTestId('formula-dbe')).toHaveText('6');
  await expect(elements).toHaveText(['C', 'H', 'O']);
});

test('a sulfoxide is where the formula and the drawing part company', async ({
  page,
}) => {
  await page.goto('/');

  await drawFromNotation(page, SULFOXIDE);

  // The drawing counts what it draws: no ring, and the S=O is one pi bond.
  await expect(page.getByTestId('structure-dbe')).toHaveText('1');
  await expect(structureStat(page, 'Rings')).toHaveText('0');
  await expect(structureStat(page, 'Pi bonds')).toHaveText('1');

  // The formula box follows the drawing until somebody types in it, so the
  // comparison needs nothing typed twice.
  await expect(page.getByTestId('formula-input')).toHaveValue(SULFOXIDE_MF);
  await expect(page.getByTestId('formula-dbe')).toHaveText('0');

  // The sentence names the atom responsible and the valence that settles it.
  const callout = page.getByTestId('compare-callout');
  await expect(callout).toContainText('The drawing counts 1 and the formula 0');
  await expect(callout).toContainText('the S is drawn making 4 bonds');
  await expect(callout).toContainText('S(IV)');

  // One chip, and the formula rule is asked the question the drawing answered.
  await page.getByTestId('valence-chip-S4').click();

  await expect(page.getByTestId('formula-dbe')).toHaveText('1');
  await expect(page.getByTestId('structure-dbe')).toHaveText('1');
  await expect(callout).toContainText('Both count 1');
});

test('a molecule the standard table fits reads the same on both sides', async ({
  page,
}) => {
  await page.goto('/');

  await drawFromNotation(page, 'c1ccccc1');

  // Benzene: one ring and three pi bonds, and C6H6 says 4 without being told.
  await expect(page.getByTestId('structure-dbe')).toHaveText('4');
  await expect(structureStat(page, 'Rings')).toHaveText('1');
  await expect(structureStat(page, 'Pi bonds')).toHaveText('3');
  await expect(page.getByTestId('formula-input')).toHaveValue('C6H6');
  await expect(page.getByTestId('formula-dbe')).toHaveText('4');
  await expect(page.getByTestId('compare-callout')).toContainText(
    'Both count 4',
  );
});

test('a link carrying a formula and a valence opens on that reading', async ({
  page,
}) => {
  // The pair a course page hands out: the molecule, and the assumption to read
  // it under. Dimethyl sulfone counts 2 in the drawing, and the formula rule
  // reaches it only with sulfur at six bonds.
  await page.goto('/?mf=C2H6O2S&valence=S6');

  await expect(page.getByTestId('formula-input')).toHaveValue('C2H6O2S');
  await expect(page.getByTestId('formula-dbe')).toHaveText('2');
});

/**
 * Put a structure on the canvas by writing it down rather than drawing it.
 *
 * The box commits on Enter, not on every keystroke: a half-typed SMILES must
 * never reseed the canvas under somebody's pen.
 * @param page - The page under test.
 * @param notation - The structure, as SMILES.
 */
async function drawFromNotation(page: Page, notation: string): Promise<void> {
  const box = page.getByTestId('structure-input');
  await box.fill(notation);
  await box.press('Enter');
}

/**
 * One of the counts the structure readout lists, located by the word above it.
 *
 * The readout is a description list, so the number is asserted against the term
 * that names it rather than against the readout as a whole — `0` somewhere in a
 * panel of six counts says nothing.
 * @param page - The page under test.
 * @param label - The term, exactly as the readout writes it: `Rings`.
 * @returns The number under it.
 */
function structureStat(page: Page, label: string): Locator {
  return page
    .getByTestId('structure-breakdown')
    .locator('.calc-stats__item')
    .filter({ hasText: new RegExp(`^${label}`) })
    .locator('dd');
}
