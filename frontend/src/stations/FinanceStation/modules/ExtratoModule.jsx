import { useState } from "react";
import { Icons, MODULES, MONTHS_FULL, fmt } from "./financeConstants.jsx";

export default function ExtratoModule({ transactions, accounts }) {
  const now = new Date();
  const [viewYear,   setViewYear]   = useState(now.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(now.getMonth());
  const [filterType, setFilterType] = useState("all");
  const mod = MODULES.find(m => m.id === "extrato");

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

  return (
    <div className="fs-view">
      <div className="fs-view-header glass-premium" style={{ "--mod-color": mod.color }}>
        <div className="fs-view-header-left">
          <div className="fs-view-icon" style={{ color: mod.color }}>{Icons.receipt}</div>
          <div>
            <p className="fs-view-kicker">FINANCE STATION</p>
            <h2 className="fs-view-title">EXTRATO</h2>
          </div>
        </div>
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

      <div className="fs-extrato-kpis">
        {[
          { label: "RECEITAS",    value: fmt(totalReceitas),  color: "#10b981" },
          { label: "DESPESAS",    value: fmt(totalDespesas),  color: "#ef4444" },
          { label: "INVESTIDO",   value: fmt(totalInvestido), color: "#a78bfa" },
          { label: "SALDO LIVRE", value: fmt(saldo),          color: saldo >= 0 ? "#10b981" : "#ef4444" },
        ].map((k, i) => (
          <div key={i} className="fs-extrato-kpi glass-premium" style={{ "--kpi-color": k.color }}>
            <span className="fs-extrato-kpi-label">{k.label}</span>
            <span className="fs-extrato-kpi-value" style={{ color: k.color }}>{k.value}</span>
          </div>
        ))}
      </div>

      <div className="fs-filters">
        {["all","receitas","despesas","investimentos"].map(t => (
          <button key={t}
            className={`fs-filter-chip ${filterType === t ? "is-active" : ""}`}
            style={{ "--chip-color": t === "all" ? mod.color : MODULES.find(m => m.id === t)?.color }}
            onClick={() => setFilterType(t)}>
            {t === "all" ? "TODOS" : t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="fs-card glass-premium">
        <p className="fs-section-label">
          {sorted.length} LANÇAMENTO{sorted.length !== 1 ? "S" : ""} — {MONTHS_FULL[viewMonth].toUpperCase()} {viewYear}
        </p>
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
                        {tx.category}{tx.account ? ` · ${tx.account}` : ""}
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