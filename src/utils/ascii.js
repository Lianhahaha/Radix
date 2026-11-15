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
