import { useState } from 'react';
import { getSteps, getFractionalSteps } from '../utils/stepwise';

const ChevronDown = () => (
  <svg className="step-toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function StepPanel({ input, fromBase, toBase, label }) {
  const [open, setOpen] = useState(false);

  const [intPart, fracPart] = (input || '').split('.');
  const steps = getSteps(intPart || '', fromBase, toBase);
  const fracSteps = fracPart ? getFractionalSteps(fracPart, fromBase, toBase) : [];
  const allSteps = [...steps, ...fracSteps];

  const hasSteps = allSteps.length > 0 && fromBase !== toBase;

  // Determine the method explanation
  let methodTitle = '';
  let methodLines = [];

  if (fromBase === 10) {
    methodTitle = 'Repeated Division / Multiplication Method';
    methodLines = [
      `To convert from decimal (Base 10) to Base ${toBase}:`,
      `• Integers: Divide repeatedly by ${toBase}, reading remainders from bottom to top.`,
      `• Fractions: Multiply repeatedly by ${toBase}, reading whole digits from top to bottom.`
    ];
  } else if (toBase === 10) {
    methodTitle = 'Positional Weight Method';
    methodLines = [
      `To convert from Base ${fromBase} to decimal (Base 10):`,
      `• Multiply each digit by ${fromBase} raised to its positional power.`,
      `• Sum all the resulting values together.`
    ];
  } else {
    methodTitle = 'Decimal Bridge Method';
    methodLines = [
      `To convert between two non-decimal bases (Base ${fromBase} → Base ${toBase}):`,
      `• Step 1: Convert the Base ${fromBase} number to Decimal using positional weights.`,
      `• Step 2: Convert that Decimal into Base ${toBase} using repeated division.`
    ];
  }

  if (!hasSteps) return null;

  return (
    <div className="step-panel">
      <button
        className={`step-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>
          {label || `Step-by-step: base\u00A0${fromBase} \u2192 base\u00A0${toBase}`}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div className="step-body slide-down">
          
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '6px' }}>
              {methodTitle}
            </div>
            {methodLines.map((line, i) => (
              <div key={i} style={{ color: 'var(--text-2)', fontSize: '0.75rem', lineHeight: '1.6' }}>
                {line}
              </div>
            ))}
          </div>

          {allSteps.map((step, i) => {
            if (step.type === 'heading') {
              return <div key={i} className="step-heading">{step.text}</div>;
            }
            if (step.type === 'math') {
              return (
                <div key={i}>
                  {step.lines.map((line, j) => (
                    <div key={j} className="step-math-line">{line}</div>
                  ))}
                </div>
              );
            }
            if (step.type === 'result') {
              return <div key={i} className="step-result">{step.text}</div>;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
