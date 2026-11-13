import { useMemo, useEffect } from 'react';
import { OPERATIONS, computeBitwise } from '../utils/bitwise';

export default function BitwiseCalc({ op, setOp, a, setA, b, setB, bits, setBits, onResult }) {
  const { result, error } = useMemo(
    () => computeBitwise({ op, a, b, bits }),
    [op, a, b, bits],
  );

  useEffect(() => {
    if (onResult) onResult(result);
  }, [result, onResult]);

  const needsB = op !== 'NOT';
  const isShift = op === 'SHL' || op === 'SHR';

  return (
    <div className="bitwise-section">
      <div className="section-label">Bitwise Calculator ({bits}-bit)</div>

      <div className="bitwise-inputs">
        <input
          className="custom-base-input"
          type="text"
          inputMode="numeric"
          placeholder="A (dec)"
          aria-label="Operand A in decimal"
          value={a}
          onChange={e => setA(e.target.value)}
        />

        <select
          className="custom-base-input bitwise-op"
          value={op}
          onChange={e => setOp(e.target.value)}
          aria-label="Bitwise operation"
        >
          {OPERATIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        {needsB && (
          <input
            className="custom-base-input"
            type="text"
            inputMode="numeric"
            placeholder={isShift ? 'Shift by…' : 'B (dec)'}
            aria-label={isShift ? 'Shift amount' : 'Operand B in decimal'}
            value={b}
            onChange={e => setB(e.target.value)}
          />
        )}
      </div>

      <div className="bitwise-widths">
        {[8, 16, 32].map(w => (
          <button
            key={w}
            className={`bit-btn ${bits === w ? 'active' : ''}`}
            onClick={() => setBits(w)}
            aria-pressed={bits === w}
          >
            {w}-bit
          </button>
        ))}
      </div>

      {error && <div className="field-error">{error}</div>}

      {result && (
        <div className="binary-viewer fade-in">
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Result (dec)</span>
            <span className="binary-viewer-value num">{result.decimal}</span>
          </div>
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Result (bin)</span>
            <span className="binary-viewer-value num accent">
              {result.binary.replace(/(.{4})/g, '$1 ').trim()}
            </span>
          </div>
          {result.wrapped && (
            <div className="viewer-note">Input wrapped to the {bits}-bit range.</div>
          )}
        </div>
      )}
    </div>
  );
}
