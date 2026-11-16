import { describe, it, expect } from 'vitest';
import { getIeee754 } from './ieee754';

describe('getIeee754', () => {
  it('returns null for empty or invalid input', () => {
    expect(getIeee754('')).toBeNull();
    expect(getIeee754('-')).toBeNull();
    expect(getIeee754('.')).toBeNull();
    expect(getIeee754('abc')).toBeNull();
  });

  it('encodes 1.0 as sign 0 and a zero mantissa', () => {
    const ieee = getIeee754('1');
    expect(ieee.single.sign).toBe('0');
    expect(ieee.single.exponent).toBe('01111111');
    expect(ieee.single.mantissa).toBe('0'.repeat(23));
    expect(ieee.double.exponent).toBe('01111111111');
    expect(ieee.double.mantissa).toBe('0'.repeat(52));
  });

  it('encodes negative numbers with the sign bit set', () => {
    const ieee = getIeee754('-1');
    expect(ieee.single.sign).toBe('1');
    expect(ieee.double.sign).toBe('1');
  });

  it('encodes 0.5', () => {
    const ieee = getIeee754('0.5');
    expect(ieee.single.sign).toBe('0');
    expect(ieee.single.exponent).toBe('01111110');
    expect(ieee.single.mantissa).toBe('0'.repeat(23));
  });

  it('always returns 32 and 64 bit fields', () => {
    const ieee = getIeee754('3.14');
    expect(ieee.single.sign + ieee.single.exponent + ieee.single.mantissa).toHaveLength(32);
    expect(ieee.double.sign + ieee.double.exponent + ieee.double.mantissa).toHaveLength(64);
  });

  it('decodes the exponent and number class', () => {
    const { single, double } = getIeee754('42');
    expect(single.exponentRaw).toBe(132);
    expect(single.exponentUnbiased).toBe(5);
    expect(single.classification).toBe('normal');
    expect(double.exponentRaw).toBe(1028);
    expect(double.exponentUnbiased).toBe(5);
    expect(double.classification).toBe('normal');
  });

  it('classifies zero, subnormal, infinity and NaN', () => {
    expect(getIeee754('0').single.classification).toBe('zero');
    expect(getIeee754('0').single.exponentUnbiased).toBeNull();

    const tiny = getIeee754('1e-45').single; // smallest float32 subnormal
    expect(tiny.classification).toBe('subnormal');
    expect(tiny.exponentUnbiased).toBe(-126);

    expect(getIeee754('Infinity').single.classification).toBe('infinity');
    expect(getIeee754('1e400').single.classification).toBe('infinity'); // overflows 32-bit
    expect(getIeee754('NaN')).toBeNull(); // the input itself is not a number
  });
});
