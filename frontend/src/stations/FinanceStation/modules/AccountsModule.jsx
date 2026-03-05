import { useState } from "react";
import { Icons, MODULES, ACCOUNT_TYPES, maskBRL, unmaskBRL, fmt, calcAccountBalance } from "./financeConstants.jsx";
import { Modal } from "./financeComponents.jsx";

const EMPTY_FORM = { name: "", type: ACCOUNT_TYPES[0], balance: "", bank: "", color: "#38bdf8" };

export default function AccountsModule({ accounts, setAccounts, transactions, onXp }) {
  const mod = MODULES.find(m => m.id === "contas");
  const [modal,     setModal]     = useState(false);
  const [editId,    setEditId]    = useState(null);   // null = nova conta
  const [form,      setForm]      = useState(EMPTY_FORM);

  const totalBalance = accounts.reduce((a, b) => a + calcAccountBalance(b, transactions), 0);

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModal(true);
  }

  function openEdit(acc) {
    setEditId(acc.id);
    setForm({
      name:    acc.name,
      type:    acc.type,
      balance: acc.balance ? maskBRL(String(Math.round(acc.balance * 100))) : "",
      bank:    acc.bank || "",
      color:   acc.color || "#38bdf8",
    });
    setModal(true);
  }

  function save() {
    if (!form.name) return;
    const data = { ...form, balance: unmaskBRL(form.balance) };
    if (editId) {
      setAccounts(prev => prev.map(a => a.id === editId ? { ...a, ...data } : a));
    } else {
      setAccounts(prev => [...prev, { id: Date.now(), ...data }]);
      onXp("conta_cadastrada");
    }
    setModal(false);
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
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={openNew}>
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
                  <button className="fs-icon-btn" title="Editar conta" onClick={() => openEdit(a)}>
                    {Icons.edit}
                  </button>
                  <button className="fs-del-btn" title="Excluir conta" onClick={() => setAccounts(prev => prev.filter(x => x.id !== a.id))}>
                    {Icons.trash}
                  </button>
                </div>
                <div className="fs-account-balance" style={{ color: a.color }}>
                  {fmt(calcAccountBalance(a, transactions))}
                </div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <Modal
          title={editId ? "EDITAR CONTA" : "NOVA CONTA"}
          color={mod.color}
          onClose={() => setModal(false)}
        >
          <div className="fs-form-grid">
            <div className="fs-field fs-field--full">
              <label className="fs-label">NOME DA CONTA</label>
              <input className="fs-input" placeholder="Ex: Nubank Pessoal" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="fs-field">
              <label className="fs-label">TIPO</label>
              <select className="fs-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="fs-field">
              <label className="fs-label">BANCO / INSTITUIÇÃO</label>
              <input className="fs-input" placeholder="Ex: Nubank" value={form.bank}
                onChange={e => setForm({ ...form, bank: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">{editId ? "SALDO ATUAL (R$)" : "SALDO INICIAL (R$)"}</label>
              <input className="fs-input" placeholder="0,00" value={form.balance}
                onChange={e => setForm({ ...form, balance: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">COR</label>
              <input className="fs-input" type="color" value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ padding: "4px", height: "46px" }} />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setModal(false)}>CANCELAR</button>
            <button className="nx-modal-confirm" onClick={save}>
              {editId ? "SALVAR ALTERAÇÕES" : "ADICIONAR CONTA"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}