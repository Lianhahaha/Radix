import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import BaseInput from './components/BaseInput';
import StepPanel from './components/StepPanel';
import BitWidthSelector from './components/BitWidthSelector';
import Ieee754Viewer from './components/Ieee754Viewer';
import HistoryPanel from './components/HistoryPanel';
import ExtrasContainer from './components/ExtrasContainer';
import LearnPanel from './components/LearnPanel';
import { convert } from './utils/convert';
import { entryBaseId, parseHistory, addHistoryEntry } from './utils/history';

// ── Icons ──────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);


const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AsciiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const ConvertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);

const LearnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────
const BASES = [
  { base: 2,  name: 'Binary' },
  { base: 8,  name: 'Octal' },
  { base: 10, name: 'Decimal' },
  { base: 16, name: 'Hexadecimal' },
];

const HISTORY_KEY = 'radix-convert-history';
const THEME_KEY   = 'radix-convert-theme';
const HISTORY_LIMIT = 10;

function loadHistory() {
  try {
    return parseHistory(localStorage.getItem(HISTORY_KEY), HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* storage unavailable — fall through to system preference */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// ── Custom hook: detect mobile ─────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

// ── App ────────────────────────────────────────────────────────────
export default function App() {
  const [values, setValues] = useState({ 2: '', 8: '', 10: '', 16: '', custom: '' });
  const [activeBase, setActiveBase] = useState(10);
  const [customBase, setCustomBase] = useState('3');
  const [error, setError]     = useState('');
  const [bitWidth, setBitWidth] = useState(8);
  const [history, setHistory]  = useState(loadHistory);
  const [mobileTab, setMobileTab] = useState('convert');
  const [mainTab, setMainTab] = useState('app'); // 'app' or 'learn'
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const isMobile = useIsMobile();
  const historyTimer = useRef(null);

  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore quota / private-mode failures */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore quota / private-mode failures */
    }
  }, [history]);

  // Cancel any pending history write when the component unmounts.
  useEffect(() => () => clearTimeout(historyTimer.current), []);

  // ── Core conversion ────────────────────────────────────────────
  const handleInput = useCallback((fromId, raw, overrideCustomBase) => {
    const input = raw.trim();
    setActiveBase(fromId);

    if (!input) {
      clearTimeout(historyTimer.current);
      setValues({ 2: '', 8: '', 10: '', 16: '', custom: '' });
      setError('');
      setHasUserTyped(false);
      return;
    }

    setHasUserTyped(true);

    const newValues = { [fromId]: input };
    let firstError = '';

    const cbStr = overrideCustomBase !== undefined ? overrideCustomBase : customBase;
    const parsedCB = parseInt(cbStr, 10);
    const isValidCB = !isNaN(parsedCB) && parsedCB >= 2 && parsedCB <= 36;
    
    const currentExtendedBases = [
      ...BASES.map(b => ({ id: b.base, base: b.base, name: b.name })),
      { id: 'custom', base: isValidCB ? parsedCB : null, name: 'Custom' }
    ];

    const activeObj = currentExtendedBases.find(b => b.id === fromId);
    if (!activeObj || !activeObj.base) {
      setError(fromId === 'custom' ? 'Custom base must be between 2 and 36' : 'Invalid base');
      setValues(newValues);
      return;
    }
    const fromBaseNum = activeObj.base;

    for (const { id, base } of currentExtendedBases) {
      if (id === fromId) continue;
      if (!base) {
        newValues[id] = '';
        continue;
      }
      const { result, error: e } = convert(input, fromBaseNum, base);
      newValues[id] = result;
      if (e && !firstError) firstError = e;
    }

    setValues(newValues);
    setError(firstError);

    if (!firstError) {
      const entry = {
        input,
        fromId,
        fromBase: fromBaseNum,
        customBase: fromId === 'custom' ? String(cbStr) : undefined,
        results: newValues,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      // Debounce so a burst of keystrokes leaves one history entry, not ten.
      clearTimeout(historyTimer.current);
      historyTimer.current = setTimeout(() => {
        setHistory(prev => addHistoryEntry(prev, entry, HISTORY_LIMIT));
      }, 700);
    }
  }, [customBase]);

  const handleCustomBaseChange = (raw) => {
    const next = String(raw).replace(/\D/g, '').slice(0, 2);
    setCustomBase(next);
    if (hasUserTyped && values[activeBase]) {
      handleInput(activeBase, values[activeBase], next);
    }
  };

  const parsedCustom = parseInt(customBase, 10);
  const isValidCustom = !isNaN(parsedCustom) && parsedCustom >= 2 && parsedCustom <= 36;
  const extendedBases = useMemo(() => [
    ...BASES.map(b => ({ id: b.base, base: b.base, name: b.name })),
    { id: 'custom', base: isValidCustom ? parsedCustom : null, name: 'Custom', isCustom: true }
  ], [isValidCustom, parsedCustom]);


  const handleHistorySelect = (item) => {
    setValues(item.results);
    setActiveBase(entryBaseId(item));
    if (entryBaseId(item) === 'custom' && item.customBase) setCustomBase(String(item.customBase));
    setError('');
    setHasUserTyped(true);
    if (isMobile) setMobileTab('convert');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // ── Sub-panels ─────────────────────────────────────────────────
  const ConverterContent = (
    <>
      <div className="active-base-row">
        <span>Input base:</span>
        <span className="active-base-chip">
          base {activeBase === 'custom' ? (isValidCustom ? customBase : '?') : activeBase}
        </span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="base-inputs">
        {extendedBases.map(({ id, base, name, isCustom }) => {
          const isActive = activeBase === id;
          const hasResult = !!values[id] && !error;
          return (
            <div key={id} className="base-field-group">
              <BaseInput
                base={base}
                name={name}
                value={values[id]}
                onChange={val => handleInput(id, val)}
                isActive={isActive}
                error={!!error && isActive}
                isCustom={isCustom}
                customBaseStr={customBase}
                onCustomBaseChange={handleCustomBaseChange}
              />
              {!isActive && hasResult && hasUserTyped && base && (
                <div className="step-panel-wrapper">
                  <StepPanel
                    input={values[activeBase]}
                    fromBase={activeBase === 'custom' ? parseInt(customBase, 10) : activeBase}
                    toBase={base}
                    label="Here's why"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BitWidthSelector
        decimalValue={values[10]}
        width={bitWidth}
        setWidth={setBitWidth}
      />

      <Ieee754Viewer decimalValue={values[10]} />
    </>
  );

  const HistoryContent = (
    <HistoryPanel
      history={history}
      onSelect={handleHistorySelect}
      onClear={clearHistory}
    />
  );

  const ExtrasContent = (
    <>
      <ExtrasContainer />
    </>
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="header-logo">radix<span>.</span>convert</span>
          <span className="header-tag">Comp Archi</span>
        </div>
        {!isMobile && (
          <div className="header-tabs" role="tablist" aria-label="Sections">
            <button
              className={`header-tab ${mainTab === 'app' ? 'active' : ''}`}
              onClick={() => setMainTab('app')}
              role="tab"
              aria-selected={mainTab === 'app'}
            >
              Converter
            </button>
            <button
              className={`header-tab ${mainTab === 'learn' ? 'active' : ''}`}
              onClick={() => setMainTab('learn')}
              role="tab"
              aria-selected={mainTab === 'learn'}
            >
              Learn
            </button>
          </div>
        )}
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {isMobile ? (
        /* ── Mobile: single-column tab-switched ────────────────── */
        <>
          <main className="mobile-main">
            {mobileTab === 'convert' && (
              <section className="mobile-pane fade-in">
                {ConverterContent}
              </section>
            )}
            {mobileTab === 'history' && (
              <section className="mobile-pane fade-in">
                {HistoryContent}
              </section>
            )}
            {mobileTab === 'extras' && (
              <section className="mobile-pane fade-in">
                {ExtrasContent}
              </section>
            )}
            {mobileTab === 'learn' && (
              <section className="mobile-pane fade-in">
                <LearnPanel />
              </section>
            )}
          </main>

          <nav className="mobile-nav" aria-label="Sections">
            {[
              { id: 'convert', label: 'Convert', icon: <ConvertIcon /> },
              { id: 'history', label: 'History', icon: <HistoryIcon /> },
              { id: 'extras',  label: 'Extras',  icon: <AsciiIcon /> },
              { id: 'learn',   label: 'Learn',   icon: <LearnIcon /> },
            ].map(tab => (
              <button
                key={tab.id}
                className={`mobile-nav-btn ${mobileTab === tab.id ? 'active' : ''}`}
                onClick={() => setMobileTab(tab.id)}
                aria-current={mobileTab === tab.id ? 'page' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </>
      ) : (
        /* ── Desktop: two-column sidebar layout ─────────────────── */
        mainTab === 'app' ? (
          <main className="main-content fade-in">
            <section className="left-pane">
              {ConverterContent}
            </section>
            <aside className="right-pane">
              {HistoryContent}
              <hr className="divider" />
              {ExtrasContent}
            </aside>
          </main>
        ) : (
          <main className="main-content fade-in" style={{ display: 'block' }}>
            <LearnPanel />
          </main>
        )
      )}
    </div>
  );
}
