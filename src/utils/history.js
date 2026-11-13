const STANDARD_BASE_IDS = new Set([2, 8, 10, 16]);

/** History entries created before custom-base support stored only `fromBase`. */
export function entryBaseId(entry) {
  if (!entry) return null;
  return entry.fromId ?? (STANDARD_BASE_IDS.has(entry.fromBase) ? entry.fromBase : 'custom');
}

/** Parse and validate a persisted history list. Never throws. */
export function parseHistory(raw, limit = 10) {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(entry => (
        entry
        && typeof entry.input === 'string'
        && entry.results
        && typeof entry.results === 'object'
      ))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** Insert an entry, replacing any previous conversion with the same input/base. */
export function addHistoryEntry(list, entry, limit = 10) {
  const id = entryBaseId(entry);
  const deduped = list.filter((item) => {
    if (item.input !== entry.input) return true;
    if (entryBaseId(item) !== id) return true;
    if (id === 'custom') return String(item.customBase) !== String(entry.customBase);
    return false;
  });
  return [entry, ...deduped].slice(0, limit);
}
