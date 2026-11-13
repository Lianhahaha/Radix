import { describe, it, expect } from 'vitest';
import { getSteps, getFractionalSteps } from './stepwise';

const textOf = (steps) => steps.map(s => s.text || (s.lines || []).join('\n')).join('\n');

describe('getSteps', () => {
  it('explains positional expansion into decimal', () => {
    const steps = getSteps('1010', 2, 10);
    expect(steps[0].text).toBe('Step 1 — Convert 1010 (base 2) to decimal');
    expect(steps[1].lines[0]).toBe('  1 × 2³ = 1 × 8 = 8');
    expect(textOf(steps)).toContain('Sum = 10');
  });

  it('explains repeated division from decimal', () => {
    const steps = getSteps('13', 10, 2);
    expect(steps[0].text).toBe('Input is already decimal: 13');
    expect(steps[2].lines).toContain('  13 ÷ 2 = 6  remainder 1');
    expect(textOf(steps)).toContain('Read remainders bottom-to-top: 1101');
  });

  it('bridges through decimal for non-decimal pairs', () => {
    const steps = getSteps('2A', 16, 2);
    expect(steps[0].text).toContain('base 16');
    expect(steps.some(s => s.text && s.text.startsWith('Step 2'))).toBe(true);
    expect(textOf(steps)).toContain('Read remainders bottom-to-top: 101010');
  });

  it('keeps the sign', () => {
    const steps = getSteps('-5', 10, 2);
    expect(textOf(steps)).toContain('Input is already decimal: -5');
    expect(textOf(steps)).toContain('Read remainders bottom-to-top: -101');
  });

  it('handles zero', () => {
    const steps = getSteps('0', 10, 16);
    expect(textOf(steps)).toContain('0 ÷ 16 = 0  remainder 0');
    expect(textOf(steps)).toContain('Read remainders bottom-to-top: 0');
  });

  it('handles bases above 10', () => {
    const steps = getSteps('255', 10, 36);
    expect(textOf(steps)).toContain('Read remainders bottom-to-top: 73');
  });

  it('is exact for values beyond Number.MAX_SAFE_INTEGER', () => {
    const input = '9007199254740993';
    const steps = getSteps(input, 10, 2);
    expect(textOf(steps)).toContain(BigInt(input).toString(2));
  });

  it('bails out instead of hanging on huge inputs', () => {
    const steps = getSteps('9'.repeat(500), 10, 2);
    expect(steps).toEqual([{ type: 'result', text: '  This number is too long to explain digit by digit.' }]);
  });

  it('returns nothing for invalid input or bases', () => {
    expect(getSteps('2', 2, 10)).toEqual([]);
    expect(getSteps('', 10, 2)).toEqual([]);
    expect(getSteps('10', 1, 2)).toEqual([]);
    expect(getSteps('10', 10, 99)).toEqual([]);
  });

  it('leaves fractions to getFractionalSteps', () => {
    expect(getSteps('.5', 10, 2)).toEqual([]);
  });
});

describe('getFractionalSteps', () => {
  it('shows the repeated multiplication digits', () => {
    const steps = getFractionalSteps('1', 10, 2, 4);
    expect(steps[0].text).toContain('repeated multiplication');
    expect(steps[1].lines).toHaveLength(4);
    expect(steps[1].lines[3]).toContain('→ digit 1');
  });

  it('detects repeating expansions', () => {
    const steps = getFractionalSteps('1', 10, 2, 8);
    expect(steps[1].lines).toHaveLength(5);
    expect(steps[2].text).toContain('repeats every 4 digits');
  });

  it('stops on an exact expansion', () => {
    const steps = getFractionalSteps('1', 2, 10, 8);
    expect(steps[1].lines).toHaveLength(1);
    expect(steps[1].lines[0]).toContain('digit 5');
    expect(steps).toHaveLength(2);
  });

  it('returns nothing for invalid input', () => {
    expect(getFractionalSteps('', 10, 2)).toEqual([]);
    expect(getFractionalSteps('2', 2, 10)).toEqual([]);
  });
});
