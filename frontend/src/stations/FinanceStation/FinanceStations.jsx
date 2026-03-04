import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";              // ← trocado
import { useXP } from "../../hooks/useXP";                       // ← XP via Firebase
import "./FinanceStations.css";

import { MODULES, XP_RULES, DEFAULT_CATEGORIES, useStorage } from "./modules/financeConstants.jsx";
import { XpToast } from "./modules/financeComponents.jsx";
import DashboardModule    from "./modules/DashboardModule.jsx";
import TransactionModule  from "./modules/TransactionModule.jsx";
import GoalsModule        from "./modules/GoalsModule.jsx";
import AccountsModule     from "./modules/AccountsModule.jsx";
import ExtratoModule      from "./modules/ExtratoModule.jsx";

export default function FinanceStation() {
  const navigate = useNavigate();
  const { award } = useXP();                                     // ← hook de XP Firebase

  const [active,       setActive]       = useState("dashboard");
  const [transactions, setTransactions] = useStorage("nx-finance-transactions", []);
  const [goals,        setGoals]        = useStorage("nx-finance-goals",        []);
  const [accounts,     setAccounts]     = useStorage("nx-finance-accounts",     []);
  const [categories,   setCategories]   = useStorage("nx-finance-categories",   DEFAULT_CATEGORIES);
  const [xpLog,        setXpLog]        = useStorage("nx-finance-xplog",        []);
  const [toasts,       setToasts]       = useState([]);

  const activeMod = MODULES.find(m => m.id === active);

  // ── XP engine ──────────────────────────────────────────────────────────
  // Mantém a lógica local de toast visual + chama o Firebase via useXP
  const grantXp = useCallback((ruleKey) => {
    const rule = XP_RULES[ruleKey];
    if (!rule) return;

    // Deduplica por mês para regras de saldo
    const now      = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const logKey   = `${ruleKey}:${monthKey}`;
    if ((ruleKey === "saldo_positivo" || ruleKey === "sem_deficit_3meses") && xpLog.includes(logKey)) return;
    if (ruleKey === "saldo_positivo" || ruleKey === "sem_deficit_3meses") setXpLog(prev => [...prev, logKey]);

    // Mapeia ruleKey para XP_ACTIONS do Firebase
    const actionMap = {
      nova_transacao:      "TRANSACTION_LOG",
      meta_criada:         "MISSION_CREATED",      // reutiliza
      meta_concluida:      "GOAL_REACHED",
      conta_criada:        "TRANSACTION_LOG",
      saldo_positivo:      "BUDGET_WEEK_OK",
      sem_deficit_3meses:  "BUDGET_WEEK_OK",
    };
    const fbAction = actionMap[ruleKey];
    if (fbAction) award(fbAction).catch(() => {});   // dispara sem bloquear

    // Toast local (mantém UX rápida)
    const id = Date.now();
    setToasts(prev => [...prev, { id, xp: rule.xp, label: rule.label, icon: rule.icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, [award, xpLog]);

  // ── Saldo positivo check ────────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const m = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const r = m.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
    const d = m.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
    if (r > 0 && r > d) grantXp("saldo_positivo");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // ── 3 meses sem déficit ─────────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const last3 = Array.from({ length: 3 }, (_, i) => {
      const m = now.getMonth() - 1 - i;
      return {
        month: ((m % 12) + 12) % 12,
        year:  now.getFullYear() + Math.floor((now.getMonth() - 1 - i) / 12),
      };
    });
    const allPositive = last3.every(({ month, year }) => {
      const txs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const r = txs.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
      const d = txs.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
      return r > 0 && r >= d;
    });
    if (allPositive) grantXp("sem_deficit_3meses");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // Renderiza direto — sem portal — para funcionar dentro do <Outlet />
  return (
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
              <span className="fs-nav-icon" style={{ color: active === m.id ? m.color : undefined }}>
                {m.id === "dashboard"     && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                {m.id === "receitas"      && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>}
                {m.id === "despesas"      && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>}
                {m.id === "investimentos" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                {m.id === "metas"         && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
                {m.id === "contas"        && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>}
                {m.id === "extrato"       && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
              </span>
              <span className="fs-nav-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="fs-station-tag">
          <span>FINANCE</span>
          <span className="fs-station-dot" style={{ color: activeMod?.color }}>●</span>
          <span>STATION</span>
        </div>
      </aside>

      {/* Main */}
      <main className="fs-main">
        <div className="fs-main-inner">
          {active === "dashboard"     && <DashboardModule   transactions={transactions} accounts={accounts} goals={goals} />}
          {active === "receitas"      && <TransactionModule type="receitas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "despesas"      && <TransactionModule type="despesas"      transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "investimentos" && <TransactionModule type="investimentos" transactions={transactions} setTransactions={setTransactions} accounts={accounts} categories={categories} setCategories={setCategories} onXp={grantXp} />}
          {active === "metas"         && <GoalsModule       goals={goals}        setGoals={setGoals}        onXp={grantXp} />}
          {active === "contas"        && <AccountsModule    accounts={accounts}  setAccounts={setAccounts}  transactions={transactions} onXp={grantXp} />}
          {active === "extrato"       && <ExtratoModule     transactions={transactions} accounts={accounts} />}
        </div>
      </main>
    </div>
  );
}