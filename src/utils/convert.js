/**
 * Convert a number string from one base to another.
 * Supports integers and fractions (e.g. "3.14").
 * @param {string} input
 * @param {number} fromBase
 * @param {number} toBase
 * @param {number} fracPrecision  – max fractional digits in output
 * @returns {{ result: string, error: string|null }}
 */
export function convert(input, fromBase, toBase, fracPrecision = 10) {
  if (!input || input === '-') return { result: '', error: null };

  const negative = input.startsWith('-');
  const abs = negative ? input.slice(1) : input;
  const [intPart, fracPart] = abs.split('.');

  // Validate characters against fromBase
  const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fromBase);
  const invalidInt = [...intPart.toLowerCase()].find(c => !validChars.includes(c));
  if (invalidInt) {
    return { result: '', error: `Digit '${invalidInt}' is not valid in base ${fromBase}` };
  }
  if (fracPart) {
    const invalidFrac = [...fracPart.toLowerCase()].find(c => !validChars.includes(c));
    if (invalidFrac) {
      return { result: '', error: `Digit '${invalidFrac}' is not valid in base ${fromBase}` };
    }
  }

  // Parse integer part to decimal BigInt for full precision (avoids parseInt float truncation)
  let decimalInt;
  try {
    const fromBigBase = BigInt(fromBase);
    decimalInt = (intPart || '0').toLowerCase().split('').reduce((acc, ch) => {
      const val = BigInt(parseInt(ch, fromBase));
      return acc * fromBigBase + val;
    }, 0n);
  } catch {
    return { result: '', error: 'Invalid number' };
  }

  const intResult = decimalInt.toString(toBase).toUpperCase();

  let fracResult = '';
  if (fracPart !== undefined) {
    // Convert fractional part using repeated multiplication
    let frac = parseInt(fracPart, fromBase) / Math.pow(fromBase, fracPart.length);
    let digits = '';
    let seen = new Map();
    for (let i = 0; i < fracPrecision; i++) {
      frac *= toBase;
      const digit = Math.floor(frac);
      const key = frac.toFixed(12);
      if (seen.has(key)) break; // repeating — stop
      seen.set(key, true);
      digits += digit.toString(toBase).toUpperCase();
      frac -= digit;
      if (frac === 0) break;
    }
    fracResult = '.' + (digits || '0');
  }

  const sign = negative ? '-' : '';
  return { result: sign + intResult + fracResult, error: null };
}

/**
 * Format a binary string with spaces every 4 bits (nibble groups).
 */
export function formatBinary(bin) {
  const clean = bin.replace(/\s/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Pad binary representation to a given bit width.
 * Returns null if number doesn't fit (unsigned).
 */
export function padToBitWidth(binStr, width) {
  const clean = binStr.replace(/\s/g, '').replace(/^-/, '');
  if (clean.length > width) return null; // overflow
  return clean.padStart(width, '0');
}

/**
 * Two's complement of a decimal integer for a given bit width.
 * Returns binary string (without spaces) or null if out of range.
 */
export function twosComplement(decimal, width) {
  const n = Number(decimal);
  if (!Number.isInteger(n)) return null;

  const min = -(2 ** (width - 1));
  const max = 2 ** (width - 1) - 1;
  if (n < min || n > max) return null;

  if (n >= 0) return n.toString(2).padStart(width, '0');
  // Negative: add 2^width
  return (2 ** width + n).toString(2);
}

/**
 * Get all standard base representations at once.
 */
export function convertAll(input, fromBase) {
  const bases = { 2: '', 8: '', 10: '', 16: '' };
  for (const toBase of Object.keys(bases)) {
    const { result } = convert(input, fromBase, Number(toBase));
    bases[toBase] = result;
  }
  return bases;
}
