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
});
