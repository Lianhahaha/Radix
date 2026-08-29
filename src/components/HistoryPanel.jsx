const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (!history.length) {
    return (
      <div>
        <div className="section-label">History</div>
        <div className="empty-state">No conversions yet.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-label">History</div>
      <div className="history-list">
        {history.map((item, i) => (
          <button key={i} className="history-item" onClick={() => onSelect(item)}>
            <div>
              <div className="history-from">
                {item.input}&nbsp;
                <span style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>
                  (base {item.fromBase})
                </span>
              </div>
              <div className="history-meta">
                → {item.results[10] && `dec ${item.results[10]}`}
                {item.results[2] && `, bin ${item.results[2].slice(0, 8)}${item.results[2].length > 8 ? '…' : ''}`}
              </div>
            </div>
            <span className="history-meta">{item.time}</span>
          </button>
        ))}
      </div>
      <button className="clear-history-btn" onClick={onClear}>
        <TrashIcon /> Clear history
      </button>
    </div>
  );
}
