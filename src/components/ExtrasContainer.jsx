import { useState } from 'react';
import BitwiseCalc from './BitwiseCalc';
import AsciiLookup from './AsciiLookup';
import { formatBinary } from '../utils/convert';

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
  const [op, setOp] = useState('AND');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [bits, setBits] = useState(8);
  const [bitwiseResult, setBitwiseResult] = useState(null);
  const [tool, setTool] = useState(null);

  const showBitwiseProof = tool === 'bitwise' && !!bitwiseResult;

  return (
    <>
      <BitwiseCalc
        op={op}
        setOp={(value) => { setOp(value); setTool('bitwise'); }}
        a={a}
        setA={(value) => { setA(value); setTool('bitwise'); }}
        b={b}
        setB={(value) => { setB(value); setTool('bitwise'); }}
        bits={bits}
        setBits={(value) => { setBits(value); setTool('bitwise'); }}
        onResult={setBitwiseResult}
      />
      {showBitwiseProof && <BitwiseProof op={op} a={a} b={b} result={bitwiseResult} />}

      <hr className="divider" />

      <AsciiLookup />
    </>
  );
}
