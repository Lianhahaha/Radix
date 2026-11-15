/**
 * Arbitrary-precision radix conversion.
 *
 * Integers and fractions are handled with BigInt arithmetic so the displayed
 * result is exact and never limited by IEEE-754 doubles.
 */

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Longest accepted input, in significant characters. Guards against paste bombs. */
const MAX_INPUT_LENGTH = 256;

function digitValue(char) {
  return DIGITS.indexOf(char.toLowerCase());
}

function findInvalidDigit(str, base) {
  for (const char of str.toLowerCase()) {
    if (digitValue(char) < 0 || digitValue(char) >= base) return char;
  }
  return null;
}

function baseError(base) {
  return Number.isInteger(base) && base >= 2 && base <= 36
    ? null
    : `Base must be an integer between 2 and 36 (got ${base})`;
}

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
  if (!input) return { result: '', error: null };

  const fromError = baseError(fromBase);
  if (fromError) return { result: '', error: fromError };
  const toError = baseError(toBase);
  if (toError) return { result: '', error: toError };

  const raw = String(input).replace(/\s+/g, '');
  if (!raw || raw === '-' || raw === '+' || raw === '.') return { result: '', error: null };

  const negative = raw.startsWith('-');
  const body = raw.startsWith('-') || raw.startsWith('+') ? raw.slice(1) : raw;

  if (body.includes('.') && body.split('.').length > 2) {
    return { result: '', error: 'Only one decimal point is allowed' };
  }
  if (body.length > MAX_INPUT_LENGTH) {
    return { result: '', error: `Input is too long (max ${MAX_INPUT_LENGTH} digits)` };
  }

  const [intPart = '', fracPart = ''] = body.split('.');
  if (!intPart && !fracPart) return { result: '', error: null };

  const invalid = findInvalidDigit(intPart, fromBase) || findInvalidDigit(fracPart, fromBase);
  if (invalid) {
    return { result: '', error: `Digit '${invalid}' is not valid in base ${fromBase}` };
  }

  const bigFrom = BigInt(fromBase);
  const bigTo = BigInt(toBase);

  // Integer part: exact Horner evaluation.
  let intValue = 0n;
  for (const char of intPart.toLowerCase()) {
    intValue = intValue * bigFrom + BigInt(digitValue(char));
  }

  // Fraction part: exact rational arithmetic, digit by digit.
  let fracDigits = '';
  if (fracPart) {
    const denominator = bigFrom ** BigInt(fracPart.length);
    let numerator = 0n;
    for (const char of fracPart.toLowerCase()) {
      numerator = numerator * bigFrom + BigInt(digitValue(char));
    }
    const precision = Math.max(0, Math.min(100, fracPrecision));
    for (let i = 0; i < precision && numerator > 0n; i++) {
      numerator *= bigTo;
      fracDigits += (numerator / denominator).toString(toBase).toUpperCase();
      numerator %= denominator;
    }
  }

  const isZero = intValue === 0n && !fracDigits.replace(/0/g, '');
  const sign = negative && !isZero ? '-' : '';
  const intResult = intValue.toString(toBase).toUpperCase();
  const fracResult = fracPart ? `.${fracDigits || '0'}` : '';

  return { result: sign + intResult + fracResult, error: null };
}

/**
 * Format a binary string with spaces every 4 bits (nibble groups).
 */
export function formatBinary(bin) {
  const clean = String(bin).replace(/\s/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Two's complement of a decimal integer for a given bit width.
 * Returns a binary string (without spaces) or null if out of range.
 */
export function twosComplement(decimal, width) {
  if (!Number.isInteger(width) || width < 1) return null;
  let value;
  try {
    value = BigInt(String(decimal).trim());
  } catch {
    return null;
  }

  const span = 1n << BigInt(width);
  const min = -(span >> 1n);
  const max = (span >> 1n) - 1n;
  if (value < min || value > max) return null;

  const encoded = value < 0n ? value + span : value;
  return encoded.toString(2).padStart(width, '0');
}

/**
 * Unsigned binary representation of a non-negative decimal integer.
 * Returns null when the value is negative, not an integer, or too wide.
 */
export function unsignedBits(decimal, width) {
  if (!Number.isInteger(width) || width < 1) return null;
  const text = String(decimal).trim();
  if (!/^\d+$/.test(text)) return null;
  const value = BigInt(text);
  if (value < 0n || value >= 1n << BigInt(width)) return null;
  return value.toString(2).padStart(width, '0');
}
