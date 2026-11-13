/**
 * Generate step-by-step explanation for converting a number
 * from one base to another.
 *
 * All integer arithmetic uses BigInt so the explanation always matches the
 * exact result produced by convert().
 */

const SUPER_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
};

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const MAX_DIGITS_FOR_STEPS = 120;
const MAX_DIVISION_LINES = 512;

function toSuperscript(num) {
  return String(num).split('').map(c => SUPER_MAP[c] || c).join('');
}

function digitValue(char) {
  return DIGITS.indexOf(char.toLowerCase());
}

function isValidBase(base) {
  return Number.isInteger(base) && base >= 2 && base <= 36;
}

export function getSteps(input, fromBase, toBase) {
  const steps = [];
  if (!input || input === '-') return steps;
  if (!isValidBase(fromBase) || !isValidBase(toBase)) return steps;

  const trimmed = String(input).replace(/\s+/g, '');
  const negative = trimmed.startsWith('-');
  const body = negative ? trimmed.slice(1) : trimmed;
  const [intPart = '', fracPart = ''] = body.split('.');

  if (!intPart && !fracPart) return steps;
  if (!intPart) return steps; // fractions are explained by getFractionalSteps
  if (body.length > MAX_DIGITS_FOR_STEPS) {
    return [{ type: 'result', text: '  This number is too long to explain digit by digit.' }];
  }
  const invalid = [...`${intPart}${fracPart}`.toLowerCase()]
    .find(c => digitValue(c) < 0 || digitValue(c) >= fromBase);
  if (invalid) return steps;

  const bigFrom = BigInt(fromBase);
  const bigTo = BigInt(toBase);
  const sign = negative ? '-' : '';

  // ── Step 1: source base → decimal ────────────────────────────────
  let decimalBig = 0n;
  for (const char of intPart.toLowerCase()) {
    decimalBig = decimalBig * bigFrom + BigInt(digitValue(char));
  }

  if (fromBase !== 10) {
    steps.push({
      type: 'heading',
      text: `Step 1 — Convert ${sign}${intPart.toUpperCase()} (base ${fromBase}) to decimal`,
    });

    const digits = intPart.toLowerCase().split('');
    const n = digits.length;
    const termLines = digits.map((d, i) => {
      const value = digitValue(d);
      const power = n - 1 - i;
      const weight = bigFrom ** BigInt(power);
      return `  ${d.toUpperCase()} × ${fromBase}${toSuperscript(power)} = ${value} × ${weight} = ${BigInt(value) * weight}`;
    });

    steps.push({ type: 'math', lines: termLines });
    steps.push({ type: 'result', text: `  Sum = ${sign}${decimalBig}` });
  } else {
    steps.push({ type: 'heading', text: `Input is already decimal: ${sign}${decimalBig}` });
  }

  // ── Step 2: decimal → target base ────────────────────────────────
  if (toBase !== 10) {
    steps.push({
      type: 'heading',
      text: `Step ${fromBase !== 10 ? '2' : '1'} — Convert ${sign}${decimalBig} (decimal) to base ${toBase}`,
    });

    const divLines = [];
    let n = decimalBig;
    if (n === 0n) {
      divLines.push(`  0 ÷ ${toBase} = 0  remainder 0`);
    }
    const remainders = [];
    while (n > 0n && divLines.length < MAX_DIVISION_LINES) {
      const q = n / bigTo;
      const r = n % bigTo;
      divLines.push(`  ${n} ÷ ${toBase} = ${q}  remainder ${r.toString(toBase).toUpperCase()}`);
      remainders.push(r.toString(toBase).toUpperCase());
      n = q;
    }

    steps.push({ type: 'math', lines: divLines });

    const result = remainders.reverse().join('') || '0';
    steps.push({
      type: 'result',
      text: `  Read remainders bottom-to-top: ${sign}${result}`,
    });
  }

  if (fromBase === 10 && toBase === 10) {
    steps.push({ type: 'result', text: `  Same base — no conversion needed. Result: ${sign}${decimalBig}` });
  }

  return steps;
}

function formatFraction(value) {
  return String(Number(value.toFixed(8)));
}

/**
 * Generate steps for the fractional part (source base → target base).
 *
 * Uses exact rational arithmetic, so both the printed digits and the
 * repeating-cycle detection are correct.
 */
export function getFractionalSteps(fracStr, fromBase, toBase, precision = 8) {
  if (!fracStr || !isValidBase(fromBase) || !isValidBase(toBase)) return [];

  const digits = fracStr.toLowerCase();
  if ([...digits].some(c => digitValue(c) < 0 || digitValue(c) >= fromBase)) return [];

  const bigFrom = BigInt(fromBase);
  const bigTo = BigInt(toBase);
  let numerator = 0n;
  for (const char of digits) numerator = numerator * bigFrom + BigInt(digitValue(char));
  let denominator = bigFrom ** BigInt(digits.length);

  const steps = [{
    type: 'heading',
    text: `Fractional part .${fracStr.toUpperCase()} — repeated multiplication by ${toBase}`,
  }];

  const lines = [];
  const seen = new Map();
  let cycleStart = -1;

  for (let i = 0; i < precision && numerator > 0n; i++) {
    if (seen.has(numerator)) {
      cycleStart = seen.get(numerator);
      break;
    }
    seen.set(numerator, i);

    const prev = Number(numerator) / Number(denominator);
    numerator *= bigTo;
    const digit = numerator / denominator;
    numerator %= denominator;
    const next = Number(numerator) / Number(denominator);

    lines.push(
      `  ${formatFraction(prev)} × ${toBase} = ${formatFraction(prev * toBase)}  → digit ${digit.toString(toBase).toUpperCase()}`,
    );
    if (next === 0) break;
  }

  steps.push({ type: 'math', lines });
  if (cycleStart >= 0) {
    steps.push({
      type: 'result',
      text: `  The expansion repeats every ${seen.size - cycleStart} digits — it has no exact finite form.`,
    });
  }

  return steps;
}
