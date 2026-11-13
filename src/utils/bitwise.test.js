import { describe, it, expect } from 'vitest';
import { computeBitwise } from './bitwise';

const run = (op, a, b, bits) => computeBitwise({ op, a, b, bits });

describe('computeBitwise – logic operations', () => {
  it('computes AND, OR and XOR', () => {
    expect(run('AND', '12', '10', 8).result).toMatchObject({ decimal: '8', binary: '00001000' });
    expect(run('OR', '12', '10', 8).result).toMatchObject({ decimal: '14', binary: '00001110' });
    expect(run('XOR', '12', '10', 8).result).toMatchObject({ decimal: '6', binary: '00000110' });
  });

  it('computes NOT within the selected width', () => {
    expect(run('NOT', '5', '', 8).result).toMatchObject({ decimal: '250', binary: '11111010' });
    expect(run('NOT', '0', '', 16).result?.decimal).toBe('65535');
  });

  it('does not sign-extend 32-bit results', () => {
    const not = run('NOT', '0', '', 32).result;
    expect(not.decimal).toBe('4294967295');
    expect(not.binary).toBe('1'.repeat(32));

    const and = run('AND', '4294967295', '4294967295', 32).result;
    expect(and.decimal).toBe('4294967295');
    expect(and.binary).toHaveLength(32);
  });
});

describe('computeBitwise – shifts', () => {
  it('shifts left and right', () => {
    expect(run('SHL', '3', '2', 8).result.binary).toBe('00001100');
    expect(run('SHR', '12', '2', 8).result.binary).toBe('00000011');
  });

  it('uses a logical shift for wrapped negative values', () => {
    // -1 is 0xFF in 8-bit; >> 2 must be 0b00111111, not 0b11111111.
    expect(run('SHR', '-1', '2', 8).result).toMatchObject({ decimal: '63', binary: '00111111' });
  });

  it('wraps overflow to the register width', () => {
    expect(run('SHL', '128', '1', 8).result.decimal).toBe('0');
    expect(run('AND', '256', '255', 8).result.decimal).toBe('0');
  });

  it('rejects out-of-range shift amounts', () => {
    expect(run('SHL', '1', '8', 8).error).toMatch(/between 0 and 7/);
    expect(run('SHR', '1', '-1', 8).error).toMatch(/between 0 and 7/);
  });
});

describe('computeBitwise – validation', () => {
  it('returns nothing for empty input', () => {
    expect(run('AND', '', '1', 8)).toEqual({ result: null, error: null });
    expect(run('AND', '1', '', 8)).toEqual({ result: null, error: null });
    expect(run('NOT', '', '', 8)).toEqual({ result: null, error: null });
  });

  it('rejects fractions and garbage', () => {
    expect(run('AND', '1.5', '1', 8).error).toMatch(/whole number/);
    expect(run('AND', 'abc', '1', 8).error).toMatch(/whole number/);
    expect(run('SHL', '1', '2.5', 8).error).toMatch(/whole number/);
  });

  it('rejects unknown operations and widths', () => {
    expect(run('NAND', '1', '1', 8).error).toMatch(/Unknown operation/);
    expect(run('AND', '1', '1', 65).error).toMatch(/between 1 and 64/);
  });
});
