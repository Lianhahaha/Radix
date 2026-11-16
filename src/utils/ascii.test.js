import { describe, it, expect } from 'vitest';
import { charToCode, codeToChar, asciiCategory } from './ascii';

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

  it('classifies printable code points', () => {
    expect(asciiCategory(32)).toBe('Space');
    expect(asciiCategory(48)).toBe('Digit');
    expect(asciiCategory(65)).toBe('Uppercase letter');
    expect(asciiCategory(122)).toBe('Lowercase letter');
    expect(asciiCategory(33)).toBe('Punctuation / symbol');
    expect(asciiCategory(31)).toBeNull();
    expect(asciiCategory('65')).toBe('Uppercase letter');
  });
});
