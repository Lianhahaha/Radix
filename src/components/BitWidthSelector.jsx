import { unsignedBits, twosComplement, formatBinary } from '../utils/convert';

const BIT_WIDTHS = [8, 16, 32, 64];
const INTEGER_RE = /^-?\d+$/;

export default function BitWidthSelector({ decimalValue, width, setWidth }) {
  const decimal = (decimalValue || '').trim();
  const isInteger = INTEGER_RE.test(decimal);
  const isNegative = decimal.startsWith('-');

  const unsigned = isInteger ? unsignedBits(decimal, width) : null;
  const twos = isInteger && isNegative ? twosComplement(decimal, width) : null;

  return (
    <div>
      <div className="bit-width-bar">
        <span className="bit-width-label">Bit width</span>
        {BIT_WIDTHS.map(w => (
          <button
            key={w}
            className={`bit-btn ${width === w ? 'active' : ''}`}
            onClick={() => setWidth(w)}
            aria-pressed={width === w}
          >
            {w}-bit
          </button>
        ))}
      </div>

      {decimal && !isInteger && (
        <div className="binary-viewer">
          <div className="viewer-note" style={{ margin: 0 }}>
            Bit-width views apply to whole numbers. This value has a fractional part.
          </div>
        </div>
      )}

      {isInteger && (
        <div className="binary-viewer fade-in">
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Unsigned ({width}-bit)</span>
            {unsigned ? (
              <span className="binary-viewer-value num">{formatBinary(unsigned)}</span>
            ) : (
              <span className="overflow-tag">{isNegative ? 'negative' : 'overflow'}</span>
            )}
          </div>

          {isNegative && (
            <div className="binary-viewer-row">
              <span className="binary-viewer-label">Two&apos;s complement</span>
              {twos ? (
                <span className="binary-viewer-value twos-comp-value num">{formatBinary(twos)}</span>
              ) : (
                <span className="overflow-tag">out of range</span>
              )}
            </div>
          )}

          <div className="viewer-note">
            {isNegative
              ? `Signed range: −${(2n ** BigInt(width - 1)).toLocaleString()} … ${(2n ** BigInt(width - 1) - 1n).toLocaleString()}`
              : `Unsigned range: 0 … ${(2n ** BigInt(width) - 1n).toLocaleString()}`}
          </div>
        </div>
      )}
    </div>
  );
}
