import { Icons } from "./financeConstants.jsx";

// ── Bar Chart ─────────────────────────────────────────
export function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="fs-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="fs-bar-col">
          <div className="fs-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: color }} />
          <span className="fs-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────
export function DonutChart({ segments }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let offset = 0;
  const r = 40, circumference = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="fs-donut">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset * circumference} />
        );
        offset += pct;
        return el;
      })}
      <circle cx="50" cy="50" r="28" fill="#080a0f" />
    </svg>
  );
}

// ── Progress Bar ──────────────────────────────────────
export function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="fs-progress-track">
      <div className="fs-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────
export function Modal({ title, color, onClose, children, wide }) {
  return (
    <div className="nx-modal-overlay" onClick={onClose}>
      <div
        className={`nx-modal ${wide ? "nx-modal--wide" : ""}`}
        style={{ "--mod-color": color }}
        onClick={e => e.stopPropagation()}
      >
        <div className="nx-modal-header">
          <span className="nx-modal-title">{title}</span>
          <button className="nx-modal-close" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="nx-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── XP Toast ──────────────────────────────────────────
export function XpToast({ toasts }) {
  return (
    <div className="fs-xp-toasts">
      {toasts.map(t => (
        <div key={t.id} className="fs-xp-toast">
          <span className="fs-xp-toast-icon">{Icons[t.icon] || Icons.xp}</span>
          <div className="fs-xp-toast-info">
            <span className="fs-xp-toast-label">{t.label}</span>
            <span className="fs-xp-toast-xp">+{t.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}