import { useState } from 'react';
import { charToCode, codeToChar, asciiCategory } from '../utils/ascii';

export default function AsciiLookup() {
  const [charInput, setCharInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const [firstChar] = Array.from(charInput);
  const fromChar = firstChar ? charToCode(firstChar) : null;
  const fromCode = codeInput ? codeToChar(codeInput) : null;

  const info = fromChar || (fromCode ? charToCode(fromCode) : null);

  return (
    <div className="ascii-section">
      <div className="section-label">ASCII Lookup</div>

      <div className="ascii-row">
        <input
          className="custom-base-input ascii-char-input"
          type="text"
          placeholder="A"
          aria-label="Character to look up"
          value={charInput}
          onChange={e => {
            setCharInput(e.target.value);
            setCodeInput('');
          }}
        />

        <input
          className="custom-base-input"
          type="text"
          inputMode="numeric"
          placeholder="Decimal code (32–126)"
          aria-label="ASCII decimal code to look up"
          value={codeInput}
          onChange={e => {
            setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 3));
            setCharInput('');
          }}
        />
      </div>

      {info ? (
        <div className="binary-viewer fade-in">
          <div className="ascii-row ascii-result-row">
            <div className="ascii-char-box">{info.char}</div>
            <div className="ascii-result-table">
              <table className="ascii-table">
                <tbody>
                  <tr><td>Decimal</td><td>{info.decimal}</td></tr>
                  <tr><td>Type</td><td>{asciiCategory(info.decimal)}</td></tr>
                  <tr><td>Hex</td><td>{info.hex}</td></tr>
                  <tr><td>Binary</td><td>{info.binary.replace(/(.{4})/g, '$1 ').trim()}</td></tr>
                  <tr><td>Octal</td><td>{info.octal}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (charInput || codeInput) ? (
        <div className="field-error">
          {charInput
            ? `'${charInput}' is not a printable ASCII character.`
            : 'Code must be between 32 and 126.'}
        </div>
      ) : null}
    </div>
  );
}
