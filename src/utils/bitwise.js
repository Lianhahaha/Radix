/**
 * Fixed-width bitwise arithmetic.
 *
 * JavaScript's bitwise operators are 32-bit and signed, which corrupts 32-bit
 * results and shifts negative values arithmetically. Everything here is done
 * with BigInt and explicit wrapping to the selected register width instead.
 */

export const OPERATIONS = ['AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR'];

const INTEGER_RE = /^[+-]?\d+$/;

function wrap(value, span) {
  return ((value % span) + span) % span;
}

/**
 * @param {{ op: string, a: string, b: string, bits: number }} input
 * @returns {{ result: {decimal: string, binary: string, wrapped: boolean}|null, error: string|null }}
 */
export function computeBitwise({ op, a, b, bits }) {
  if (!OPERATIONS.includes(op)) return { result: null, error: 'Unknown operation' };
  if (!Number.isInteger(bits) || bits < 1 || bits > 64) {
    return { result: null, error: 'Bit width must be between 1 and 64' };
  }

  const aText = String(a ?? '').trim();
  const bText = String(b ?? '').trim();
  if (!aText) return { result: null, error: null };
  if (!INTEGER_RE.test(aText)) return { result: null, error: 'A must be a whole number' };

  const needsB = op !== 'NOT';
  if (needsB && !bText) return { result: null, error: null };
  if (needsB && !INTEGER_RE.test(bText)) {
    return { result: null, error: op.startsWith('SH') ? 'Shift amount must be a whole number' : 'B must be a whole number' };
  }

  const span = 1n << BigInt(bits);
  const max = span - 1n;
  const aValue = BigInt(aText);

  let raw;
  if (op === 'NOT') {
    raw = max ^ wrap(aValue, span);
  } else if (op === 'SHL' || op === 'SHR') {
    const shiftValue = BigInt(bText);
    if (shiftValue < 0n || shiftValue >= BigInt(bits)) {
      return { result: null, error: `Shift must be between 0 and ${bits - 1}` };
    }
    const shift = Number(shiftValue);
    const wrappedA = wrap(aValue, span);
    raw = op === 'SHL' ? wrappedA << BigInt(shift) : wrappedA >> BigInt(shift);
  } else {
    const bValue = BigInt(bText);
    const left = wrap(aValue, span);
    const right = wrap(bValue, span);
    if (op === 'AND') raw = left & right;
    else if (op === 'OR') raw = left | right;
    else raw = left ^ right;
  }

  const value = wrap(raw, span);
  const wrappedA = wrap(aValue, span) !== aValue;
  const wrappedB = op === 'AND' || op === 'OR' || op === 'XOR'
    ? wrap(BigInt(bText), span) !== BigInt(bText)
    : false;
  return {
    result: {
      decimal: value.toString(),
      binary: value.toString(2).padStart(bits, '0'),
      aBinary: wrap(aValue, span).toString(2).padStart(bits, '0'),
      bBinary: needsB && !op.startsWith('SH') ? wrap(BigInt(bText), span).toString(2).padStart(bits, '0') : null,
      wrapped: wrappedA || wrappedB,
    },
    error: null,
  };
}
