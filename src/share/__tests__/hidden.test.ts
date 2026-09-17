import { expect, test } from 'vitest';

import { isSharePartId, parseHidden, serializeHidden } from '../hidden.ts';
import { SHARE_PARTS, SHARE_PART_IDS } from '../parts.ts';

test('an absent parameter hides nothing', () => {
  expect(parseHidden(undefined)).toStrictEqual([]);
  expect(parseHidden('')).toStrictEqual([]);
  expect(serializeHidden([])).toBe('');
});

test('a name the site does not know is dropped, not kept', () => {
  expect(parseHidden('breakdown,sidebar,valences')).toStrictEqual([
    'breakdown',
    'valences',
  ]);
  expect(parseHidden('header')).toStrictEqual([]);
  expect(isSharePartId('breakdown')).toBe(true);
  expect(isSharePartId('sidebar')).toBe(false);
});

test('the parameter is written in one canonical order', () => {
  expect(parseHidden('valences, breakdown ,tabs')).toStrictEqual([
    'tabs',
    'breakdown',
    'valences',
  ]);
  expect(serializeHidden(['valences', 'tabs', 'breakdown'])).toBe(
    'tabs,breakdown,valences',
  );
});

test('parse and serialize are each other, over every part at once', () => {
  const all = serializeHidden(SHARE_PART_IDS);

  expect(all).toBe(SHARE_PART_IDS.join(','));
  expect(parseHidden(all)).toStrictEqual([...SHARE_PART_IDS]);
});

test('every part describes itself for the dialog, and only the bar is chrome', () => {
  expect(SHARE_PART_IDS).toHaveLength(16);
  for (const id of SHARE_PART_IDS) {
    const part = SHARE_PARTS[id];
    expect(part.key).toBe(id);
    expect(part.label.length).toBeGreaterThan(2);
    expect(part.description.length).toBeLessThanOrEqual(80);
  }
  const inHeader = SHARE_PART_IDS.filter(
    (id) => SHARE_PARTS[id].inHeader === true,
  );

  expect(inHeader).toStrictEqual(['tabs']);
  // What a course page has no use for is already off when the dialog opens: the
  // heading it repeats, the worked examples, and the controls that would let a
  // class reroll the problem set it was given.
  expect(
    SHARE_PART_IDS.filter((id) => SHARE_PARTS[id].hiddenByDefault === true),
  ).toStrictEqual(['intro', 'examples', 'series']);
});
