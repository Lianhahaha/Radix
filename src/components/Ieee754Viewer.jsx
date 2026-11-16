import { getIeee754 } from '../utils/ieee754';

function describe(parts) {
  const sign = parts.sign === '0' ? '+' : '−';
  if (parts.classification === 'zero') return `${sign} zero`;
  if (parts.classification === 'subnormal') return `${sign} subnormal · exponent 0`;
  if (parts.classification === 'infinity') return `${sign} infinity · exponent at maximum`;
  if (parts.classification === 'NaN') return 'not a number · exponent at maximum';
  return `${sign} normal · exponent ${parts.exponentRaw} − ${parts.bias} = ${parts.exponentUnbiased}`;
}

function PrecisionBlock({ label, bits }) {
  return (
    <div className="binary-viewer fade-in">
      <div className="binary-viewer-label">{label}</div>
      <div className="ieee-bits">
        <span className="ieee-sign" title="Sign bit">{bits.sign}</span>
        <span className="ieee-exp" title="Exponent bits">{bits.exponent}</span>
        <span className="ieee-mant" title="Mantissa bits">{bits.mantissa}</span>
      </div>
      <div className="ieee-meta">{describe(bits)}</div>
    </div>
  );
}

export default function Ieee754Viewer({ decimalValue }) {
  const ieee = getIeee754(decimalValue);
  if (!ieee) return null;

  return (
    <div className="ieee-section">
      <div className="section-label">IEEE 754 Floating Point</div>

      <PrecisionBlock label="Single precision (32-bit)" bits={ieee.single} />
      <PrecisionBlock label="Double precision (64-bit)" bits={ieee.double} />

      <div className="ieee-legend">
        <span><span className="ieee-sign">■</span> Sign</span>
        <span><span className="ieee-exp">■</span> Exponent</span>
        <span><span className="ieee-mant">■</span> Mantissa</span>
      </div>
    </div>
  );
}
