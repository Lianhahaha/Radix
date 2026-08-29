import { useState, useEffect } from 'react';

export default function StringCodec({ text, setText, hex, setHex, binary, setBinary }) {

  // When text changes, update hex and binary
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    
    try {
      const utf8 = new TextEncoder().encode(val);
      const hexStr = Array.from(utf8).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const binStr = Array.from(utf8).map(b => b.toString(2).padStart(8, '0')).join(' ');
      setHex(hexStr);
      setBinary(binStr);
    } catch {
      setHex('Error encoding text');
      setBinary('');
    }
  };

  // When hex changes, update text and binary
  const handleHexChange = (e) => {
    let val = e.target.value;
    setHex(val);

    const clean = val.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length % 2 !== 0) {
      setText('...');
      setBinary('...');
      return;
    }

    try {
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
      }
      setText(new TextDecoder('utf-8').decode(bytes));
      setBinary(Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' '));
    } catch {
      setText('Invalid Hex sequence');
      setBinary('');
    }
  };

  return (
    <div className="string-codec-section" style={{ marginTop: '24px' }}>
      <div className="section-label">String / Text Encoder (UTF-8)</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <textarea
          className="custom-base-input"
          placeholder="Enter text string..."
          value={text}
          onChange={handleTextChange}
          rows={2}
          style={{ resize: 'vertical' }}
        />
        
        <textarea
          className="custom-base-input"
          placeholder="Hexadecimal (e.g. 48 65 6c 6c 6f)"
          value={hex}
          onChange={handleHexChange}
          rows={2}
          style={{ resize: 'vertical', fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--amber)' }}
        />
        
        <textarea
          className="custom-base-input"
          placeholder="Binary"
          value={binary}
          readOnly
          rows={2}
          style={{ resize: 'vertical', fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--green)' }}
        />
      </div>

    </div>
  );
}
