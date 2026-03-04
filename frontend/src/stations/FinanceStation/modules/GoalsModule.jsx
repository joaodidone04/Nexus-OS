import { useState } from "react";
import { Icons, MODULES, maskBRL, unmaskBRL, fmt } from "./financeConstants.jsx";
import { ProgressBar, Modal } from "./financeComponents.jsx";

export default function GoalsModule({ goals, setGoals, onXp }) {
  const mod = MODULES.find(m => m.id === "metas");
  const [modal,      setModal]      = useState(false);
  const [depositId,  setDepositId]  = useState(null);
  const [depositVal, setDepositVal] = useState("");
  const [form, setForm] = useState({ name: "", target: "", current: "", deadline: "", description: "" });

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
              <input className="fs-input" placeholder="Ex: Reserva de Emergência" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR ALVO (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.target}
                onChange={e => setForm({ ...form, target: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR ATUAL (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.current}
                onChange={e => setForm({ ...form, current: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">PRAZO</label>
              <input className="fs-input" type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">DESCRIÇÃO</label>
              <textarea className="fs-input fs-textarea" placeholder="Descreva sua meta..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
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
              <input className="fs-input" placeholder="0,00" value={depositVal} autoFocus
                onChange={e => setDepositVal(maskBRL(e.target.value.replace(/\D/g,"")))} />
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