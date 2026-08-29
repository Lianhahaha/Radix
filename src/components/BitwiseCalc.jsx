import { useEffect } from 'react';

const OPERATIONS = ['AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR'];

export default function BitwiseCalc({ op, setOp, a, setA, b, setB, bits, setBits, onResult }) {

  const calculate = () => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    
    // For NOT, only A is used
    if (isNaN(numA) && a !== '') return null;
    if (op !== 'NOT' && isNaN(numB) && b !== '') return null;
    if (a === '' || (b === '' && op !== 'NOT')) return null;

    let res = 0;
    const mask = bits === 32 ? 0xFFFFFFFF : (1 << bits) - 1;

    switch (op) {
      case 'AND': res = numA & numB; break;
      case 'OR':  res = numA | numB; break;
      case 'XOR': res = numA ^ numB; break;
      case 'NOT': res = ~numA; break;
      case 'SHL': res = numA << numB; break;
      case 'SHR': res = numA >> numB; break;
      default: return null;
    }

    // Apply bit mask to simulate fixed width (e.g., 8-bit, 16-bit)
    // In JS bitwise ops are 32-bit signed. 
    // We mask to unsigned N-bits to display properly.
    const unsignedRes = (res >>> 0) & mask;
    
    return {
      decimal: unsignedRes,
      binary: unsignedRes.toString(2).padStart(bits, '0')
    };
  };

  const result = calculate();

  useEffect(() => {
    if (onResult) {
      onResult(result);
    }
  }, [result?.binary, result?.decimal]); // Only trigger when result values change to prevent infinite loops

  return (
    <div className="bitwise-section" style={{ marginTop: '24px' }}>
      <div className="section-label">Bitwise Calculator ({bits}-bit)</div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          className="custom-base-input"
          type="number"
          placeholder="A (dec)"
          value={a}
          onChange={e => setA(e.target.value)}
          style={{ flex: 1 }}
        />
        
        <select 
          className="custom-base-input" 
          value={op} 
          onChange={e => setOp(e.target.value)}
          style={{ width: 'auto', flex: 0 }}
        >
          {OPERATIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        {op !== 'NOT' && (
          <input
            className="custom-base-input"
            type="number"
            placeholder={op.startsWith('SH') ? "Shift by..." : "B (dec)"}
            value={b}
            onChange={e => setB(e.target.value)}
            style={{ flex: 1 }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[8, 16, 32].map(w => (
          <button
            key={w}
            className={`bit-btn ${bits === w ? 'active' : ''}`}
            onClick={() => setBits(w)}
            style={{ flex: 1 }}
          >
            {w}-bit
          </button>
        ))}
      </div>

      {result && (
        <div className="binary-viewer fade-in">
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Result (dec)</span>
            <span className="binary-viewer-value" style={{ color: 'var(--text)' }}>
              {result.decimal}
            </span>
          </div>
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Result (bin)</span>
            <span className="binary-viewer-value" style={{ color: 'var(--accent-hi)' }}>
              {result.binary.replace(/(.{4})/g, '$1 ').trim()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
