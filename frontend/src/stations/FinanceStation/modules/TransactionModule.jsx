import { useState, useEffect } from "react";
import { Icons, MODULES, DEFAULT_CATEGORIES, maskBRL, unmaskBRL, fmt, todayStr } from "./financeConstants.jsx";
import { Modal } from "./financeComponents.jsx";

function CategoryModal({ type, categories, setCategories, onClose }) {
  const mod  = MODULES.find(m => m.id === type);
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
          <input className="fs-input" placeholder="Nova categoria..." value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()} />
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={add}>
            {Icons.plus} ADICIONAR
          </button>
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
              ))}
        </div>
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={() => setCategories(prev => ({ ...prev, [type]: DEFAULT_CATEGORIES[type] }))}>
          RESTAURAR PADRÃO
        </button>
        <button className="nx-modal-confirm" style={{ borderColor: mod.color, color: mod.color }} onClick={onClose}>
          FECHAR
        </button>
      </div>
    </Modal>
  );
}

export default function TransactionModule({ type, transactions, setTransactions, accounts, categories, setCategories, onXp }) {
  const mod  = MODULES.find(m => m.id === type);
  const cats = categories[type] || [];
  const [modal,    setModal]    = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [form, setForm] = useState({
    description: "", amount: "", category: cats[0] || "",
    date: todayStr(), account: "", notes: ""
  });

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
          <button className="fs-gear-btn" onClick={() => setCatModal(true)} title="Configurar categorias">
            {Icons.gear}
          </button>
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={() => setModal(true)}>
            {Icons.plus} NOVA {label}
          </button>
        </div>
      </div>

      <div className="fs-filters">
        <button className={`fs-filter-chip ${filter === "all" ? "is-active" : ""}`} style={{ "--chip-color": mod.color }} onClick={() => setFilter("all")}>
          TODAS
        </button>
        {cats.map(c => (
          <button key={c}
            className={`fs-filter-chip ${filter === c ? "is-active" : ""}`}
            style={{ "--chip-color": mod.color }}
            onClick={() => setFilter(c)}>
            {c.toUpperCase()}
          </button>
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
                    <span className="fs-tx-meta">
                      {tx.category}{tx.account ? ` · ${tx.account}` : ""}
                      {" · "}{new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                    {tx.notes && <span className="fs-tx-notes">{tx.notes}</span>}
                  </div>
                  <span className="fs-tx-amount" data-type={tx.type}>
                    {type === "receitas" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                  <button className="fs-tx-del" onClick={() => setTransactions(prev => prev.filter(t => t.id !== tx.id))}>
                    {Icons.trash}
                  </button>
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
              <input className="fs-input" placeholder="Ex: Salário mensal" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">VALOR (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.amount}
                onChange={e => setForm({ ...form, amount: maskBRL(e.target.value.replace(/\D/g,"")) })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">DATA</label>
              <input className="fs-input" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="fs-field">
              <label className="fs-label">CATEGORIA</label>
              <select className="fs-input" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="fs-field">
              <label className="fs-label">CONTA</label>
              <select className="fs-input" value={form.account}
                onChange={e => setForm({ ...form, account: e.target.value })}>
                <option value="">Selecionar conta</option>
                {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">OBSERVAÇÕES</label>
              <textarea className="fs-input fs-textarea" placeholder="Notas opcionais..." value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="nx-modal-footer">
            <button className="nx-modal-link" onClick={() => setModal(false)}>CANCELAR</button>
            <button className="nx-modal-confirm" style={{ borderColor: mod.color, color: mod.color }} onClick={add}>
              REGISTRAR
            </button>
          </div>
        </Modal>
      )}

      {catModal && (
        <CategoryModal type={type} categories={categories} setCategories={setCategories} onClose={() => setCatModal(false)} />
      )}
    </div>
  );
}