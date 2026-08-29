/**
 * Convert a decimal number string to IEEE 754 Single (32-bit) and Double (64-bit) binary representations.
 */
export function getIeee754(decimalString) {
  if (!decimalString || decimalString === '-' || decimalString === '.') return null;
  const num = parseFloat(decimalString);
  if (isNaN(num)) return null;

  // Single precision (32-bit)
  const float32 = new Float32Array([num]);
  const int32 = new Uint32Array(float32.buffer)[0];
  const bin32 = int32.toString(2).padStart(32, '0');
  
  // Double precision (64-bit)
  const float64 = new Float64Array([num]);
  const int32Array = new Uint32Array(float64.buffer);
  
  // DataView ensures correct endianness reading
  const dataView = new DataView(new ArrayBuffer(8));
  dataView.setFloat64(0, num, false); // false = Big-endian
  const high = dataView.getUint32(0, false).toString(2).padStart(32, '0');
  const low = dataView.getUint32(4, false).toString(2).padStart(32, '0');
  const bin64 = high + low;

  return {
    single: {
      sign: bin32[0],
      exponent: bin32.slice(1, 9),
      mantissa: bin32.slice(9)
    },
    double: {
      sign: bin64[0],
      exponent: bin64.slice(1, 12),
      mantissa: bin64.slice(12)
    }
  };
}
