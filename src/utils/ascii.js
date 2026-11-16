/** Printable ASCII range: 32–126 */
export function charToCode(char) {
  if (typeof char !== 'string' || char.length !== 1) return null;
  const code = char.charCodeAt(0);
  if (!Number.isInteger(code) || code < 32 || code > 126) return null;
  return {
    char,
    decimal: code,
    binary: code.toString(2).padStart(8, '0'),
    octal: code.toString(8),
    hex: code.toString(16).toUpperCase(),
  };
}

export function codeToChar(decimal) {
  const code = Number(decimal);
  if (!Number.isInteger(code) || code < 32 || code > 126) return null;
  return String.fromCharCode(code);
}

/** Human-readable class for a printable ASCII code point. */
export function asciiCategory(decimal) {
  const code = Number(decimal);
  if (!Number.isInteger(code) || code < 32 || code > 126) return null;
  if (code === 32) return 'Space';
  if (code >= 48 && code <= 57) return 'Digit';
  if (code >= 65 && code <= 90) return 'Uppercase letter';
  if (code >= 97 && code <= 122) return 'Lowercase letter';
  return 'Punctuation / symbol';
}
