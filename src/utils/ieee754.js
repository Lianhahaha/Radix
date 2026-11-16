/**
 * Convert a decimal number string to IEEE 754 Single (32-bit) and
 * Double (64-bit) representations, including the decoded exponent and the
 * numeric class of the stored value.
 */
export function getIeee754(decimalString) {
  if (!decimalString || decimalString === '-' || decimalString === '.') return null;
  const num = parseFloat(decimalString);
  if (isNaN(num)) return null;

  // Single precision (32-bit)
  const float32 = new Float32Array([num]);
  const int32 = new Uint32Array(float32.buffer)[0];
  const bin32 = int32.toString(2).padStart(32, '0');

  // Double precision (64-bit) — DataView keeps the byte order predictable.
  const dataView = new DataView(new ArrayBuffer(8));
  dataView.setFloat64(0, num, false); // false = big-endian
  const high = dataView.getUint32(0, false).toString(2).padStart(32, '0');
  const low = dataView.getUint32(4, false).toString(2).padStart(32, '0');
  const bin64 = high + low;

  return {
    single: decode(bin32[0], bin32.slice(1, 9), bin32.slice(9), 127),
    double: decode(bin64[0], bin64.slice(1, 12), bin64.slice(12), 1023),
  };
}

/**
 * Decode one float format.
 * @param {string} sign       1 bit
 * @param {string} exponent   raw exponent bits
 * @param {string} mantissa   fraction bits
 * @param {number} bias       127 for single, 1023 for double
 */
function decode(sign, exponent, mantissa, bias) {
  const raw = parseInt(exponent, 2);
  const exponentAllZero = !exponent.includes('1');
  const exponentAllOne = !exponent.includes('0');
  const mantissaZero = !mantissa.includes('1');

  let classification = 'normal';
  if (exponentAllZero) classification = mantissaZero ? 'zero' : 'subnormal';
  else if (exponentAllOne) classification = mantissaZero ? 'infinity' : 'NaN';

  const unbiased = classification === 'normal'
    ? raw - bias
    : classification === 'subnormal'
      ? 1 - bias
      : null;

  return {
    sign,
    exponent,
    mantissa,
    exponentRaw: raw,
    exponentUnbiased: unbiased,
    bias,
    classification,
  };
}
