import { describe, it, expect } from 'vitest';
import {
  convert,
  convertAll,
  formatBinary,
  padToBitWidth,
  twosComplement,
  unsignedBits,
} from './convert';

describe('convert – integers', () => {
  it('converts between the standard bases', () => {
    expect(convert('1010', 2, 10).result).toBe('10');
    expect(convert('255', 10, 16).result).toBe('FF');
    expect(convert('2A', 16, 2).result).toBe('101010');
    expect(convert('ff', 16, 10).result).toBe('255');
    expect(convert('777', 8, 10).result).toBe('511');
    expect(convert('511', 10, 8).result).toBe('777');
    expect(convert('0', 10, 2).result).toBe('0');
    expect(convert('000', 10, 2).result).toBe('0');
  });

  it('supports bases up to 36', () => {
    expect(convert('ZZ', 36, 10).result).toBe('1295');
    expect(convert('1295', 10, 36).result).toBe('ZZ');
    expect(convert('35', 10, 36).result).toBe('Z');
    expect(convert('10', 2, 36).result).toBe('2');
  });

  it('keeps the sign', () => {
    expect(convert('-5', 10, 2).result).toBe('-101');
    expect(convert('-101', 2, 16).result).toBe('-5');
    expect(convert('-0', 10, 2).result).toBe('0');
    expect(convert('+42', 10, 16).result).toBe('2A');
  });

  it('ignores grouping whitespace', () => {
    expect(convert('1010 1010', 2, 16).result).toBe('AA');
    expect(convert(' 42 ', 10, 2).result).toBe('101010');
  });

  it('is exact beyond Number.MAX_SAFE_INTEGER', () => {
    const input = '9007199254740993';
    expect(convert(input, 10, 2).result).toBe(BigInt(input).toString(2).toUpperCase());
    expect(convert(input, 10, 16).result).toBe(BigInt(input).toString(16).toUpperCase());
  });
});

describe('convert – fractions', () => {
  it('converts exact binary fractions', () => {
    expect(convert('0.1', 2, 10).result).toBe('0.5');
    expect(convert('0.1101', 2, 10).result).toBe('0.8125');
    expect(convert('0.5', 10, 2).result).toBe('0.1');
    expect(convert('3.75', 10, 2).result).toBe('11.11');
  });

  it('truncates repeating expansions to the requested precision', () => {
    expect(convert('0.1', 10, 2, 10).result).toBe('0.0001100110');
    expect(convert('0.1', 10, 2, 20).result).toBe('0.00011001100110011001');
  });

  it('handles degenerate dots without producing NaN', () => {
    expect(convert('3.', 10, 2)).toEqual({ result: '11', error: null });
    expect(convert('.5', 10, 2)).toEqual({ result: '0.1', error: null });
    expect(convert('.', 10, 2)).toEqual({ result: '', error: null });
  });

  it('keeps the sign on fractional values', () => {
    expect(convert('-1.5', 10, 2).result).toBe('-1.1');
  });
});

describe('convert – validation', () => {
  it('rejects digits outside the source base', () => {
    expect(convert('2', 2, 10).error).toMatch(/not valid in base 2/);
    expect(convert('z', 10, 2).error).toMatch(/not valid in base 10/);
    expect(convert('1.2', 2, 10).error).toMatch(/not valid in base 2/);
  });

  it('rejects malformed input instead of silently truncating', () => {
    expect(convert('3.4.5', 10, 2).error).toMatch(/one decimal point/);
    expect(convert('1'.repeat(300), 10, 2).error).toMatch(/too long/);
  });

  it('rejects invalid bases', () => {
    expect(convert('10', 1, 10).error).toMatch(/between 2 and 36/);
    expect(convert('10', 10, 37).error).toMatch(/between 2 and 36/);
    expect(convert('10', 10.5, 2).error).toMatch(/between 2 and 36/);
  });

  it('treats empty and lone signs as empty input', () => {
    expect(convert('', 10, 2)).toEqual({ result: '', error: null });
    expect(convert('-', 10, 2)).toEqual({ result: '', error: null });
  });
});

describe('formatBinary', () => {
  it('groups bits in nibbles', () => {
    expect(formatBinary('10101010')).toBe('1010 1010');
    expect(formatBinary('101')).toBe('101');
    expect(formatBinary('')).toBe('');
  });
});

describe('padToBitWidth', () => {
  it('pads positive values', () => {
    expect(padToBitWidth('101', 8)).toBe('00000101');
  });

  it('reports overflow and negatives', () => {
    expect(padToBitWidth('100000000', 8)).toBeNull();
    expect(padToBitWidth('-101', 8)).toBeNull();
  });
});

describe('twosComplement', () => {
  it('encodes positive and negative values', () => {
    expect(twosComplement(5, 8)).toBe('00000101');
    expect(twosComplement(-5, 8)).toBe('11111011');
    expect(twosComplement(-128, 8)).toBe('10000000');
    expect(twosComplement(127, 8)).toBe('01111111');
  });

  it('is exact at 64 bits', () => {
    expect(twosComplement(-1, 64)).toBe('1'.repeat(64));
    expect(twosComplement(-5, 64)).toBe((2n ** 64n - 5n).toString(2));
    expect(twosComplement(0, 64)).toBe('0'.repeat(64));
  });

  it('rejects out-of-range and non-integer input', () => {
    expect(twosComplement(128, 8)).toBeNull();
    expect(twosComplement(-129, 8)).toBeNull();
    expect(twosComplement(1.5, 8)).toBeNull();
    expect(twosComplement('abc', 8)).toBeNull();
  });
});

describe('unsignedBits', () => {
  it('encodes non-negative integers', () => {
    expect(unsignedBits('5', 8)).toBe('00000101');
    expect(unsignedBits('255', 8)).toBe('11111111');
    expect(unsignedBits('255', 16)).toBe('0000000011111111');
  });

  it('rejects negatives, fractions and overflow', () => {
    expect(unsignedBits('-5', 8)).toBeNull();
    expect(unsignedBits('1.5', 8)).toBeNull();
    expect(unsignedBits('256', 8)).toBeNull();
  });
});

describe('convertAll', () => {
  it('returns every standard base', () => {
    expect(convertAll('42', 10)).toEqual({ 2: '101010', 8: '52', 10: '42', 16: '2A' });
  });
});
