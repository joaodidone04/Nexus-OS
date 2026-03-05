// ── Module definitions ────────────────────────────────
export const MODULES = [
  { id: "dashboard",     label: "DASHBOARD",        color: "#3b82f6", icon: "chart"     },
  { id: "receitas",      label: "RECEITAS",          color: "#10b981", icon: "arrowUp"   },
  { id: "despesas",      label: "DESPESAS",          color: "#ef4444", icon: "arrowDown" },
  { id: "investimentos", label: "INVESTIMENTOS",     color: "#a78bfa", icon: "trending"  },
  { id: "cartoes",       label: "CARTÕES",           color: "#f97316", icon: "card"      },
  { id: "metas",         label: "METAS",             color: "#f59e0b", icon: "target"    },
  { id: "contas",        label: "CONTAS",            color: "#38bdf8", icon: "bank"      },
  { id: "extrato",       label: "EXTRATO",           color: "#f472b6", icon: "receipt"   },
];

export const DEFAULT_CATEGORIES = {
  receitas:      ["Salário", "Freelance", "Renda Extra", "Investimento", "Outros"],
  despesas:      ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Assinaturas", "Outros"],
  investimentos: ["Ações", "FIIs", "Renda Fixa", "Cripto", "Poupança", "Outros"],
};

export const ACCOUNT_TYPES = ["Conta Corrente", "Poupança", "Carteira", "Investimento"];
export const MONTHS_FULL   = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const MONTHS_SHORT  = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export const XP_RULES = {
  investimento_lancado: { xp: 10, label: "Investimento registrado",    icon: "trending" },
  aporte_meta:          { xp: 10, label: "Aporte em meta realizado",   icon: "target"   },
  saldo_positivo:       { xp: 10, label: "Saldo positivo no mês",      icon: "arrowUp"  },
  meta_concluida:       { xp: 25, label: "Meta 100% concluída!",       icon: "star"     },
  conta_cadastrada:     { xp:  5, label: "Conta cadastrada",           icon: "bank"     },
  sem_deficit_3meses:   { xp: 30, label: "3 meses sem déficit!",       icon: "xp"       },
};

// ── Icons ─────────────────────────────────────────────
export const Icons = {
  plus:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  close:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  edit:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  arrowUp:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  arrowDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  wallet:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  target:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bank:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  card:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  trending:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  check:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  checkCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  gear:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  receipt:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  chevLeft:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  star:      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  xp:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  repeat:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
};

// ── Helpers ───────────────────────────────────────────
export function maskBRL(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits || digits === "0") return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function unmaskBRL(masked) {
  if (!masked) return 0;
  return parseFloat(String(masked).replace(/\./g, "").replace(",", ".")) || 0;
}
export function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
export function todayStr() { return new Date().toISOString().split("T")[0]; }

export function calcAccountBalance(account, transactions) {
  const txs = transactions.filter(t => t.account === account.name);
  const entradas = txs.filter(t => t.type === "receitas" || t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const saidas   = txs.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  return (account.balance || 0) + entradas - saidas;
}

/**
 * Retorna o total consumido de um cartão de crédito num determinado mês/ano.
 * Considera lançamentos únicos, parcelas do mês e assinaturas ativas.
 */
export function calcCardUsed(card, cardTxs, month, year) {
  const now = new Date(year, month, 1);
  return cardTxs
    .filter(tx => tx.cardId === card.id)
    .reduce((total, tx) => {
      if (tx.chargeType === "unico") {
        const d = new Date(tx.date + "T00:00:00");
        if (d.getMonth() === month && d.getFullYear() === year) return total + tx.amount;
      }
      if (tx.chargeType === "parcelado") {
        // calcula quais parcelas caem neste mês
        for (let i = 0; i < tx.installments; i++) {
          const d = new Date(tx.date + "T00:00:00");
          d.setMonth(d.getMonth() + i);
          if (d.getMonth() === month && d.getFullYear() === year) return total + tx.installmentAmount;
        }
      }
      if (tx.chargeType === "assinatura") {
        const start = new Date(tx.date + "T00:00:00");
        const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        if (startMonth <= now) return total + tx.amount;
      }
      return total;
    }, 0);
}

/**
 * Gera faturas automáticas para um cartão baseado em suas transações.
 * Retorna array de { month, year, total, dueDate, paid }
 */
export function getCardInvoices(card, cardTxs) {
  const txs = cardTxs.filter(tx => tx.cardId === card.id);
  if (!txs.length) return [];

  // descobre range de meses
  const dates = txs.map(tx => new Date(tx.date + "T00:00:00"));
  const minDate = new Date(Math.min(...dates));
  const now = new Date();
  // projeta 3 meses à frente para mostrar parcelas futuras
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const invoices = [];
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cur <= maxDate) {
    const m = cur.getMonth();
    const y = cur.getFullYear();
    const total = calcCardUsed(card, cardTxs, m, y);
    if (total > 0) {
      const dueDay = card.dueDay || 10;
      const dueDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;
      const existing = card.invoices?.find(inv => inv.month === m && inv.year === y);
      invoices.push({ month: m, year: y, total, dueDate, paid: existing?.paid || false });
    }
    cur.setMonth(cur.getMonth() + 1);
  }
  return invoices;
}

/**
 * Retorna o total que está consumindo o limite do cartão AGORA.
 * = soma de todas as faturas em aberto (não pagas).
 * Quando uma fatura é marcada como paga, o valor sai do limite usado.
 */
export function calcCardLimitUsed(card, cardTxs) {
  const invoices = getCardInvoices(card, cardTxs);
  return invoices
    .filter(inv => !inv.paid)
    .reduce((sum, inv) => sum + inv.total, 0);
}

// ── useStorage hook ────────────────────────────────────
import { useState, useEffect } from "react";
export function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}