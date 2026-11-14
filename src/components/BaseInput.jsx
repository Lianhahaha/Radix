import { useState, useCallback } from 'react';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const EXAMPLES = {
  2:  'e.g. 1010',
  8:  'e.g. 17',
  10: 'e.g. 42',
  16: 'e.g. 2A',
};

export default function BaseInput({ base, name, value, onChange, isActive, error, readOnly, isCustom, customBaseStr, onCustomBaseChange }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  const rowClass = [
    'base-row',
    isActive ? 'active' : '',
    error ? 'error' : '',
  ].filter(Boolean).join(' ');

  const inputMode = base <= 10 ? 'decimal' : 'text';
  const placeholder = readOnly ? '—' : (isCustom ? 'e.g. 1021' : (EXAMPLES[base] || `e.g. ...`));

  return (
    <div className={rowClass}>
      <div className="base-label">
        {isCustom ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="base-badge">base</span>
            <input
              type="text"
              inputMode="numeric"
              className="custom-base-input"
              aria-label="Custom base (2 to 36)"
              style={{ width: '40px', padding: '2px 4px', fontSize: '0.75rem', height: '24px', minHeight: 'unset', margin: 0 }}
              value={customBaseStr}
              onChange={e => onCustomBaseChange(e.target.value)}
            />
          </div>
        ) : (
          <span className="base-badge">base {base}</span>
        )}
        <span className="base-name">{name}</span>
      </div>
      <input
        className="base-input-field"
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape' && value) {
            e.preventDefault();
            onChange('');
          }
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        aria-label={`${name} value`}
      />
      {value && !readOnly && (
        <button
          className="clear-btn"
          onClick={() => onChange('')}
          title="Clear"
          aria-label={`Clear ${name} value`}
          tabIndex={-1}
        >
          <ClearIcon />
        </button>
      )}
      <button
        className={`copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="Copy"
        aria-label={`Copy ${name} value`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
