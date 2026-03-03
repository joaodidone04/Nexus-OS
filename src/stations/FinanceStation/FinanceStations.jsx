import { useState, useEffect } from "react";
import "./FinanceStation.css";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrow_up: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
    arrow_down: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    wallet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    bank: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    trending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  };
  return icons[name] || null;
};

// ── Constants ────────────────────────────────────────────────────────────────
const MODULES = {
  dashboard: { label: "Dashboard", color: "#00d4ff", icon: "chart" },
  receitas:  { label: "Receitas",  color: "#00ff88", icon: "arrow_up" },
  despesas:  { label: "Despesas",  color: "#ff4466", icon: "arrow_down" },
  investimentos: { label: "Investimentos", color: "#a78bfa", icon: "trending" },
  metas:     { label: "Metas",     color: "#f59e0b", icon: "target" },
  contas:    { label: "Contas",    color: "#38bdf8", icon: "bank" },
};

const CATEGORIES = {
  receitas:      ["Salário", "Freelance", "Renda Extra", "Investimento", "Outros"],
  despesas:      ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Assinaturas", "Outros"],
  investimentos: ["Ações", "FIIs", "Renda Fixa", "Cripto", "Poupança", "Outros"],
};

const ACCOUNT_TYPES = ["Conta Corrente", "Conta Poupança", "Cartão de Crédito", "Carteira", "Investimento"];

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmt(val) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ── Storage ──────────────────────────────────────────────────────────────────
function useStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="nx-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="nx-bar-col">
          <div className="nx-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: color }} />
          <span className="nx-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="nx-donut">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset * circumference}
            style={{ transition: "stroke-dasharray 0.5s" }}
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r="28" fill="#0d0f14" />
    </svg>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100) || 0;
  return (
    <div className="nx-progress-track">
      <div className="nx-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, color, onClose, children }) {
  return (
    <div className="nx-modal-overlay" onClick={onClose}>
      <div className="nx-modal-box" style={{ "--mod-color": color }} onClick={e => e.stopPropagation()}>
        <div className="nx-modal-header">
          <span className="nx-modal-title">{title}</span>
          <button className="nx-icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="nx-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ transactions, accounts, goals }) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalReceitas     = thisMonth.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
  const totalDespesas     = thisMonth.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  const totalInvestido    = thisMonth.filter(t => t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const totalSaldo        = accounts.reduce((a, b) => a + (b.balance || 0), 0);
  const saldoLivre        = totalReceitas - totalDespesas;

  // monthly bars last 6 months
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const val = transactions
      .filter(t => { const td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === "despesas"; })
      .reduce((a, b) => a + b.amount, 0);
    return { label: MONTHS[d.getMonth()], value: val };
  });

  // donut by category
  const catTotals = {};
  thisMonth.filter(t => t.type === "despesas").forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const donutColors = ["#ff4466","#f59e0b","#a78bfa","#00d4ff","#00ff88","#38bdf8"];
  const segments = Object.entries(catTotals).map(([label, value], i) => ({ label, value, color: donutColors[i % donutColors.length] }));

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="nx-dashboard">
      {/* KPI Cards */}
      <div className="nx-kpi-grid">
        {[
          { label: "Patrimônio Total", value: fmt(totalSaldo), color: "#00d4ff", icon: "wallet", sub: `${accounts.length} conta(s)` },
          { label: "Receitas do Mês",  value: fmt(totalReceitas), color: "#00ff88", icon: "arrow_up", sub: "mês atual" },
          { label: "Despesas do Mês",  value: fmt(totalDespesas), color: "#ff4466", icon: "arrow_down", sub: "mês atual" },
          { label: "Investido",        value: fmt(totalInvestido), color: "#a78bfa", icon: "trending", sub: "mês atual" },
        ].map((k, i) => (
          <div key={i} className="nx-kpi-card" style={{ "--kpi-color": k.color }}>
            <div className="nx-kpi-icon"><Icon name={k.icon} size={20} /></div>
            <div className="nx-kpi-info">
              <span className="nx-kpi-label">{k.label}</span>
              <span className="nx-kpi-value">{k.value}</span>
              <span className="nx-kpi-sub">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Saldo livre */}
      <div className="nx-balance-bar" style={{ "--bal-color": saldoLivre >= 0 ? "#00ff88" : "#ff4466" }}>
        <span className="nx-balance-label">Saldo Livre do Mês</span>
        <span className="nx-balance-value">{fmt(saldoLivre)}</span>
        <div className="nx-balance-hint">{saldoLivre >= 0 ? "✦ Você está no positivo" : "⚠ Gastos acima da receita"}</div>
      </div>

      <div className="nx-charts-row">
        {/* Bar chart */}
        <div className="nx-glass-card nx-chart-card">
          <div className="nx-card-header">
            <span className="nx-card-title">Despesas — Últimos 6 Meses</span>
          </div>
          <BarChart data={barData} color="#ff4466" />
        </div>

        {/* Donut */}
        <div className="nx-glass-card nx-chart-card">
          <div className="nx-card-header">
            <span className="nx-card-title">Despesas por Categoria</span>
          </div>
          {segments.length > 0 ? (
            <div className="nx-donut-wrap">
              <DonutChart segments={segments} />
              <div className="nx-donut-legend">
                {segments.map((s, i) => (
                  <div key={i} className="nx-legend-item">
                    <span className="nx-legend-dot" style={{ background: s.color }} />
                    <span className="nx-legend-label">{s.label}</span>
                    <span className="nx-legend-val">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="nx-empty-chart">Sem despesas este mês</div>}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="nx-glass-card">
        <div className="nx-card-header">
          <span className="nx-card-title">Transações Recentes</span>
        </div>
        {recent.length === 0
          ? <div className="nx-empty">Nenhuma transação registrada</div>
          : <div className="nx-tx-list">
              {recent.map(tx => (
                <div key={tx.id} className="nx-tx-row" style={{ "--tx-color": MODULES[tx.type]?.color }}>
                  <div className="nx-tx-icon"><Icon name={MODULES[tx.type]?.icon} size={14} /></div>
                  <div className="nx-tx-info">
                    <span className="nx-tx-desc">{tx.description}</span>
                    <span className="nx-tx-meta">{tx.category} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  <span className="nx-tx-amount" data-type={tx.type}>{tx.type === "receitas" ? "+" : "-"}{fmt(tx.amount)}</span>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Goals preview */}
      {goals.length > 0 && (
        <div className="nx-glass-card">
          <div className="nx-card-header"><span className="nx-card-title">Progresso das Metas</span></div>
          <div className="nx-goals-preview">
            {goals.slice(0, 3).map(g => (
              <div key={g.id} className="nx-goal-row">
                <div className="nx-goal-info">
                  <span className="nx-goal-name">{g.name}</span>
                  <span className="nx-goal-vals">{fmt(g.current)} / {fmt(g.target)}</span>
                </div>
                <ProgressBar value={g.current} max={g.target} color="#f59e0b" />
                <span className="nx-goal-pct">{Math.min(Math.round((g.current / g.target) * 100), 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS (Receitas / Despesas / Investimentos)
// ══════════════════════════════════════════════════════════════════════════════
function TransactionView({ type, transactions, setTransactions, accounts }) {
  const mod = MODULES[type];
  const cats = CATEGORIES[type] || [];
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ description: "", amount: "", category: cats[0] || "", date: today(), account: "", notes: "" });

  const items = transactions
    .filter(t => t.type === type)
    .filter(t => filter === "all" || t.category === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = items.reduce((a, b) => a + b.amount, 0);

  function add() {
    if (!form.description || !form.amount) return;
    const tx = { id: Date.now(), type, ...form, amount: parseFloat(form.amount) };
    setTransactions(prev => [...prev, tx]);
    setForm({ description: "", amount: "", category: cats[0] || "", date: today(), account: "", notes: "" });
    setModal(false);
  }

  function remove(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="nx-module-view">
      <div className="nx-module-topbar" style={{ "--mod-color": mod.color }}>
        <div className="nx-module-title-row">
          <div className="nx-module-icon"><Icon name={mod.icon} size={18} /></div>
          <span className="nx-module-title">{mod.label}</span>
          <span className="nx-module-total">{fmt(total)}</span>
        </div>
        <button className="nx-add-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
          <Icon name="plus" size={14} /> Nova {type === "receitas" ? "Receita" : type === "despesas" ? "Despesa" : "Aporte"}
        </button>
      </div>

      {/* Filters */}
      <div className="nx-filter-row">
        <button className={`nx-chip ${filter === "all" ? "nx-chip--active" : ""}`} style={{ "--chip-color": mod.color }} onClick={() => setFilter("all")}>Todas</button>
        {cats.map(c => (
          <button key={c} className={`nx-chip ${filter === c ? "nx-chip--active" : ""}`} style={{ "--chip-color": mod.color }} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {/* List */}
      {items.length === 0
        ? <div className="nx-empty">Nenhum registro encontrado</div>
        : <div className="nx-tx-list">
            {items.map(tx => (
              <div key={tx.id} className="nx-tx-row" style={{ "--tx-color": mod.color }}>
                <div className="nx-tx-icon"><Icon name={mod.icon} size={14} /></div>
                <div className="nx-tx-info">
                  <span className="nx-tx-desc">{tx.description}</span>
                  <span className="nx-tx-meta">{tx.category}{tx.account ? ` · ${tx.account}` : ""} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  {tx.notes && <span className="nx-tx-notes">{tx.notes}</span>}
                </div>
                <span className="nx-tx-amount" data-type={tx.type}>{type === "receitas" ? "+" : "-"}{fmt(tx.amount)}</span>
                <button className="nx-icon-btn nx-tx-del" onClick={() => remove(tx.id)}><Icon name="trash" size={13} /></button>
              </div>
            ))}
          </div>
      }

      {modal && (
        <Modal title={`Nova ${type === "receitas" ? "Receita" : type === "despesas" ? "Despesa" : "Aporte"}`} color={mod.color} onClose={() => setModal(false)}>
          <div className="nx-form-grid">
            <div className="nx-field nx-field--full">
              <label className="nx-label">Descrição</label>
              <input className="nx-input" placeholder="Ex: Salário mensal" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Valor (R$)</label>
              <input className="nx-input" type="number" placeholder="0,00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Data</label>
              <input className="nx-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Categoria</label>
              <select className="nx-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="nx-field">
              <label className="nx-label">Conta</label>
              <select className="nx-input" value={form.account} onChange={e => setForm({ ...form, account: e.target.value })}>
                <option value="">Selecionar conta</option>
                {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div className="nx-field nx-field--full">
              <label className="nx-label">Observações</label>
              <textarea className="nx-input nx-textarea" placeholder="Notas opcionais..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-actions">
            <button className="nx-btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button className="nx-btn-primary" style={{ "--mod-color": mod.color }} onClick={add}>Registrar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// METAS
// ══════════════════════════════════════════════════════════════════════════════
function GoalsView({ goals, setGoals }) {
  const mod = MODULES.metas;
  const [modal, setModal] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [form, setForm] = useState({ name: "", target: "", current: "", deadline: "", description: "" });
  const [depositVal, setDepositVal] = useState("");

  function add() {
    if (!form.name || !form.target) return;
    setGoals(prev => [...prev, { id: Date.now(), ...form, target: parseFloat(form.target), current: parseFloat(form.current) || 0 }]);
    setForm({ name: "", target: "", current: "", deadline: "", description: "" });
    setModal(false);
  }

  function deposit(id) {
    const val = parseFloat(depositVal);
    if (!val) return;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: g.current + val } : g));
    setDepositVal("");
    setDepositModal(null);
  }

  function remove(id) { setGoals(prev => prev.filter(g => g.id !== id)); }

  return (
    <div className="nx-module-view">
      <div className="nx-module-topbar" style={{ "--mod-color": mod.color }}>
        <div className="nx-module-title-row">
          <div className="nx-module-icon"><Icon name={mod.icon} size={18} /></div>
          <span className="nx-module-title">{mod.label} Financeiras</span>
        </div>
        <button className="nx-add-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
          <Icon name="plus" size={14} /> Nova Meta
        </button>
      </div>

      {goals.length === 0
        ? <div className="nx-empty">Nenhuma meta criada</div>
        : <div className="nx-goals-grid">
            {goals.map(g => {
              const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
              const done = pct >= 100;
              return (
                <div key={g.id} className={`nx-goal-card ${done ? "nx-goal-card--done" : ""}`} style={{ "--mod-color": mod.color }}>
                  <div className="nx-goal-card-header">
                    <span className="nx-goal-card-name">{g.name}</span>
                    {done && <span className="nx-goal-badge"><Icon name="check" size={11} /> Concluída</span>}
                    <button className="nx-icon-btn" onClick={() => remove(g.id)}><Icon name="trash" size={13} /></button>
                  </div>
                  {g.description && <p className="nx-goal-desc">{g.description}</p>}
                  <div className="nx-goal-amounts">
                    <span className="nx-goal-current">{fmt(g.current)}</span>
                    <span className="nx-goal-sep">/</span>
                    <span className="nx-goal-target">{fmt(g.target)}</span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} color={mod.color} />
                  <div className="nx-goal-footer">
                    <span className="nx-goal-pct-label">{pct}% concluído</span>
                    {g.deadline && <span className="nx-goal-deadline">até {new Date(g.deadline + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
                  </div>
                  {!done && (
                    <button className="nx-deposit-btn" style={{ "--mod-color": mod.color }} onClick={() => setDepositModal(g.id)}>
                      <Icon name="plus" size={13} /> Aportar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
      }

      {modal && (
        <Modal title="Nova Meta Financeira" color={mod.color} onClose={() => setModal(false)}>
          <div className="nx-form-grid">
            <div className="nx-field nx-field--full">
              <label className="nx-label">Nome da Meta</label>
              <input className="nx-input" placeholder="Ex: Reserva de Emergência" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Valor Alvo (R$)</label>
              <input className="nx-input" type="number" placeholder="0,00" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Valor Atual (R$)</label>
              <input className="nx-input" type="number" placeholder="0,00" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>
            <div className="nx-field nx-field--full">
              <label className="nx-label">Prazo</label>
              <input className="nx-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="nx-field nx-field--full">
              <label className="nx-label">Descrição</label>
              <textarea className="nx-input nx-textarea" placeholder="Descreva sua meta..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-actions">
            <button className="nx-btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button className="nx-btn-primary" style={{ "--mod-color": mod.color }} onClick={add}>Criar Meta</button>
          </div>
        </Modal>
      )}

      {depositModal && (
        <Modal title="Registrar Aporte" color={mod.color} onClose={() => setDepositModal(null)}>
          <div className="nx-form-grid">
            <div className="nx-field nx-field--full">
              <label className="nx-label">Valor do Aporte (R$)</label>
              <input className="nx-input" type="number" placeholder="0,00" value={depositVal} onChange={e => setDepositVal(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="nx-modal-actions">
            <button className="nx-btn-ghost" onClick={() => setDepositModal(null)}>Cancelar</button>
            <button className="nx-btn-primary" style={{ "--mod-color": mod.color }} onClick={() => deposit(depositModal)}>Aportar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTAS
// ══════════════════════════════════════════════════════════════════════════════
function AccountsView({ accounts, setAccounts }) {
  const mod = MODULES.contas;
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: ACCOUNT_TYPES[0], balance: "", bank: "", color: "#38bdf8" });

  const totalBalance = accounts.reduce((a, b) => a + (b.balance || 0), 0);

  function add() {
    if (!form.name) return;
    setAccounts(prev => [...prev, { id: Date.now(), ...form, balance: parseFloat(form.balance) || 0 }]);
    setForm({ name: "", type: ACCOUNT_TYPES[0], balance: "", bank: "", color: "#38bdf8" });
    setModal(false);
  }

  function remove(id) { setAccounts(prev => prev.filter(a => a.id !== id)); }

  return (
    <div className="nx-module-view">
      <div className="nx-module-topbar" style={{ "--mod-color": mod.color }}>
        <div className="nx-module-title-row">
          <div className="nx-module-icon"><Icon name={mod.icon} size={18} /></div>
          <span className="nx-module-title">{mod.label}</span>
          <span className="nx-module-total">{fmt(totalBalance)}</span>
        </div>
        <button className="nx-add-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
          <Icon name="plus" size={14} /> Nova Conta
        </button>
      </div>

      {accounts.length === 0
        ? <div className="nx-empty">Nenhuma conta cadastrada</div>
        : <div className="nx-accounts-grid">
            {accounts.map(a => (
              <div key={a.id} className="nx-account-card" style={{ "--acc-color": a.color || mod.color }}>
                <div className="nx-account-header">
                  <div className="nx-account-icon"><Icon name="bank" size={16} /></div>
                  <div className="nx-account-info">
                    <span className="nx-account-name">{a.name}</span>
                    <span className="nx-account-type">{a.type}</span>
                    {a.bank && <span className="nx-account-bank">{a.bank}</span>}
                  </div>
                  <button className="nx-icon-btn" onClick={() => remove(a.id)}><Icon name="trash" size={13} /></button>
                </div>
                <div className="nx-account-balance">{fmt(a.balance)}</div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <Modal title="Nova Conta" color={mod.color} onClose={() => setModal(false)}>
          <div className="nx-form-grid">
            <div className="nx-field nx-field--full">
              <label className="nx-label">Nome da Conta</label>
              <input className="nx-input" placeholder="Ex: Nubank Pessoal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Tipo</label>
              <select className="nx-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="nx-field">
              <label className="nx-label">Banco / Instituição</label>
              <input className="nx-input" placeholder="Ex: Nubank" value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Saldo Inicial (R$)</label>
              <input className="nx-input" type="number" placeholder="0,00" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
            </div>
            <div className="nx-field">
              <label className="nx-label">Cor</label>
              <input className="nx-input nx-input--color" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-actions">
            <button className="nx-btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button className="nx-btn-primary" style={{ "--mod-color": mod.color }} onClick={add}>Adicionar Conta</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FINANCE STATION ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function FinanceStation() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [transactions, setTransactions] = useStorage("nx-finance-transactions", []);
  const [goals, setGoals]               = useStorage("nx-finance-goals", []);
  const [accounts, setAccounts]         = useStorage("nx-finance-accounts", []);

  const mod = MODULES[activeModule];

  return (
    <div className="nx-finance-station" style={{ "--active-color": mod.color }}>
      {/* Sidebar Nav */}
      <nav className="nx-finance-nav">
        <div className="nx-finance-nav-header">
          <span className="nx-station-tag">FINANCE STATION</span>
        </div>
        <div className="nx-finance-nav-items">
          {Object.entries(MODULES).map(([key, m]) => (
            <button
              key={key}
              className={`nx-nav-item ${activeModule === key ? "nx-nav-item--active" : ""}`}
              style={{ "--nav-color": m.color }}
              onClick={() => setActiveModule(key)}
            >
              <span className="nx-nav-icon"><Icon name={m.icon} size={16} /></span>
              <span className="nx-nav-label">{m.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="nx-finance-content">
        <div className="nx-content-header">
          <div className="nx-content-title-row">
            <div className="nx-content-icon" style={{ color: mod.color }}><Icon name={mod.icon} size={22} /></div>
            <div>
              <h1 className="nx-content-title">{mod.label}</h1>
              <span className="nx-content-sub">Finance Station · NΞXUS</span>
            </div>
          </div>
        </div>

        <div className="nx-content-body">
          {activeModule === "dashboard"     && <Dashboard transactions={transactions} accounts={accounts} goals={goals} />}
          {activeModule === "receitas"      && <TransactionView type="receitas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} />}
          {activeModule === "despesas"      && <TransactionView type="despesas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} />}
          {activeModule === "investimentos" && <TransactionView type="investimentos" transactions={transactions} setTransactions={setTransactions} accounts={accounts} />}
          {activeModule === "metas"         && <GoalsView goals={goals} setGoals={setGoals} />}
          {activeModule === "contas"        && <AccountsView accounts={accounts} setAccounts={setAccounts} />}
        </div>
      </main>
    </div>
  );
}