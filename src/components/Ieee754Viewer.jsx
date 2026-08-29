import { getIeee754 } from '../utils/ieee754';

export default function Ieee754Viewer({ decimalValue }) {
  const ieee = getIeee754(decimalValue);

  if (!ieee) return null;

  return (
    <div className="ieee-section" style={{ marginTop: '24px' }}>
      <div className="section-label">IEEE 754 Floating Point</div>
      
      <div className="binary-viewer fade-in" style={{ marginBottom: '12px' }}>
        <div className="binary-viewer-label" style={{ marginBottom: '8px' }}>Single Precision (32-bit)</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', wordBreak: 'break-all', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent-hi)' }} title="Sign bit (1 bit)">{ieee.single.sign}</span>
          <span style={{ color: 'var(--amber)' }} title="Exponent (8 bits)">{ieee.single.exponent}</span>
          <span style={{ color: 'var(--green)' }} title="Mantissa/Fraction (23 bits)">{ieee.single.mantissa}</span>
        </div>
      </div>

      <div className="binary-viewer fade-in">
        <div className="binary-viewer-label" style={{ marginBottom: '8px' }}>Double Precision (64-bit)</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', wordBreak: 'break-all', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent-hi)' }} title="Sign bit (1 bit)">{ieee.double.sign}</span>
          <span style={{ color: 'var(--amber)' }} title="Exponent (11 bits)">{ieee.double.exponent}</span>
          <span style={{ color: 'var(--green)' }} title="Mantissa/Fraction (52 bits)">{ieee.double.mantissa}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', display: 'flex', gap: '12px', marginTop: '8px' }}>
        <span><span style={{ color: 'var(--accent-hi)' }}>■</span> Sign</span>
        <span><span style={{ color: 'var(--amber)' }}>■</span> Exponent</span>
        <span><span style={{ color: 'var(--green)' }}>■</span> Mantissa</span>
      </div>
    </div>
  );
}
