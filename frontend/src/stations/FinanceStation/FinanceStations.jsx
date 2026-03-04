import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useNexus } from "../../context/NexusContext";
import "./FinanceStations.css";

// ── Icons ─────────────────────────────────────────────
const Icons = {
  plus:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  close:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrowUp:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  arrowDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  wallet:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  target:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bank:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  trending:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  check:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  gear:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  receipt:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  chevLeft:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  star:      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  xp:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
};

// ── Module definitions ────────────────────────────────
const MODULES = [
  { id: "dashboard",     label: "DASHBOARD",    color: "#3b82f6", icon: "chart"    },
  { id: "receitas",      label: "RECEITAS",     color: "#10b981", icon: "arrowUp"  },
  { id: "despesas",      label: "DESPESAS",     color: "#ef4444", icon: "arrowDown"},
  { id: "investimentos", label: "INVESTIMENTOS",color: "#a78bfa", icon: "trending" },
  { id: "metas",         label: "METAS",        color: "#f59e0b", icon: "target"   },
  { id: "contas",        label: "CONTAS",       color: "#38bdf8", icon: "bank"     },
  { id: "extrato",       label: "EXTRATO",      color: "#f472b6", icon: "receipt"  },
];

const DEFAULT_CATEGORIES = {
  receitas:      ["Salário", "Freelance", "Renda Extra", "Investimento", "Outros"],
  despesas:      ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Assinaturas", "Outros"],
  investimentos: ["Ações", "FIIs", "Renda Fixa", "Cripto", "Poupança", "Outros"],
};

const ACCOUNT_TYPES = ["Conta Corrente", "Poupança", "Cartão de Crédito", "Carteira", "Investimento"];
const MONTHS_FULL   = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SHORT  = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ── XP Rules ──────────────────────────────────────────
const XP_RULES = {
  investimento_lancado:  { xp: 10, label: "Investimento registrado",    icon: "trending" },
  aporte_meta:           { xp: 10, label: "Aporte em meta realizado",   icon: "target"   },
  saldo_positivo:        { xp: 10, label: "Saldo positivo no mês",      icon: "arrowUp"  },
  meta_concluida:        { xp: 25, label: "Meta 100% concluída!",       icon: "star"     },
  conta_cadastrada:      { xp:  5, label: "Conta cadastrada",           icon: "bank"     },
  sem_deficit_3meses:    { xp: 30, label: "3 meses sem déficit!",       icon: "xp"       },
};

// ── Helpers ───────────────────────────────────────────
function maskBRL(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits || digits === "0") return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function unmaskBRL(masked) {
  if (!masked) return 0;
  return parseFloat(String(masked).replace(/\./g, "").replace(",", ".")) || 0;
}
function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function todayStr() { return new Date().toISOString().split("T")[0]; }
function calcAccountBalance(account, transactions) {
  const txs = transactions.filter(t => t.account === account.name);
  const entradas = txs.filter(t => t.type === "receitas" || t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const saidas   = txs.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  return (account.balance || 0) + entradas - saidas;
}

// ── Storage ───────────────────────────────────────────
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// ── Charts ────────────────────────────────────────────
function BarChart({ data, color }) {
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

function DonutChart({ segments }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let offset = 0;
  const r = 40, circumference = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="fs-donut">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12"
          strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset * circumference} />;
        offset += pct;
        return el;
      })}
      <circle cx="50" cy="50" r="28" fill="#080a0f" />
    </svg>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="fs-progress-track">
      <div className="fs-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────
function Modal({ title, color, onClose, children, wide }) {
  return (
    <div className="nx-modal-overlay" onClick={onClose}>
      <div className={`nx-modal ${wide ? "nx-modal--wide" : ""}`} style={{ "--mod-color": color }} onClick={e => e.stopPropagation()}>
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
function XpToast({ toasts }) {
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

// ══════════════════════════════════════════════════════
// CATEGORY MANAGER MODAL
// ══════════════════════════════════════════════════════
function CategoryModal({ type, categories, setCategories, onClose }) {
  const mod = MODULES.find(m => m.id === type);
  const cats = categories[type] || [];
  const [newCat, setNewCat] = useState("");

  function add() {
    const trimmed = newCat.trim();
    if (!trimmed || cats.includes(trimmed)) return;
    setCategories(prev => ({ ...prev, [type]: [...(prev[type] || []), trimmed] }));
    setNewCat("");
  }

  function remove(cat) {
    setCategories(prev => ({ ...prev, [type]: prev[type].filter(c => c !== cat) }));
  }

  return (
    <Modal title={`CATEGORIAS — ${mod.label}`} color={mod.color} onClose={onClose}>
      <div className="fs-cat-manager">
        <p className="fs-cat-hint">Gerencie as categorias de {mod.label.toLowerCase()}. As categorias padrão podem ser removidas.</p>
        <div className="fs-cat-add-row">
          <input
            className="fs-input"
            placeholder="Nova categoria..."
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
          />
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={add}>{Icons.plus} ADICIONAR</button>
        </div>
        <div className="fs-cat-list">
          {cats.length === 0
            ? <p className="fs-empty">Nenhuma categoria</p>
            : cats.map(c => (
                <div key={c} className="fs-cat-item" style={{ "--mod-color": mod.color }}>
                  <span className="fs-cat-dot" style={{ background: mod.color }} />
                  <span className="fs-cat-name">{c}</span>
                  <button className="fs-del-btn" onClick={() => remove(c)}>{Icons.trash}</button>
                </div>
              ))
          }
        </div>
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={() => setCategories(prev => ({ ...prev, [type]: DEFAULT_CATEGORIES[type] }))}>RESTAURAR PADRÃO</button>
        <button className="nx-modal-confirm" style={{ borderColor: mod.color, color: mod.color }} onClick={onClose}>FECHAR</button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function Dashboard({ transactions, accounts, goals }) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalReceitas  = thisMonth.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
  const totalDespesas  = thisMonth.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  const totalInvestido = thisMonth.filter(t => t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const totalSaldo     = accounts.reduce((a, b) => a + calcAccountBalance(b, transactions), 0);
  const saldoLivre     = totalReceitas - totalDespesas;

  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const val = transactions
      .filter(t => { const td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === "despesas"; })
      .reduce((a, b) => a + b.amount, 0);
    return { label: MONTHS_SHORT[d.getMonth()], value: val };
  });

  const catTotals = {};
  thisMonth.filter(t => t.type === "despesas").forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const donutColors = ["#ef4444","#f59e0b","#a78bfa","#3b82f6","#10b981","#38bdf8"];
  const segments = Object.entries(catTotals).map(([label, value], i) => ({ label, value, color: donutColors[i % donutColors.length] }));
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const kpis = [
    { label: "Patrimônio Total", value: fmt(totalSaldo),     color: "#3b82f6", icon: "wallet"    },
    { label: "Receitas do Mês",  value: fmt(totalReceitas),  color: "#10b981", icon: "arrowUp"   },
    { label: "Despesas do Mês",  value: fmt(totalDespesas),  color: "#ef4444", icon: "arrowDown" },
    { label: "Investido",        value: fmt(totalInvestido), color: "#a78bfa", icon: "trending"  },
  ];

  return (
    <div className="fs-dashboard">
      <div className="fs-dash-month-badge">
        <span className="fs-dash-month-dot" />
        EXIBINDO: {MONTHS_FULL[now.getMonth()].toUpperCase()} DE {now.getFullYear()} — DADOS EM TEMPO REAL
      </div>

      <div className="fs-kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="fs-kpi glass-premium" style={{ "--kpi-color": k.color }}>
            <div className="fs-kpi-icon">{Icons[k.icon]}</div>
            <div className="fs-kpi-info">
              <span className="fs-kpi-label">{k.label}</span>
              <span className="fs-kpi-value">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fs-balance glass-premium" style={{ "--bal-color": saldoLivre >= 0 ? "#10b981" : "#ef4444" }}>
        <span className="fs-balance-label">SALDO LIVRE DO MÊS</span>
        <span className="fs-balance-value">{fmt(saldoLivre)}</span>
        <span className="fs-balance-hint">{saldoLivre >= 0 ? "✦ POSITIVO" : "⚠ DÉFICIT"}</span>
      </div>

      <div className="fs-charts-row">
        <div className="fs-chart-card glass-premium">
          <p className="fs-section-label">DESPESAS — ÚLTIMOS 6 MESES</p>
          <BarChart data={barData} color="#ef4444" />
        </div>
        <div className="fs-chart-card glass-premium">
          <p className="fs-section-label">DESPESAS POR CATEGORIA</p>
          {segments.length > 0 ? (
            <div className="fs-donut-wrap">
              <DonutChart segments={segments} />
              <div className="fs-donut-legend">
                {segments.map((s, i) => (
                  <div key={i} className="fs-legend-item">
                    <span className="fs-legend-dot" style={{ background: s.color }} />
                    <span className="fs-legend-label">{s.label}</span>
                    <span className="fs-legend-val">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="fs-empty">Sem despesas este mês</p>}
        </div>
      </div>

      <div className="fs-card glass-premium">
        <p className="fs-section-label">TRANSAÇÕES RECENTES</p>
        {recent.length === 0
          ? <p className="fs-empty">Nenhuma transação registrada</p>
          : <div className="fs-tx-list">
              {recent.map(tx => {
                const mod = MODULES.find(m => m.id === tx.type);
                return (
                  <div key={tx.id} className="fs-tx-row" style={{ "--tx-color": mod?.color }}>
                    <div className="fs-tx-icon">{Icons[mod?.icon]}</div>
                    <div className="fs-tx-info">
                      <span className="fs-tx-desc">{tx.description}</span>
                      <span className="fs-tx-meta">{tx.category} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    </div>
                    <span className="fs-tx-amount" data-type={tx.type}>{tx.type === "receitas" ? "+" : "-"}{fmt(tx.amount)}</span>
                  </div>
                );
              })}
            </div>
        }
      </div>

      {goals.length > 0 && (
        <div className="fs-card glass-premium">
          <p className="fs-section-label">PROGRESSO DAS METAS</p>
          {goals.slice(0, 3).map(g => (
            <div key={g.id} className="fs-goal-preview-row">
              <div className="fs-goal-preview-info">
                <span className="fs-goal-preview-name">{g.name}</span>
                <span className="fs-goal-preview-vals">{fmt(g.current)} / {fmt(g.target)}</span>
              </div>
              <ProgressBar value={g.current} max={g.target} color="#f59e0b" />
              <span className="fs-goal-pct">{Math.min(Math.round((g.current / g.target) * 100), 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// EXTRATO (Módulo de extrato mensal com setas)
// ══════════════════════════════════════════════════════
function ExtratoView({ transactions, accounts }) {
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [filterType, setFilterType] = useState("all");

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

  const monthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const filtered = filterType === "all" ? monthTxs : monthTxs.filter(t => t.type === filterType);
  const sorted   = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalReceitas  = monthTxs.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
  const totalDespesas  = monthTxs.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  const totalInvestido = monthTxs.filter(t => t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const saldo          = totalReceitas - totalDespesas;

  const mod = MODULES.find(m => m.id === "extrato");

  return (
    <div className="fs-view">
      {/* Header */}
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons.receipt}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">EXTRATO</h2>
          </div>
        </div>
        {/* Month navigator */}
        <div className="fs-month-nav">
          <button className="fs-month-btn" onClick={prevMonth}>{Icons.chevLeft}</button>
          <div className="fs-month-display">
            <span className="fs-month-name">{MONTHS_FULL[viewMonth].toUpperCase()}</span>
            <span className="fs-month-year">{viewYear}</span>
            {isCurrentMonth && <span className="fs-month-badge">MÊS ATUAL</span>}
          </div>
          <button className="fs-month-btn" onClick={nextMonth}>{Icons.chevRight}</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="fs-extrato-kpis">
        {[
          { label: "RECEITAS",     value: fmt(totalReceitas),  color: "#10b981" },
          { label: "DESPESAS",     value: fmt(totalDespesas),  color: "#ef4444" },
          { label: "INVESTIDO",    value: fmt(totalInvestido), color: "#a78bfa" },
          { label: "SALDO LIVRE",  value: fmt(saldo),          color: saldo >= 0 ? "#10b981" : "#ef4444" },
        ].map((k, i) => (
          <div key={i} className="fs-extrato-kpi glass-premium" style={{ "--kpi-color": k.color }}>
            <span className="fs-extrato-kpi-label">{k.label}</span>
            <span className="fs-extrato-kpi-value" style={{ color: k.color }}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Filtros por tipo */}
      <div className="fs-filters">
        {["all","receitas","despesas","investimentos"].map(t => (
          <button key={t}
            className={`fs-filter-chip ${filterType === t ? "is-active" : ""}`}
            style={{ "--chip-color": t === "all" ? mod.color : MODULES.find(m => m.id === t)?.color }}
            onClick={() => setFilterType(t)}
          >
            {t === "all" ? "TODOS" : t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lista do mês */}
      <div className="fs-card glass-premium">
        <p className="fs-section-label">{sorted.length} LANÇAMENTO{sorted.length !== 1 ? "S" : ""} — {MONTHS_FULL[viewMonth].toUpperCase()} {viewYear}</p>
        {sorted.length === 0
          ? <p className="fs-empty">Nenhum lançamento neste mês</p>
          : <div className="fs-tx-list">
              {sorted.map(tx => {
                const txMod = MODULES.find(m => m.id === tx.type);
                return (
                  <div key={tx.id} className="fs-tx-row" style={{ "--tx-color": txMod?.color }}>
                    <div className="fs-tx-icon">{Icons[txMod?.icon]}</div>
                    <div className="fs-tx-info">
                      <span className="fs-tx-desc">{tx.description}</span>
                      <span className="fs-tx-meta">
                        {tx.category}
                        {tx.account ? ` · ${tx.account}` : ""}
                        {" · "}{new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      {tx.notes && <span className="fs-tx-notes">{tx.notes}</span>}
                    </div>
                    <div className="fs-tx-right">
                      <span className="fs-tx-type-badge" style={{ color: txMod?.color, borderColor: txMod?.color }}>
                        {tx.type === "receitas" ? "RECEITA" : tx.type === "despesas" ? "DESPESA" : "INVEST."}
                      </span>
                      <span className="fs-tx-amount" data-type={tx.type}>
                        {tx.type === "receitas" ? "+" : "-"}{fmt(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════════════════
function TransactionView({ type, transactions, setTransactions, accounts, categories, setCategories, onXp }) {
  const mod  = MODULES.find(m => m.id === type);
  const cats = categories[type] || [];
  const [modal,    setModal]    = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [form, setForm] = useState({ description: "", amount: "", category: cats[0] || "", date: todayStr(), account: "", notes: "" });

  // sync first category when cats change
  useEffect(() => {
    setForm(f => ({ ...f, category: cats[0] || "" }));
  }, [cats.join(",")]);

  const items = transactions
    .filter(t => t.type === type)
    .filter(t => filter === "all" || t.category === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = transactions.filter(t => t.type === type).reduce((a, b) => a + b.amount, 0);

  function add() {
    if (!form.description || !form.amount) return;
    setTransactions(prev => [...prev, { id: Date.now(), type, ...form, amount: unmaskBRL(form.amount) }]);
    setForm({ description: "", amount: "", category: cats[0] || "", date: todayStr(), account: "", notes: "" });
    setModal(false);
    if (type === "investimentos") onXp("investimento_lancado");
  }

  const label = type === "receitas" ? "RECEITA" : type === "despesas" ? "DESPESA" : "APORTE";

  return (
    <div className="fs-view">
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons[mod.icon]}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">{mod.label}</h2>
          </div>
        </div>
        <div className="fs-view-header-right">
          <span className="fs-view-total" style={{ color: mod.color }}>{fmt(total)}</span>
          <button className="fs-gear-btn" onClick={() => setCatModal(true)} title="Configurar categorias">{Icons.gear}</button>
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
            {Icons.plus} NOVA {label}
          </button>
        </div>
      </div>

      <div className="fs-filters">
        <button className={`fs-filter-chip ${filter === "all" ? "is-active" : ""}`} style={{ "--chip-color": mod.color }} onClick={() => setFilter("all")}>TODAS</button>
        {cats.map(c => (
          <button key={c} className={`fs-filter-chip ${filter === c ? "is-active" : ""}`} style={{ "--chip-color": mod.color }} onClick={() => setFilter(c)}>{c.toUpperCase()}</button>
        ))}
      </div>

      <div className="fs-card glass-premium">
        {items.length === 0
          ? <p className="fs-empty">Nenhum registro encontrado</p>
          : <div className="fs-tx-list">
              {items.map(tx => (
                <div key={tx.id} className="fs-tx-row" style={{ "--tx-color": mod.color }}>
                  <div className="fs-tx-icon">{Icons[mod.icon]}</div>
                  <div className="fs-tx-info">
                    <span className="fs-tx-desc">{tx.description}</span>
                    <span className="fs-tx-meta">{tx.category}{tx.account ? ` · ${tx.account}` : ""} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    {tx.notes && <span className="fs-tx-notes">{tx.notes}</span>}
                  </div>
                  <span className="fs-tx-amount" data-type={tx.type}>{type === "receitas" ? "+" : "-"}{fmt(tx.amount)}</span>
                  <button className="fs-tx-del" onClick={() => setTransactions(prev => prev.filter(t => t.id !== tx.id))}>{Icons.trash}</button>
                </div>
              ))}
            </div>
        }
      </div>

      {modal && (
        <Modal title={`NOVA ${label}`} color={mod.color} onClose={() => setModal(false)}>
          <div className="fs-form-grid">
            <div className="fs-field fs-field--full">
              <label className="fs-label">DESCRIÇÃO</label>
              <input className="fs-input" placeholder="Ex: Salário mensal" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.amount} onChange={e => setForm({ ...form, amount: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">DATA</label>
              <input className="fs-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">CATEGORIA</label>
              <select className="fs-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="fs-field">
              <label className="fs-label">CONTA</label>
              <select className="fs-input" value={form.account} onChange={e => setForm({ ...form, account: e.target.value })}>
                <option value="">Selecionar conta</option>
                {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">OBSERVAÇÕES</label>
              <textarea className="fs-input fs-textarea" placeholder="Notas opcionais..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setModal(false)}>CANCELAR</button>
            <button className="nx-modal-confirm" style={{ borderColor: mod.color, color: mod.color }} onClick={add}>REGISTRAR</button>
          </div>
        </Modal>
      )}

      {catModal && (
        <CategoryModal type={type} categories={categories} setCategories={setCategories} onClose={() => setCatModal(false)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// METAS
// ══════════════════════════════════════════════════════
function GoalsView({ goals, setGoals, onXp }) {
  const mod = MODULES.find(m => m.id === "metas");
  const [modal,     setModal]     = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [form, setForm] = useState({ name: "", target: "", current: "", deadline: "", description: "" });
  const [depositVal, setDepositVal] = useState("");

  function add() {
    if (!form.name || !form.target) return;
    setGoals(prev => [...prev, { id: Date.now(), ...form, target: unmaskBRL(form.target), current: unmaskBRL(form.current) }]);
    setForm({ name: "", target: "", current: "", deadline: "", description: "" });
    setModal(false);
  }

  function deposit() {
    const v = unmaskBRL(depositVal);
    if (!v) return;
    setGoals(prev => prev.map(g => {
      if (g.id !== depositId) return g;
      const newCurrent = g.current + v;
      const wasDone = g.current >= g.target;
      const nowDone = newCurrent >= g.target;
      if (!wasDone && nowDone) onXp("meta_concluida");
      else onXp("aporte_meta");
      return { ...g, current: newCurrent };
    }));
    setDepositVal(""); setDepositId(null);
  }

  return (
    <div className="fs-view">
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons[mod.icon]}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">METAS FINANCEIRAS</h2>
          </div>
        </div>
        <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
          {Icons.plus} NOVA META
        </button>
      </div>

      {goals.length === 0
        ? <p className="fs-empty">Nenhuma meta criada</p>
        : <div className="fs-goals-grid">
            {goals.map(g => {
              const pct  = Math.min(Math.round((g.current / g.target) * 100), 100);
              const done = pct >= 100;
              return (
                <div key={g.id} className={`fs-goal-card glass-premium ${done ? "is-done" : ""}`} style={{ "--mod-color": mod.color }}>
                  <div className="fs-goal-card-top">
                    <span className="fs-goal-card-name">{g.name}</span>
                    {done && <span className="fs-goal-badge">{Icons.check} CONCLUÍDA</span>}
                    <button className="fs-del-btn" onClick={() => setGoals(prev => prev.filter(x => x.id !== g.id))}>{Icons.trash}</button>
                  </div>
                  {g.description && <p className="fs-goal-desc">{g.description}</p>}
                  <div className="fs-goal-amounts">
                    <span className="fs-goal-current">{fmt(g.current)}</span>
                    <span className="fs-goal-sep">/</span>
                    <span className="fs-goal-target">{fmt(g.target)}</span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} color={mod.color} />
                  <div className="fs-goal-footer">
                    <span className="fs-goal-pct-label">{pct}% CONCLUÍDO</span>
                    {g.deadline && <span className="fs-goal-deadline">ATÉ {new Date(g.deadline + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
                  </div>
                  {!done && (
                    <button className="fs-deposit-btn" style={{ "--mod-color": mod.color }} onClick={() => setDepositId(g.id)}>
                      {Icons.plus} APORTAR
                    </button>
                  )}
                </div>
              );
            })}
          </div>
      }

      {modal && (
        <Modal title="NOVA META FINANCEIRA" color={mod.color} onClose={() => setModal(false)}>
          <div className="fs-form-grid">
            <div className="fs-field fs-field--full">
              <label className="fs-label">NOME DA META</label>
              <input className="fs-input" placeholder="Ex: Reserva de Emergência" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR ALVO (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.target} onChange={e => setForm({ ...form, target: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR ATUAL (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.current} onChange={e => setForm({ ...form, current: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">PRAZO</label>
              <input className="fs-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">DESCRIÇÃO</label>
              <textarea className="fs-input fs-textarea" placeholder="Descreva sua meta..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setModal(false)}>CANCELAR</button>
            <button className="nx-modal-confirm" onClick={add}>CRIAR META</button>
          </div>
        </Modal>
      )}

      {depositId && (
        <Modal title="REGISTRAR APORTE" color={mod.color} onClose={() => setDepositId(null)}>
          <div className="fs-form-grid">
            <div className="fs-field fs-field--full">
              <label className="fs-label">VALOR DO APORTE (R$)</label>
              <input className="fs-input" placeholder="0,00" value={depositVal} onChange={e => setDepositVal(maskBRL(e.target.value.replace(/\D/g,"")))} autoFocus />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setDepositId(null)}>CANCELAR</button>
            <button className="nx-modal-confirm" onClick={deposit}>APORTAR</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// CONTAS
// ══════════════════════════════════════════════════════
function AccountsView({ accounts, setAccounts, transactions, onXp }) {
  const mod = MODULES.find(m => m.id === "contas");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: ACCOUNT_TYPES[0], balance: "", bank: "", color: "#38bdf8" });

  const totalBalance = accounts.reduce((a, b) => a + calcAccountBalance(b, transactions), 0);

  function add() {
    if (!form.name) return;
    setAccounts(prev => [...prev, { id: Date.now(), ...form, balance: unmaskBRL(form.balance) }]);
    setForm({ name: "", type: ACCOUNT_TYPES[0], balance: "", bank: "", color: "#38bdf8" });
    setModal(false);
    onXp("conta_cadastrada");
  }

  return (
    <div className="fs-view">
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons[mod.icon]}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">CONTAS</h2>
          </div>
        </div>
        <div className="fs-view-header-right">
          <span className="fs-view-total" style={{ color: mod.color }}>{fmt(totalBalance)}</span>
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
            {Icons.plus} NOVA CONTA
          </button>
        </div>
      </div>

      {accounts.length === 0
        ? <p className="fs-empty">Nenhuma conta cadastrada</p>
        : <div className="fs-accounts-grid">
            {accounts.map(a => (
              <div key={a.id} className="fs-account-card glass-premium" style={{ "--acc-color": a.color }}>
                <div className="fs-account-top">
                  <div className="fs-account-icon" style={{ color: a.color }}>{Icons.bank}</div>
                  <div className="fs-account-info">
                    <span className="fs-account-name">{a.name}</span>
                    <span className="fs-account-type">{a.type}{a.bank ? ` · ${a.bank}` : ""}</span>
                  </div>
                  <button className="fs-del-btn" onClick={() => setAccounts(prev => prev.filter(x => x.id !== a.id))}>{Icons.trash}</button>
                </div>
                <div className="fs-account-balance" style={{ color: a.color }}>{fmt(calcAccountBalance(a, transactions))}</div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <Modal title="NOVA CONTA" color={mod.color} onClose={() => setModal(false)}>
          <div className="fs-form-grid">
            <div className="fs-field fs-field--full">
              <label className="fs-label">NOME DA CONTA</label>
              <input className="fs-input" placeholder="Ex: Nubank Pessoal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">TIPO</label>
              <select className="fs-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="fs-field">
              <label className="fs-label">BANCO / INSTITUIÇÃO</label>
              <input className="fs-input" placeholder="Ex: Nubank" value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">SALDO INICIAL (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.balance} onChange={e => setForm({ ...form, balance: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">COR</label>
              <input className="fs-input" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ padding: "4px", height: "46px" }} />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setModal(false)}>CANCELAR</button>
            <button className="nx-modal-confirm" onClick={add}>ADICIONAR CONTA</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════
export default function FinanceStation() {
  const navigate = useNavigate();
  const { addXp } = useNexus();

  const [active,       setActive]       = useState("dashboard");
  const [transactions, setTransactions] = useStorage("nx-finance-transactions", []);
  const [goals,        setGoals]        = useStorage("nx-finance-goals", []);
  const [accounts,     setAccounts]     = useStorage("nx-finance-accounts", []);
  const [categories,   setCategories]   = useStorage("nx-finance-categories", DEFAULT_CATEGORIES);
  const [xpLog,        setXpLog]        = useStorage("nx-finance-xplog", []);
  const [toasts,       setToasts]       = useState([]);

  const activeMod = MODULES.find(m => m.id === active);

  // ── XP engine ─────────────────────────────────────
  const grantXp = useCallback((ruleKey) => {
    const rule = XP_RULES[ruleKey];
    if (!rule) return;

    // Prevent duplicate "saldo_positivo" and "sem_deficit_3meses" in same month
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const alreadyKey = `${ruleKey}:${monthKey}`;
    if ((ruleKey === "saldo_positivo" || ruleKey === "sem_deficit_3meses") && xpLog.includes(alreadyKey)) return;

    // Log it
    if (ruleKey === "saldo_positivo" || ruleKey === "sem_deficit_3meses") {
      setXpLog(prev => [...prev, alreadyKey]);
    }

    // Add XP to operator
    if (addXp) addXp(rule.xp);

    // Show toast
    const id = Date.now();
    const toast = { id, xp: rule.xp, label: rule.label, icon: rule.icon };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, [addXp, xpLog]);

  // Check saldo positivo when transactions change
  useEffect(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const r = thisMonth.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
    const d = thisMonth.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
    if (r > 0 && r > d) grantXp("saldo_positivo");
  }, [transactions]);

  // Check 3 months no deficit
  useEffect(() => {
    const now = new Date();
    const last3 = Array.from({ length: 3 }, (_, i) => {
      const m = now.getMonth() - 1 - i;
      const y = now.getFullYear() + Math.floor((now.getMonth() - 1 - i) / 12);
      const month = ((m % 12) + 12) % 12;
      return { month, year: y };
    });
    const allPositive = last3.every(({ month, year }) => {
      const txs = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year; });
      const r = txs.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
      const d = txs.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
      return r > 0 && r >= d;
    });
    if (allPositive) grantXp("sem_deficit_3meses");
  }, [transactions]);

  const content = (
    <div className="fs-root">
      <XpToast toasts={toasts} />

      {/* Sidebar */}
      <aside className="fs-sidebar glass-premium">
        <div className="ms-sidebar-top">
          <button className="ms-back-hub" onClick={() => navigate("/stations")}>← HUB</button>
        </div>

        <div className="fs-side-label"><span>MÓDULOS</span></div>

        <div className="fs-side-nav">
          {MODULES.map(m => (
            <button
              key={m.id}
              className={`fs-nav-item ${active === m.id ? "is-active" : ""}`}
              style={{ "--nav-color": m.color }}
              onClick={() => setActive(m.id)}
            >
              <span className="fs-nav-icon" style={{ color: active === m.id ? m.color : undefined }}>{Icons[m.icon]}</span>
              <span className="fs-nav-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="fs-station-tag">
          <span>FINANCE</span>
          <span className="fs-station-dot" style={{ color: activeMod.color }}>●</span>
          <span>STATION</span>
        </div>
      </aside>

      {/* Main */}
      <main className="fs-main">
        <div className="fs-main-inner">
          {active === "dashboard"     && <Dashboard transactions={transactions} accounts={accounts} goals={goals} />}
          {active === "receitas"      && <TransactionView type="receitas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "despesas"      && <TransactionView type="despesas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "investimentos" && <TransactionView type="investimentos" transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "metas"         && <GoalsView goals={goals} setGoals={setGoals} onXp={grantXp} />}
          {active === "contas"        && <AccountsView accounts={accounts} setAccounts={setAccounts} transactions={transactions} onXp={grantXp} />}
          {active === "extrato"       && <ExtratoView transactions={transactions} accounts={accounts} />}
        </div>
      </main>
    </div>
  );
  return createPortal(content, document.body);
}