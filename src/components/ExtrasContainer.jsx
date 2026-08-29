import { useState } from 'react';
import StringCodec from './StringCodec';
import BitwiseCalc from './BitwiseCalc';

export default function ExtrasContainer() {
  const [activeTool, setActiveTool] = useState(null); // 'string' or 'bitwise'
  
  // String State
  const [text, setText] = useState('');
  const [hex, setHex] = useState('');
  const [binary, setBinary] = useState('');
  
  // Bitwise State
  const [op, setOp] = useState('AND');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [bits, setBits] = useState(8);
  const [bitwiseResult, setBitwiseResult] = useState(null);

  const [activeTab, setActiveTab] = useState('hex'); // 'hex' or 'bin' for string

  return (
    <>
      <StringCodec 
        text={text} setText={(val) => { setText(val); setActiveTool('string'); }}
        hex={hex} setHex={(val) => { setHex(val); setActiveTool('string'); }}
        binary={binary} setBinary={setBinary}
      />
      <hr className="divider" style={{ margin: '20px 0' }} />
      <BitwiseCalc 
        op={op} setOp={(val) => { setOp(val); setActiveTool('bitwise'); }}
        a={a} setA={(val) => { setA(val); setActiveTool('bitwise'); }}
        b={b} setB={(val) => { setB(val); setActiveTool('bitwise'); }}
        bits={bits} setBits={(val) => { setBits(val); setActiveTool('bitwise'); }}
        onResult={setBitwiseResult}
      />

      {/* The unified 'Here's why' for the Extras tab */}
      {activeTool === 'string' && text && !hex.includes('Error') && (
        <div style={{ marginTop: '24px' }} className="fade-in">
          <div className="section-label">Here's why (Mathematical Proof)</div>
          
          <div style={{ 
            display: 'flex', 
            marginBottom: '16px', 
            borderBottom: '1px solid var(--border)', 
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            <button 
              className={`tab-btn ${activeTab === 'hex' ? 'active' : ''}`}
              onClick={() => setActiveTab('hex')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'hex' ? 'var(--text)' : 'var(--text-3)',
                padding: '8px 16px',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'hex' ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              to Hexadecimal
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bin' ? 'active' : ''}`}
              onClick={() => setActiveTab('bin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'bin' ? 'var(--text)' : 'var(--text-3)',
                padding: '8px 16px',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'bin' ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              to Binary
            </button>
          </div>

          <div className="step-panel" style={{ margin: 0 }}>
            <div className="step-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from(text).slice(0, 5).map((char, i) => {
                const code = char.charCodeAt(0);
                return (
                  <div key={i} style={{ paddingBottom: '8px', borderBottom: i < Math.min(text.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="step-heading">Step {i + 1} — Encode '{char}'</div>
                    <div className="step-math-line">Decimal (ASCII): {code}</div>
                    {activeTab === 'hex' && (
                      <div className="step-math-line" style={{ color: 'var(--amber)' }}>Hexadecimal: {code.toString(16).padStart(2, '0')}</div>
                    )}
                    {activeTab === 'bin' && (
                      <div className="step-math-line" style={{ color: 'var(--green)' }}>Binary: {code.toString(2).padStart(8, '0')}</div>
                    )}
                  </div>
                );
              })}
              {text.length > 5 && (
                <div className="step-result" style={{ color: 'var(--text-3)' }}>...and {text.length - 5} more characters</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'bitwise' && bitwiseResult && (
        <div style={{ marginTop: '24px' }} className="fade-in">
          <div className="section-label">Here's why (Mathematical Proof)</div>
          
          {/* Tab for consistency, even if there's only one operation */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '16px', 
            borderBottom: '1px solid var(--border)', 
          }}>
            <button 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                padding: '8px 16px',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                cursor: 'default',
                borderBottom: '2px solid var(--accent)',
                whiteSpace: 'nowrap'
              }}
            >
              Bitwise {op}
            </button>
          </div>

          <div className="step-panel" style={{ margin: 0 }}>
            <div className="step-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>A ({a})</span>
                <span style={{ letterSpacing: '2px' }}>{(parseInt(a, 10) >>> 0).toString(2).padStart(bits, '0').slice(-bits)}</span>
              </div>
              {op !== 'NOT' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>{op.startsWith('SH') ? `Shift by ${b}` : `B (${b})`}</span>
                  <span style={{ letterSpacing: '2px' }}>
                    {op.startsWith('SH') ? b : (parseInt(b, 10) >>> 0).toString(2).padStart(bits, '0').slice(-bits)}
                  </span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
                <span>Result</span>
                <span style={{ letterSpacing: '2px' }}>{bitwiseResult.binary}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
