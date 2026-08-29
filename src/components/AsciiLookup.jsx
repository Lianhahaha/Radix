import { useState } from 'react';
import { charToCode, codeToChar, isValidAsciiChar } from '../utils/ascii';

export default function AsciiLookup() {
  const [charInput, setCharInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const fromChar = charInput ? charToCode(charInput[0]) : null;
  const fromCode = codeInput ? codeToChar(codeInput) : null;

  const info = fromChar || (fromCode ? charToCode(fromCode) : null);

  return (
    <div className="ascii-section">
      <div className="section-label">ASCII Lookup</div>

      <div className="ascii-row">
        <input
          className="custom-base-input"
          style={{ width: 56, textAlign: 'center', fontSize: '1.1rem' }}
          type="text"
          maxLength={1}
          placeholder="A"
          value={charInput}
          onChange={e => {
            setCharInput(e.target.value);
            setCodeInput('');
          }}
          title="Enter a character"
        />

        <input
          className="custom-base-input"
          type="number"
          min={32}
          max={126}
          placeholder="Decimal code (32–126)"
          value={codeInput}
          onChange={e => {
            setCodeInput(e.target.value);
            setCharInput('');
          }}
          title="Enter ASCII decimal code"
          style={{ flex: 1 }}
        />
      </div>

      {info ? (
        <div className="binary-viewer fade-in">
          <div className="ascii-row" style={{ marginBottom: 8 }}>
            <div className="ascii-char-box">{info.char}</div>
            <div style={{ flex: 1 }}>
              <table className="ascii-table">
                <tbody>
                  <tr><td>Decimal</td><td>{info.decimal}</td></tr>
                  <tr><td>Hex</td><td>{info.hex}</td></tr>
                  <tr><td>Binary</td><td>{info.binary.replace(/(.{4})/g, '$1 ').trim()}</td></tr>
                  <tr><td>Octal</td><td>{info.octal}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (charInput || codeInput) ? (
        <div className="error-msg">
          {charInput ? `'${charInput}' is not a printable ASCII character.` : 'Code must be between 32 and 126.'}
        </div>
      ) : null}
    </div>
  );
}
