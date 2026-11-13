import { describe, it, expect } from 'vitest';
import { charToCode, codeToChar, isValidAsciiChar } from './ascii';

describe('ascii', () => {
  it('maps printable characters to their code points', () => {
    expect(charToCode('A')).toEqual({
      char: 'A',
      decimal: 65,
      binary: '01000001',
      octal: '101',
      hex: '41',
    });
    expect(charToCode(' ')).toMatchObject({ decimal: 32 });
    expect(charToCode('~')).toMatchObject({ decimal: 126, hex: '7E' });
  });

  it('rejects non-printable characters', () => {
    expect(charToCode('\n')).toBeNull();
    expect(charToCode('é')).toBeNull();
    expect(charToCode('')).toBeNull();
  });

  it('maps codes back to characters', () => {
    expect(codeToChar(65)).toBe('A');
    expect(codeToChar('97')).toBe('a');
    expect(codeToChar(31)).toBeNull();
    expect(codeToChar(127)).toBeNull();
    expect(codeToChar(65.5)).toBeNull();
    expect(codeToChar('abc')).toBeNull();
  });

  it('validates single printable characters', () => {
    expect(isValidAsciiChar('A')).toBe(true);
    expect(isValidAsciiChar('AB')).toBe(false);
    expect(isValidAsciiChar('')).toBe(false);
    expect(isValidAsciiChar('é')).toBe(false);
  });
});
