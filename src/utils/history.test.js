import { describe, it, expect } from 'vitest';
import { entryBaseId, parseHistory, addHistoryEntry } from './history';

const entry = (overrides = {}) => ({
  input: '42',
  fromId: 10,
  fromBase: 10,
  results: { 2: '101010' },
  time: '12:00',
  ...overrides,
});

describe('entryBaseId', () => {
  it('prefers the stored id', () => {
    expect(entryBaseId(entry())).toBe(10);
    expect(entryBaseId(entry({ fromId: 'custom', fromBase: 3 }))).toBe('custom');
  });

  it('maps legacy entries without an id', () => {
    expect(entryBaseId({ fromBase: 16 })).toBe(16);
    expect(entryBaseId({ fromBase: 3 })).toBe('custom');
  });

  it('handles null', () => {
    expect(entryBaseId(null)).toBeNull();
  });
});

describe('parseHistory', () => {
  it('returns an empty list for garbage', () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory('not json')).toEqual([]);
    expect(parseHistory('{"a":1}')).toEqual([]);
    expect(parseHistory('[]')).toEqual([]);
  });

  it('keeps valid entries and drops malformed ones', () => {
    const raw = JSON.stringify([entry(), { input: 'x' }, null, entry({ input: '7' })]);
    expect(parseHistory(raw).map(e => e.input)).toEqual(['42', '7']);
  });

  it('caps the list length', () => {
    const raw = JSON.stringify(Array.from({ length: 30 }, (_, i) => entry({ input: String(i) })));
    expect(parseHistory(raw, 10)).toHaveLength(10);
  });
});

describe('addHistoryEntry', () => {
  it('prepends new entries', () => {
    expect(addHistoryEntry([entry({ input: 'a' })], entry({ input: 'b' }))[0].input).toBe('b');
  });

  it('replaces duplicates of the same input and base', () => {
    const list = [entry({ input: '42' }), entry({ input: '7' })];
    const next = addHistoryEntry(list, entry({ input: '42', time: '13:00' }));
    expect(next).toHaveLength(2);
    expect(next[0].time).toBe('13:00');
  });

  it('treats the same digits in different bases as different entries', () => {
    const list = [entry({ input: '10', fromId: 2, fromBase: 2 })];
    const next = addHistoryEntry(list, entry({ input: '10', fromId: 10, fromBase: 10 }));
    expect(next).toHaveLength(2);
  });

  it('separates the same digits in different custom bases', () => {
    const list = [entry({ input: '10', fromId: 'custom', fromBase: 3, customBase: '3' })];
    const next = addHistoryEntry(list, entry({ input: '10', fromId: 'custom', fromBase: 5, customBase: '5' }));
    expect(next).toHaveLength(2);
    expect(addHistoryEntry(next, entry({ input: '10', fromId: 'custom', fromBase: 5, customBase: '5' }))).toHaveLength(2);
  });

  it('caps the list', () => {
    let list = [];
    for (let i = 0; i < 20; i++) list = addHistoryEntry(list, entry({ input: String(i) }), 10);
    expect(list).toHaveLength(10);
  });
});
