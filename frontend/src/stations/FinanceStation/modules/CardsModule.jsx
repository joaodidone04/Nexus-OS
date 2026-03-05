import { useState, useMemo } from "react";
import {
  Icons, MODULES, maskBRL, unmaskBRL, fmt, todayStr,
  calcCardUsed, calcCardLimitUsed, getCardInvoices, MONTHS_FULL,
} from "./financeConstants.jsx";
import { Modal } from "./financeComponents.jsx";

const CARD_COLORS = ["#f97316","#ef4444","#a78bfa","#38bdf8","#10b981","#f59e0b","#ec4899"];
const EMPTY_CARD = {
  name: "", bank: "", color: "#f97316",
  limit: "", closingDay: "1", dueDay: "10",
};
const EMPTY_TX = {
  description: "", amount: "", date: todayStr(),
  category: "Outros", chargeType: "unico",
  // parcelado
  totalAmount: "", installments: "2", installmentAmount: "",
  notes: "",
};

// ── Componente de barra de uso do limite ──────────────
function LimitBar({ used, limit, color }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : color;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: ".1em" }}>
        <span>USADO: {fmt(used)}</span>
        <span>DISPONÍVEL: {fmt(Math.max(limit - used, 0))}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width .5s ease" }} />
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: ".1em" }}>
        LIMITE TOTAL: {fmt(limit)} · {Math.round(pct)}% utilizado
      </div>
    </div>
  );
}

// ── Modal de novo cartão ──────────────────────────────
function CardFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_CARD);
  const mod = MODULES.find(m => m.id === "cartoes");

  function save() {
    if (!form.name) return;
    onSave({
      ...form,
      limit:      unmaskBRL(form.limit),
      closingDay: Number(form.closingDay),
      dueDay:     Number(form.dueDay),
    });
  }

  return (
    <Modal title={initial?.id ? "EDITAR CARTÃO" : "NOVO CARTÃO"} color={mod.color} onClose={onClose}>
      <div className="fs-form-grid">
        <div className="fs-field fs-field--full">
          <label className="fs-label">NOME DO CARTÃO</label>
          <input className="fs-input" placeholder="Ex: Nubank PJ" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>
        <div className="fs-field">
          <label className="fs-label">BANCO / BANDEIRA</label>
          <input className="fs-input" placeholder="Ex: Nubank Visa" value={form.bank}
            onChange={e => setForm({ ...form, bank: e.target.value })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">LIMITE (R$)</label>
          <input className="fs-input" placeholder="0,00" value={form.limit}
            onChange={e => setForm({ ...form, limit: maskBRL(e.target.value.replace(/\D/g,"")) })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">DIA DE FECHAMENTO</label>
          <select className="fs-input" value={form.closingDay}
            onChange={e => setForm({ ...form, closingDay: e.target.value })}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d =>
              <option key={d} value={d}>Dia {d}</option>
            )}
          </select>
        </div>
        <div className="fs-field">
          <label className="fs-label">DIA DE VENCIMENTO</label>
          <select className="fs-input" value={form.dueDay}
            onChange={e => setForm({ ...form, dueDay: e.target.value })}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d =>
              <option key={d} value={d}>Dia {d}</option>
            )}
          </select>
        </div>
        <div className="fs-field">
          <label className="fs-label">COR</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
            {CARD_COLORS.map(c => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c, border: "none",
                  cursor: "pointer", outline: form.color === c ? `3px solid white` : "none",
                  outlineOffset: 2,
                }} />
            ))}
          </div>
        </div>
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={onClose}>CANCELAR</button>
        <button className="nx-modal-confirm" onClick={save}>
          {initial?.id ? "SALVAR" : "ADICIONAR CARTÃO"}
        </button>
      </div>
    </Modal>
  );
}

// ── Modal de novo lançamento no cartão ────────────────
function TxFormModal({ card, cardTxs, onSave, onClose }) {
  const mod = MODULES.find(m => m.id === "cartoes");
  const [form,      setForm]      = useState(EMPTY_TX);
  const [limitErr,  setLimitErr]  = useState("");

  function handleAmountChange(raw) {
    const masked = maskBRL(raw.replace(/\D/g,""));
    // auto-calcula valor da parcela
    const total = unmaskBRL(masked);
    const inst  = Number(form.installments) || 1;
    const instMasked = inst > 1 ? maskBRL(String(Math.round((total / inst) * 100))) : "";
    setForm({ ...form, amount: masked, totalAmount: masked, installmentAmount: instMasked });
  }

  function handleInstallmentsChange(val) {
    const n     = Number(val) || 1;
    const total = unmaskBRL(form.totalAmount);
    const instMasked = n > 1 && total > 0 ? maskBRL(String(Math.round((total / n) * 100))) : "";
    setForm({ ...form, installments: val, installmentAmount: instMasked });
  }

  function save() {
    if (!form.description || !form.amount) return;

    // ── Valida limite disponível ──────────────────────
    if (card.limit > 0) {
      const now     = new Date();
      const usedNow  = calcCardLimitUsed(card, cardTxs);
      const available = card.limit - usedNow;
      const newValue  = form.chargeType === "parcelado"
        ? unmaskBRL(form.installmentAmount)   // só a parcela do mês conta no limite
        : unmaskBRL(form.amount);

      if (newValue > available) {
        setLimitErr(
          `Limite insuficiente. Disponível: ${fmt(available)} · Lançamento: ${fmt(newValue)}`
        );
        return;
      }
    }
    setLimitErr("");

    const base = {
      id:          Date.now(),
      cardId:      card.id,
      description: form.description,
      date:        form.date,
      category:    form.category,
      chargeType:  form.chargeType,
      notes:       form.notes,
    };
    if (form.chargeType === "parcelado") {
      onSave({
        ...base,
        amount:             unmaskBRL(form.totalAmount),
        installments:       Number(form.installments),
        installmentAmount:  unmaskBRL(form.installmentAmount),
      });
    } else {
      onSave({ ...base, amount: unmaskBRL(form.amount) });
    }
  }

  const CATS = ["Alimentação","Transporte","Saúde","Educação","Lazer","Assinaturas","Vestuário","Outros"];

  return (
    <Modal title={`LANÇAR NO ${card.name.toUpperCase()}`} color={card.color} onClose={onClose}>
      <div className="fs-form-grid">
        <div className="fs-field fs-field--full">
          <label className="fs-label">DESCRIÇÃO</label>
          <input className="fs-input" placeholder="Ex: Mercado, Netflix..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} autoFocus />
        </div>

        {/* Tipo de cobrança */}
        <div className="fs-field fs-field--full">
          <label className="fs-label">TIPO DE COBRANÇA</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: "unico",     label: "Único"      },
              { val: "parcelado", label: "Parcelado"  },
              { val: "assinatura",label: "Assinatura" },
            ].map(opt => (
              <button key={opt.val}
                onClick={() => setForm({ ...form, chargeType: opt.val })}
                style={{
                  flex: 1, height: 40, borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${form.chargeType === opt.val ? card.color : "rgba(255,255,255,0.10)"}`,
                  background: form.chargeType === opt.val ? `${card.color}22` : "rgba(255,255,255,0.03)",
                  color: form.chargeType === opt.val ? card.color : "rgba(255,255,255,0.55)",
                  fontSize: 10, letterSpacing: ".18em", fontFamily: "inherit",
                }}>
                {opt.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Valor — parcelado mostra campos extras */}
        {form.chargeType === "parcelado" ? (
          <>
            <div className="fs-field">
              <label className="fs-label">VALOR TOTAL (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.totalAmount}
                onChange={e => handleAmountChange(e.target.value)} />
            </div>
            <div className="fs-field">
              <label className="fs-label">Nº DE PARCELAS</label>
              <select className="fs-input" value={form.installments}
                onChange={e => handleInstallmentsChange(e.target.value)}>
                {[2,3,4,5,6,7,8,9,10,11,12,18,24].map(n =>
                  <option key={n} value={n}>{n}x</option>
                )}
              </select>
            </div>
            <div className="fs-field fs-field--full">
              <label className="fs-label">VALOR DE CADA PARCELA (R$)</label>
              <input className="fs-input" placeholder="0,00" value={form.installmentAmount}
                onChange={e => setForm({ ...form, installmentAmount: maskBRL(e.target.value.replace(/\D/g,"")) })} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                {form.installments}x de {fmt(unmaskBRL(form.installmentAmount))} — Total: {fmt(unmaskBRL(form.totalAmount))}
              </span>
            </div>
          </>
        ) : (
          <div className="fs-field">
            <label className="fs-label">VALOR (R$)</label>
            <input className="fs-input" placeholder="0,00" value={form.amount}
              onChange={e => setForm({ ...form, amount: maskBRL(e.target.value.replace(/\D/g,"")) })} />
          </div>
        )}

        <div className="fs-field">
          <label className="fs-label">DATA DO LANÇAMENTO</label>
          <input className="fs-input" type="date" value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="fs-field">
          <label className="fs-label">CATEGORIA</label>
          <select className="fs-input" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="fs-field fs-field--full">
          <label className="fs-label">OBSERVAÇÕES</label>
          <textarea className="fs-input fs-textarea" placeholder="Notas opcionais..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        {/* Erro de limite */}
        {limitErr && (
          <div style={{
            gridColumn: "1 / -1", padding: "10px 14px", borderRadius: 10,
            background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)",
            color: "#ef4444", fontSize: 11, letterSpacing: ".08em",
          }}>
            ⚠ {limitErr}
          </div>
        )}
      </div>
      <div className="nx-modal-footer">
        <button className="nx-modal-link" onClick={onClose}>CANCELAR</button>
        <button className="nx-modal-confirm" style={{ borderColor: card.color, color: card.color }} onClick={save}>
          LANÇAR
        </button>
      </div>
    </Modal>
  );
}

// ── Módulo principal ──────────────────────────────────
export default function CartoesModule({ cards, setCards, cardTxs, setCardTxs }) {
  const mod = MODULES.find(m => m.id === "cartoes");
  const now = new Date();

  const [cardModal,  setCardModal]  = useState(false);
  const [editCard,   setEditCard]   = useState(null);
  const [txModal,    setTxModal]    = useState(null);   // card object
  const [openCard,   setOpenCard]   = useState(null);   // card id expandido

  function saveCard(data) {
    if (editCard) {
      setCards(prev => prev.map(c => c.id === editCard.id ? { ...c, ...data } : c));
    } else {
      setCards(prev => [...prev, { id: Date.now(), invoices: [], ...data }]);
    }
    setCardModal(false);
    setEditCard(null);
  }

  function addTx(tx) {
    setCardTxs(prev => [...prev, tx]);
    setTxModal(null);
  }

  function markInvoicePaid(card, month, year) {
    setCards(prev => prev.map(c => {
      if (c.id !== card.id) return c;
      const invoices = c.invoices || [];
      const idx = invoices.findIndex(i => i.month === month && i.year === year);
      if (idx >= 0) {
        const updated = [...invoices];
        updated[idx] = { ...updated[idx], paid: true };
        return { ...c, invoices: updated };
      }
      return { ...c, invoices: [...invoices, { month, year, paid: true }] };
    }));
  }

  return (
    <div className="fs-view">
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons.card}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">CARTÕES</h2>
          </div>
        </div>
        <div className="fs-view-header-right">
          <button className="fs-new-btn" style={{ "--mod-color": mod.color }} onClick={() => { setEditCard(null); setCardModal(true); }}>
            {Icons.plus} NOVO CARTÃO
          </button>
        </div>
      </div>

      {cards.length === 0
        ? <p className="fs-empty">Nenhum cartão cadastrado</p>
        : cards.map(card => {
            const usedNow   = calcCardLimitUsed(card, cardTxs);
            const invoices  = getCardInvoices(card, cardTxs);
            const isOpen    = openCard === card.id;
            const myTxs     = cardTxs.filter(t => t.cardId === card.id)
                                     .sort((a, b) => new Date(b.date) - new Date(a.date));

            return (
              <div key={card.id} className="fs-card glass-premium" style={{ borderLeft: `3px solid ${card.color}`, marginBottom: 12 }}>
                {/* Header do cartão */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${card.color}22`, border: `1px solid ${card.color}44`,
                    display: "grid", placeItems: "center", color: card.color,
                  }}>{Icons.card}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)", letterSpacing: ".08em" }}>
                      {card.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", marginTop: 2, letterSpacing: ".1em" }}>
                      {card.bank} · Fecha dia {card.closingDay} · Vence dia {card.dueDay}
                    </div>
                  </div>
                  <button className="fs-icon-btn" onClick={() => { setEditCard(card); setCardModal(true); }}>{Icons.edit}</button>
                  <button className="fs-del-btn" onClick={() => {
                    setCards(prev => prev.filter(c => c.id !== card.id));
                    setCardTxs(prev => prev.filter(t => t.cardId !== card.id));
                  }}>{Icons.trash}</button>
                </div>

                {/* Barra de limite */}
                <LimitBar used={usedNow} limit={card.limit || 0} color={card.color} />

                {/* Botões de ação */}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="fs-new-btn" style={{ "--mod-color": card.color, flex: 1 }}
                    onClick={() => setTxModal(card)}>
                    {Icons.plus} LANÇAR
                  </button>
                  <button className="fs-new-btn" style={{ "--mod-color": "rgba(255,255,255,0.3)", flex: 1 }}
                    onClick={() => setOpenCard(isOpen ? null : card.id)}>
                    {isOpen ? "▲ FECHAR" : "▼ FATURAS E LANÇAMENTOS"}
                  </button>
                </div>

                {/* Painel expandido */}
                {isOpen && (
                  <div style={{ marginTop: 16 }}>
                    {/* Faturas */}
                    {invoices.length > 0 && (
                      <>
                        <p className="fs-section-label">FATURAS</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                          {invoices.map((inv, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "10px 12px", borderRadius: 12,
                              background: inv.paid ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${inv.paid ? "rgba(16,185,129,0.20)" : "rgba(255,255,255,0.07)"}`,
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>
                                  {MONTHS_FULL[inv.month]} {inv.year}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                                  Vence: {new Date(inv.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                                </div>
                              </div>
                              <span style={{
                                fontSize: 14, fontWeight: 700,
                                color: inv.paid ? "#10b981" : card.color,
                              }}>{fmt(inv.total)}</span>
                              {inv.paid
                                ? <span style={{ fontSize: 10, color: "#10b981", letterSpacing: ".15em" }}>✓ PAGA</span>
                                : <button
                                    onClick={() => markInvoicePaid(card, inv.month, inv.year)}
                                    style={{
                                      padding: "4px 10px", borderRadius: 8, cursor: "pointer",
                                      border: `1px solid ${card.color}66`,
                                      background: `${card.color}15`,
                                      color: card.color, fontSize: 9, letterSpacing: ".15em",
                                      fontFamily: "inherit",
                                    }}>
                                    MARCAR PAGA
                                  </button>
                              }
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Lançamentos */}
                    <p className="fs-section-label">LANÇAMENTOS</p>
                    {myTxs.length === 0
                      ? <p className="fs-empty">Nenhum lançamento</p>
                      : <div className="fs-tx-list">
                          {myTxs.map(tx => (
                            <div key={tx.id} className="fs-tx-row" style={{ "--tx-color": card.color }}>
                              <div className="fs-tx-icon">{Icons.card}</div>
                              <div className="fs-tx-info">
                                <span className="fs-tx-desc">{tx.description}</span>
                                <span className="fs-tx-meta">
                                  {tx.category} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                  {" · "}
                                  {tx.chargeType === "parcelado"
                                    ? `${tx.installments}x de ${fmt(tx.installmentAmount)}`
                                    : tx.chargeType === "assinatura" ? "Assinatura" : "Único"}
                                </span>
                              </div>
                              <span className="fs-tx-amount" data-type="despesas">{fmt(tx.amount)}</span>
                              <button className="fs-tx-del"
                                onClick={() => setCardTxs(prev => prev.filter(t => t.id !== tx.id))}>
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

      {cardModal && (
        <CardFormModal
          initial={editCard ? {
            ...editCard,
            limit: editCard.limit ? maskBRL(String(Math.round(editCard.limit * 100))) : "",
            closingDay: String(editCard.closingDay),
            dueDay:     String(editCard.dueDay),
          } : null}
          onSave={saveCard}
          onClose={() => { setCardModal(false); setEditCard(null); }}
        />
      )}

      {txModal && (
        <TxFormModal card={txModal} cardTxs={cardTxs} onSave={addTx} onClose={() => setTxModal(null)} />
      )}
    </div>
  );
}