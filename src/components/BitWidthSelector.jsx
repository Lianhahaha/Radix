import { padToBitWidth, twosComplement, formatBinary } from '../utils/convert';

const BIT_WIDTHS = [8, 16, 32, 64];

export default function BitWidthSelector({ binValue, decimalValue, width, setWidth }) {
  const cleanBin = (binValue || '').replace(/[\s-]/g, '');
  const padded = cleanBin ? padToBitWidth(cleanBin, width) : null;
  const twos = decimalValue ? twosComplement(decimalValue, width) : null;

  const isNeg = decimalValue && Number(decimalValue) < 0;

  return (
    <div>
      <div className="bit-width-bar">
        <span className="bit-width-label">Bit width</span>
        {BIT_WIDTHS.map(w => (
          <button
            key={w}
            className={`bit-btn ${width === w ? 'active' : ''}`}
            onClick={() => setWidth(w)}
          >
            {w}-bit
          </button>
        ))}
      </div>

      {binValue && (
        <div className="binary-viewer fade-in">
          <div className="binary-viewer-row">
            <span className="binary-viewer-label">Unsigned ({width}-bit)</span>
            {padded ? (
              <span className="binary-viewer-value">{formatBinary(padded)}</span>
            ) : (
              <span className="overflow-tag">overflow</span>
            )}
          </div>

          {isNeg && (
            <div className="binary-viewer-row">
              <span className="binary-viewer-label">Two&apos;s complement</span>
              {twos ? (
                <span className="binary-viewer-value twos-comp-value">{formatBinary(twos)}</span>
              ) : (
                <span className="overflow-tag">out of range</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
