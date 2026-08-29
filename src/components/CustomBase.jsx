import { useState, useEffect } from 'react';
import { convert } from '../utils/convert';
import StepPanel from './StepPanel';

export default function CustomBase({ decimalValue, customBase, setCustomBase, hasUserTyped }) {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const b = parseInt(customBase, 10);
    if (!customBase) { setResult(''); setError(''); return; }
    if (isNaN(b) || b < 2 || b > 36) {
      setError('Base must be between 2 and 36.');
      setResult('');
      return;
    }
    if (!decimalValue) { setResult(''); setError(''); return; }
    
    const { result: r, error: e } = convert(decimalValue, 10, b);
    setResult(r);
    setError(e || '');
  }, [decimalValue, customBase]);

  const handleBaseChange = (val) => {
    setCustomBase(val);
  };

  const parsedBase = parseInt(customBase, 10);
  const isValidBase = !isNaN(parsedBase) && parsedBase >= 2 && parsedBase <= 36;

  return (
    <div className="custom-base-section">
      <div className="section-label">Custom base</div>
      <div className="custom-base-row">
        <div>
          <input
            className="custom-base-input"
            type="number"
            min={2}
            max={36}
            placeholder="Base"
            value={customBase}
            onChange={e => handleBaseChange(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="base-row" style={{ margin: 0 }}>
          <input
            className="base-input-field"
            value={result}
            readOnly
            placeholder={customBase ? '—' : 'Enter a base above'}
          />
        </div>
      </div>
      {error && <div className="error-msg">{error}</div>}
      
      {result && !error && isValidBase && hasUserTyped && (
        <div style={{ marginTop: 16 }}>
          <StepPanel input={decimalValue.toString()} fromBase={10} toBase={parsedBase} label="Here's why" />
        </div>
      )}
    </div>
  );
}
