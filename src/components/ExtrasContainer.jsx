import { useMemo, useState } from 'react';
import StringCodec from './StringCodec';
import BitwiseCalc from './BitwiseCalc';
import AsciiLookup from './AsciiLookup';
import { formatBinary } from '../utils/convert';

const PROOF_BYTE_LIMIT = 5;

function StringProof({ bytes }) {
  const [tab, setTab] = useState('hex');

  return (
    <section className="proof fade-in" aria-live="polite">
      <div className="section-label">Here&apos;s why — UTF-8 encoding</div>

      <div className="proof-tabs" role="tablist" aria-label="Encoding view">
        <button
          className={`proof-tab ${tab === 'hex' ? 'active' : ''}`}
          onClick={() => setTab('hex')}
          role="tab"
          aria-selected={tab === 'hex'}
        >
          to Hexadecimal
        </button>
        <button
          className={`proof-tab ${tab === 'bin' ? 'active' : ''}`}
          onClick={() => setTab('bin')}
          role="tab"
          aria-selected={tab === 'bin'}
        >
          to Binary
        </button>
      </div>

      <div className="proof-body">
        {bytes.slice(0, PROOF_BYTE_LIMIT).map((byte, i) => (
          <div key={i} className="proof-row">
            <div className="proof-title">
              Byte {i + 1} — {byte} decimal
            </div>
            <div className="step-math-line">Decimal: {byte}</div>
            {tab === 'hex' && (
              <div className="step-math-line proof-amber">
                Hexadecimal: {byte.toString(16).padStart(2, '0').toUpperCase()}
              </div>
            )}
            {tab === 'bin' && (
              <div className="step-math-line proof-green">
                Binary: {byte.toString(2).padStart(8, '0')}
              </div>
            )}
          </div>
        ))}
        {bytes.length > PROOF_BYTE_LIMIT && (
          <div className="proof-more">…and {bytes.length - PROOF_BYTE_LIMIT} more bytes</div>
        )}
      </div>
    </section>
  );
}

function BitwiseProof({ op, a, b, result }) {
  return (
    <section className="proof fade-in" aria-live="polite">
      <div className="section-label">Here&apos;s why — bitwise {op}</div>

      <div className="proof-body">
        <div className="proof-line">
          <span className="proof-muted">A ({a})</span>
          <span className="proof-value num">{formatBinary(result.aBinary)}</span>
        </div>
        {op !== 'NOT' && (
          <div className="proof-line">
            <span className="proof-muted">
              {op.startsWith('SH') ? `Shift by ${b}` : `B (${b})`}
            </span>
            <span className="proof-value num">
              {op.startsWith('SH') ? b : formatBinary(result.bBinary)}
            </span>
          </div>
        )}
        <div className="proof-line proof-result">
          <span>Result</span>
          <span className="proof-value num">{formatBinary(result.binary)}</span>
        </div>
      </div>
    </section>
  );
}

export default function ExtrasContainer() {
  // String state
  const [text, setText] = useState('');
  const [hex, setHex] = useState('');
  const [binary, setBinary] = useState('');
  const [hexError, setHexError] = useState('');
  const [activeTool, setActiveTool] = useState(null);

  // Bitwise state
  const [op, setOp] = useState('AND');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [bits, setBits] = useState(8);
  const [bitwiseResult, setBitwiseResult] = useState(null);

  // The proof must describe the UTF-8 bytes that were actually encoded —
  // not UTF-16 code units, which differ for anything outside ASCII.
  const bytes = useMemo(() => Array.from(new TextEncoder().encode(text)), [text]);
  const showStringProof = activeTool === 'string' && bytes.length > 0 && !hexError;
  const showBitwiseProof = activeTool === 'bitwise' && !!bitwiseResult;

  return (
    <>
      <StringCodec
        text={text}
        setText={(value) => { setText(value); setActiveTool('string'); }}
        hex={hex}
        setHex={(value) => { setHex(value); setActiveTool('string'); }}
        binary={binary}
        setBinary={setBinary}
        hexError={hexError}
        setHexError={setHexError}
      />
      {showStringProof && <StringProof bytes={bytes} />}

      <hr className="divider" />

      <BitwiseCalc
        op={op}
        setOp={(value) => { setOp(value); setActiveTool('bitwise'); }}
        a={a}
        setA={(value) => { setA(value); setActiveTool('bitwise'); }}
        b={b}
        setB={(value) => { setB(value); setActiveTool('bitwise'); }}
        bits={bits}
        setBits={(value) => { setBits(value); setActiveTool('bitwise'); }}
        onResult={setBitwiseResult}
      />
      {showBitwiseProof && <BitwiseProof op={op} a={a} b={b} result={bitwiseResult} />}

      <hr className="divider" />

      <AsciiLookup />
    </>
  );
}
