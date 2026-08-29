/**
 * Generate step-by-step explanation for converting an integer
 * from one base to another.
 *
 * Strategy:
 *   1. If fromBase !== 10 → convert to decimal first (positional expansion).
 *   2. If toBase !== 10   → convert from decimal via repeated division.
 */

const SUPER_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
};

function toSuperscript(num) {
  return String(num).split('').map(c => SUPER_MAP[c] || c).join('');
}
export function getSteps(input, fromBase, toBase) {
  const steps = [];
  if (!input || input === '-') return steps;

  const negative = input.startsWith('-');
  const abs = negative ? input.slice(1) : input;
  const [intPart] = abs.split('.');

  const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fromBase);
  if ([...intPart.toLowerCase()].some(c => !validChars.includes(c))) return steps;

  const fromBigBase = BigInt(fromBase);
  let decimalBig = (intPart || '0').toLowerCase().split('').reduce((acc, ch) => {
    return acc * fromBigBase + BigInt(parseInt(ch, fromBase));
  }, 0n);
  let decimal = Number(decimalBig);
  if (isNaN(decimal)) return steps;

  // ── Step 1: Convert from source base to decimal ──────────────────
  if (fromBase !== 10) {
    steps.push({ type: 'heading', text: `Step 1 — Convert ${intPart.toUpperCase()} (base ${fromBase}) to decimal` });

    const digits = intPart.toLowerCase().split('');
    const n = digits.length;
    const termLines = digits.map((d, i) => {
      const digitVal = parseInt(d, fromBase);
      const power = n - 1 - i;
      const contribution = digitVal * Math.pow(fromBase, power);
      return `  ${d.toUpperCase()} × ${fromBase}${toSuperscript(power)} = ${digitVal} × ${Math.pow(fromBase, power)} = ${contribution}`;
    });

    steps.push({ type: 'math', lines: termLines });
    steps.push({ type: 'result', text: `  Sum = ${decimal}` });
  } else {
    decimal = parseInt(intPart, 10);
    steps.push({ type: 'heading', text: `Input is already decimal: ${decimal}` });
  }

  // ── Step 2: Convert decimal to target base ────────────────────────
  if (toBase !== 10) {
    steps.push({
      type: 'heading',
      text: `Step ${fromBase !== 10 ? '2' : '1'} — Convert ${decimal} (decimal) to base ${toBase}`,
    });

    const divLines = [];
    let n = Math.abs(decimal);
    if (n === 0) {
      divLines.push('  0 ÷ ' + toBase + ' = 0  remainder 0');
    }
    const remainders = [];
    while (n > 0) {
      const q = Math.floor(n / toBase);
      const r = n % toBase;
      divLines.push(`  ${n} ÷ ${toBase} = ${q}  remainder ${r.toString(toBase).toUpperCase()}`);
      remainders.push(r.toString(toBase).toUpperCase());
      n = q;
    }

    steps.push({ type: 'math', lines: divLines });

    const result = remainders.reverse().join('');
    steps.push({
      type: 'result',
      text: `  Read remainders bottom-to-top: ${negative ? '-' : ''}${result || '0'}`,
    });
  }

  if (fromBase === 10 && toBase === 10) {
    steps.push({ type: 'result', text: `Same base — no conversion needed. Result: ${decimal}` });
  }

  return steps;
}

/**
 * Generate steps for fractional conversion (decimal → target base).
 */
export function getFractionalSteps(fracStr, fromBase, toBase, precision = 8) {
  if (!fracStr) return [];

  const steps = [];
  let frac = parseInt(fracStr, fromBase) / Math.pow(fromBase, fracStr.length);

  steps.push({
    type: 'heading',
    text: `Fractional part .${fracStr.toUpperCase()} — repeated multiplication by ${toBase}`,
  });

  const lines = [];
  for (let i = 0; i < precision; i++) {
    const prev = frac; // value BEFORE multiplying
    frac *= toBase;
    const digit = Math.floor(frac);
    lines.push(`  ${prev.toFixed(6)} × ${toBase} = ${frac.toFixed(6)}  → digit ${digit.toString(toBase).toUpperCase()}`);
    frac -= digit;
    if (frac === 0) break;
  }

  steps.push({ type: 'math', lines });
  return steps;
}
