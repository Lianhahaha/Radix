import { useCallback } from 'react';

const HEX_INPUT_RE = /^[0-9a-fA-F\s]*$/;

export default function StringCodec({
  text, setText,
  hex, setHex,
  binary, setBinary,
  hexError, setHexError,
}) {
  const handleTextChange = useCallback((event) => {
    const value = event.target.value;
    setText(value);
    setHexError('');

    try {
      const utf8 = new TextEncoder().encode(value);
      setHex(Array.from(utf8, byte => byte.toString(16).padStart(2, '0')).join(' '));
      setBinary(Array.from(utf8, byte => byte.toString(2).padStart(8, '0')).join(' '));
    } catch {
      setHex('');
      setBinary('');
      setHexError('Unable to encode this text as UTF-8');
    }
  }, [setText, setHex, setBinary, setHexError]);

  const handleHexChange = useCallback((event) => {
    const value = event.target.value;
    setHex(value);

    if (!HEX_INPUT_RE.test(value)) {
      setHexError('Hexadecimal accepts 0–9 and A–F only');
      return;
    }

    const clean = value.replace(/\s/g, '');
    if (clean.length % 2 !== 0) {
      setHexError('Hexadecimal needs an even number of digits (two per byte)');
      return;
    }

    setHexError('');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    }

    try {
      // fatal: reject malformed UTF-8 instead of showing replacement characters.
      setText(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      setBinary(Array.from(bytes, byte => byte.toString(2).padStart(8, '0')).join(' '));
    } catch {
      setText('');
      setBinary('');
      setHexError('These bytes are not valid UTF-8');
    }
  }, [setHex, setText, setBinary, setHexError]);

  return (
    <div className="string-codec-section">
      <div className="section-label">String / Text Encoder (UTF-8)</div>

      <div className="codec-fields">
        <label className="codec-field">
          <span className="codec-label">Text</span>
          <textarea
            className="custom-base-input"
            placeholder="Enter text string…"
            value={text}
            onChange={handleTextChange}
            rows={2}
          />
        </label>

        <label className="codec-field">
          <span className="codec-label">Hexadecimal</span>
          <textarea
            className="custom-base-input codec-hex"
            placeholder="48 65 6c 6c 6f"
            value={hex}
            onChange={handleHexChange}
            rows={2}
            spellCheck={false}
            aria-invalid={!!hexError}
          />
        </label>

        <label className="codec-field">
          <span className="codec-label">Binary</span>
          <textarea
            className="custom-base-input codec-bin"
            placeholder="01001000 01100101 01101100 01101100 01101111"
            value={binary}
            readOnly
            rows={2}
            spellCheck={false}
          />
        </label>
      </div>

      {hexError && <div className="field-error">{hexError}</div>}
    </div>
  );
}
