import { useState, useMemo } from "react";
import {
  Icons, MODULES, maskBRL, unmaskBRL, fmt, todayStr, MONTHS_SHORT,
} from "./financeConstants.jsx";
import { Modal } from "./financeComponents.jsx";

// ── Tipos de referência de rendimento ─────────────────
const YIELD_REFS = ["% ao ano", "% CDI", "% do CDI", "% Selic", "% IPCA+", "CDB", "LCI/LCA", "Fixo mensal"];

const INVEST_COLORS = ["#a78bfa","#3b82f6","#10b981","#f59e0b","#f97316","#ec4899","#38bdf8"];

const EMPTY_ACCOUNT = {
  name: "", bank: "", color: "#a78bfa",
  yieldRate: "", yieldRef: "% CDI",
  initialBalance: "", notes: "",
};

const EMPTY_APORTE = {
  description: "", amount: "", date: todayStr(),
  type: "aporte", // aporte | resgate
  notes: "",
};

// ── Barra de evolução do aporte ───────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width .5s" }} />
    </div>
  );
}

// ── Modal de conta de investimento ────────────────────
function InvestAccountModal({ initial, onSave, onClose }) {
  const color = "#a78bfa";
  const [form, setForm] = useState(initial || EMPTY_ACCOUNT);

  function save() {
    if (!form.name) return;
    onSave({
      ...form,
      initialBalance: unmaskBRL(form.initialBalance),
      yieldRate: form.yieldRate ? parseFloat(form.yieldRate.replace(",", ".")) : null,
    });
  }

  return (
    <Modal title={initial?.id ? "EDITAR INVESTIMENTO" : "NOVO INVESTIMENTO"} color={color} onClose={onClose}>
      <div className="fs-form-grid">
        <div className="fs-field fs-field--full">
          <label className="fs-label">NOME DO INVESTIMENTO</label>
          <input className="fs-input" placeholder="Ex: Caixinha Turbo Nubank" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>
        <div className="fs-field">
          <label className="fs-label">INSTITUIÇÃO</label>
          <input className="fs-input" placeholder="Ex: Nubank, XP, BTG" value={form.bank}
            onChange={e => setForm({ ...form, bank: e.target.value })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">SALDO ATUAL (R$)</label>
          <input className="fs-input" placeholder="0,00" value={form.initialBalance}
            onChange={e => setForm({ ...form, initialBalance: maskBRL(e.target.value.replace(/\D/g, "")) })} />
        </div>

        {/* Rendimento */}
        <div className="fs-field">
          <label className="fs-label">TAXA DE RENDIMENTO</label>
          <input className="fs-input" placeholder="Ex: 115 ou 12,5" value={form.yieldRate}
            onChange={e => setForm({ ...form, yieldRate: e.target.value.replace(/[^0-9.,]/g, "") })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">REFERÊNCIA DO RENDIMENTO</label>
          <select className="fs-input" value={form.yieldRef}
            onChange={e => setForm({ ...form, yieldRef: e.target.value })}>
            {YIELD_REFS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="fs-field fs-field--full">
          <label className="fs-label">OBSERVAÇÕES</label>
          <textarea className="fs-input fs-textarea" placeholder="Notas opcionais..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>

        <div className="fs-field">
          <label className="fs-label">COR</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
            {INVEST_COLORS.map(c => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c,
                  border: "none", cursor: "pointer",
                  outline: form.color === c ? "3px solid white" : "none", outlineOffset: 2,
                }} />
            ))}
          </div>
        </div>
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={onClose}>CANCELAR</button>
        <button className="nx-modal-confirm" onClick={save}>
          {initial?.id ? "SALVAR" : "ADICIONAR"}
        </button>
      </div>
    </Modal>
  );
}

// ── Modal de aporte / resgate ─────────────────────────
function AporteModal({ account, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_APORTE });

  function save() {
    if (!form.amount) return;
    onSave({
      id:          Date.now(),
      accountId:   account.id,
      description: form.description || (form.type === "aporte" ? "Aporte" : "Resgate"),
      amount:      unmaskBRL(form.amount),
      date:        form.date,
      type:        form.type,
      notes:       form.notes,
    });
  }

  const isAporte = form.type === "aporte";

  return (
    <Modal
      title={`${isAporte ? "APORTE EM" : "RESGATE DE"} — ${account.name.toUpperCase()}`}
      color={account.color}
      onClose={onClose}
    >
      <div className="fs-form-grid">
        {/* Toggle aporte/resgate */}
        <div className="fs-field fs-field--full">
          <label className="fs-label">TIPO DE MOVIMENTAÇÃO</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: "aporte",  label: "Aporte (+)" },
              { val: "resgate", label: "Resgate (−)" },
            ].map(opt => (
              <button key={opt.val}
                onClick={() => setForm({ ...form, type: opt.val })}
                style={{
                  flex: 1, height: 40, borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${form.type === opt.val ? account.color : "rgba(255,255,255,0.10)"}`,
                  background: form.type === opt.val ? `${account.color}22` : "rgba(255,255,255,0.03)",
                  color: form.type === opt.val ? account.color : "rgba(255,255,255,0.55)",
                  fontSize: 10, letterSpacing: ".18em", fontFamily: "inherit",
                }}>
                {opt.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="fs-field">
          <label className="fs-label">VALOR (R$)</label>
          <input className="fs-input" placeholder="0,00" value={form.amount} autoFocus
            onChange={e => setForm({ ...form, amount: maskBRL(e.target.value.replace(/\D/g, "")) })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">DATA</label>
          <input className="fs-input" type="date" value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="fs-field fs-field--full">
          <label className="fs-label">DESCRIÇÃO (opcional)</label>
          <input className="fs-input" placeholder="Ex: Aporte mensal" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="fs-field fs-field--full">
          <label className="fs-label">OBSERVAÇÕES</label>
          <textarea className="fs-input fs-textarea" placeholder="Notas opcionais..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={onClose}>CANCELAR</button>
        <button className="nx-modal-confirm"
          style={{ borderColor: account.color, color: account.color }} onClick={save}>
          {isAporte ? "REGISTRAR APORTE" : "REGISTRAR RESGATE"}
        </button>
      </div>
    </Modal>
  );
}

// ── Módulo principal ──────────────────────────────────
export default function InvestimentosModule({
  investAccounts, setInvestAccounts,
  investMovements, setInvestMovements,
  onXp,
}) {
  const mod = MODULES.find(m => m.id === "investimentos");
  const now = new Date();

  const [accModal,   setAccModal]   = useState(false);
  const [editAcc,    setEditAcc]    = useState(null);
  const [aporteAcc,  setAporteAcc]  = useState(null);
  const [openAcc,    setOpenAcc]    = useState(null);

  // ── Saldo de cada conta ─────────────────────────────
  function calcBalance(acc) {
    const movs = investMovements.filter(m => m.accountId === acc.id);
    const total = movs.reduce((sum, m) => m.type === "aporte" ? sum + m.amount : sum - m.amount, 0);
    return (acc.initialBalance || 0) + total;
  }

  const totalInvestido = investAccounts.reduce((s, a) => s + calcBalance(a), 0);

  // ── Aportes do mês atual (para gráfico) ─────────────
  const thisMonthAportes = useMemo(() => {
    return investMovements
      .filter(m => {
        const d = new Date(m.date + "T00:00:00");
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && m.type === "aporte";
      })
      .reduce((s, m) => s + m.amount, 0);
  }, [investMovements]);

  function saveAccount(data) {
    if (editAcc) {
      setInvestAccounts(prev => prev.map(a => a.id === editAcc.id ? { ...a, ...data } : a));
    } else {
      setInvestAccounts(prev => [...prev, { id: Date.now(), movements: [], ...data }]);
      onXp("investimento_lancado");
    }
    setAccModal(false);
    setEditAcc(null);
  }

  function saveAporte(mov) {
    setInvestMovements(prev => [...prev, mov]);
    setAporteAcc(null);
    if (mov.type === "aporte") onXp("investimento_lancado");
  }

  return (
    <div className="fs-view">
      {/* Header */}
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons.trending}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">INVESTIMENTOS</h2>
          </div>
        </div>
        <div className="fs-view-header-right">
          <span className="fs-view-total" style={{ color: mod.color }}>{fmt(totalInvestido)}</span>
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }}
            onClick={() => { setEditAcc(null); setAccModal(true); }}>
            {Icons.plus} NOVO
          </button>
        </div>
      </div>

      {/* Resumo do mês */}
      {thisMonthAportes > 0 && (
        <div style={{
          padding: "12px 16px", borderRadius: 14, marginBottom: 8,
          background: `${mod.color}0f`, border: `1px solid ${mod.color}30`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 10, letterSpacing: ".2em", color: "rgba(255,255,255,0.45)" }}>
            APORTES EM {MONTHS_SHORT[now.getMonth()].toUpperCase()}/{now.getFullYear()}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: mod.color }}>{fmt(thisMonthAportes)}</span>
        </div>
      )}

      {/* Lista de contas de investimento */}
      {investAccounts.length === 0
        ? <p className="fs-empty">Nenhum investimento cadastrado</p>
        : investAccounts.map(acc => {
            const balance  = calcBalance(acc);
            const movs     = investMovements
              .filter(m => m.accountId === acc.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date));
            const totalAportes  = movs.filter(m => m.type === "aporte").reduce((s, m) => s + m.amount, 0) + (acc.initialBalance || 0);
            const totalResgates = movs.filter(m => m.type === "resgate").reduce((s, m) => s + m.amount, 0);
            const isOpen = openAcc === acc.id;

            return (
              <div key={acc.id} className="fs-card glass-premium"
                style={{ borderLeft: `3px solid ${acc.color}`, marginBottom: 12 }}>

                {/* Cabeçalho da conta */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${acc.color}22`, border: `1px solid ${acc.color}44`,
                    display: "grid", placeItems: "center", color: acc.color,
                  }}>{Icons.trending}</div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)", letterSpacing: ".08em" }}>
                      {acc.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", marginTop: 2, letterSpacing: ".1em" }}>
                      {acc.bank}
                      {acc.yieldRate
                        ? ` · ${acc.yieldRate}${acc.yieldRef.startsWith("%") ? "" : " "}${acc.yieldRef}`
                        : ""}
                    </div>
                  </div>

                  {/* Saldo */}
                  <div style={{ textAlign: "right", marginRight: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: acc.color }}>{fmt(balance)}</div>
                    {totalResgates > 0 && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", marginTop: 2 }}>
                        Resgatado: {fmt(totalResgates)}
                      </div>
                    )}
                  </div>

                  <button className="fs-icon-btn" onClick={() => { setEditAcc(acc); setAccModal(true); }}>{Icons.edit}</button>
                  <button className="fs-del-btn" onClick={() => {
                    setInvestAccounts(prev => prev.filter(a => a.id !== acc.id));
                    setInvestMovements(prev => prev.filter(m => m.accountId !== acc.id));
                  }}>{Icons.trash}</button>
                </div>

                {/* Barra de progresso (aportes vs saldo) */}
                <MiniBar value={balance} max={totalAportes} color={acc.color} />
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 9, color: "rgba(255,255,255,0.30)", marginTop: 4, letterSpacing: ".1em",
                }}>
                  <span>TOTAL APORTADO: {fmt(totalAportes)}</span>
                  <span>{movs.length} movimentação{movs.length !== 1 ? "ões" : ""}</span>
                </div>

                {/* Botões */}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="fs-new-btn" style={{ "--mod-color": acc.color, flex: 1 }}
                    onClick={() => setAporteAcc(acc)}>
                    {Icons.plus} MOVIMENTAR
                  </button>
                  <button className="fs-new-btn" style={{ "--mod-color": "rgba(255,255,255,0.3)", flex: 1 }}
                    onClick={() => setOpenAcc(isOpen ? null : acc.id)}>
                    {isOpen ? "▲ FECHAR" : "▼ HISTÓRICO"}
                  </button>
                </div>

                {/* Histórico expandido */}
                {isOpen && (
                  <div style={{ marginTop: 16 }}>
                    <p className="fs-section-label">HISTÓRICO DE MOVIMENTAÇÕES</p>
                    {movs.length === 0
                      ? <p className="fs-empty">Nenhuma movimentação registrada</p>
                      : <div className="fs-tx-list">
                          {movs.map(m => (
                            <div key={m.id} className="fs-tx-row"
                              style={{ "--tx-color": m.type === "aporte" ? acc.color : "#ef4444" }}>
                              <div className="fs-tx-icon">
                                {m.type === "aporte" ? Icons.arrowUp : Icons.arrowDown}
                              </div>
                              <div className="fs-tx-info">
                                <span className="fs-tx-desc">{m.description}</span>
                                <span className="fs-tx-meta">
                                  {m.type === "aporte" ? "Aporte" : "Resgate"}
                                  {" · "}{new Date(m.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                  {m.notes ? ` · ${m.notes}` : ""}
                                </span>
                              </div>
                              <span className="fs-tx-amount"
                                style={{ color: m.type === "aporte" ? acc.color : "#ef4444" }}>
                                {m.type === "aporte" ? "+" : "−"}{fmt(m.amount)}
                              </span>
                              <button className="fs-tx-del"
                                onClick={() => setInvestMovements(prev => prev.filter(x => x.id !== m.id))}>
                                {Icons.trash}
                              </button>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </div>
            );
          })
      }

      {accModal && (
        <InvestAccountModal
          initial={editAcc ? {
            ...editAcc,
            initialBalance: editAcc.initialBalance
              ? maskBRL(String(Math.round(editAcc.initialBalance * 100))) : "",
            yieldRate: editAcc.yieldRate != null ? String(editAcc.yieldRate) : "",
          } : null}
          onSave={saveAccount}
          onClose={() => { setAccModal(false); setEditAcc(null); }}
        />
      )}

      {aporteAcc && (
        <AporteModal account={aporteAcc} onSave={saveAporte} onClose={() => setAporteAcc(null)} />
      )}
    </div>
  );
}