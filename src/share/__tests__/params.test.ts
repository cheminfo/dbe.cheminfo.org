import { expect, test } from 'vitest';

import { readShareParams } from '../params.ts';

test('a link that says nothing leaves every setting at its default', () => {
  expect(readShareParams({})).toStrictEqual({
    mf: '',
    smiles: '',
    valence: '',
    // No seed at all, rather than seed zero: zero is a seed somebody may pin,
    // so the curated deck has to be a different thing from any number.
    seed: null,
    count: 8,
    level: 'mixed',
    direction: 'both',
  });
});

test('a number past what the tool can serve is brought back inside it', () => {
  const params = readShareParams({ seed: '1000000000', count: '400' });

  expect(params.seed).toBe(999_999);
  expect(params.count).toBe(30);
  expect(readShareParams({ seed: '-5', count: '0' }).seed).toBe(0);
  expect(readShareParams({ count: '0' }).count).toBe(1);
});

test('a number that is not one falls back rather than throwing', () => {
  const params = readShareParams({ seed: 'today', count: '' });

  expect(params.seed).toBe(null);
  expect(params.count).toBe(8);
});

test('a text setting is cut rather than handed on whole', () => {
  const params = readShareParams({
    mf: 'C'.repeat(300),
    smiles: 'C'.repeat(500),
    valence: 'S6,'.repeat(20),
  });

  expect(params.mf).toHaveLength(200);
  expect(params.smiles).toHaveLength(400);
  expect(params.valence).toHaveLength(40);
});

test('a name the series does not know falls back to what it does', () => {
  const params = readShareParams({ level: 'expert', direction: 'draw' });

  expect(params.level).toBe('mixed');
  expect(params.direction).toBe('both');
  expect(readShareParams({ level: 'advanced' }).level).toBe('advanced');
  expect(readShareParams({ direction: 'formula' }).direction).toBe('formula');
});

test('what a link actually carries comes back as written', () => {
  const params = readShareParams({
    mf: 'C2H6OS',
    smiles: 'CS(C)=O',
    valence: 'S6',
    seed: '4271',
    count: '6',
  });

  expect(params).toStrictEqual({
    mf: 'C2H6OS',
    smiles: 'CS(C)=O',
    valence: 'S6',
    seed: 4271,
    count: 6,
    level: 'mixed',
    direction: 'both',
  });
});
