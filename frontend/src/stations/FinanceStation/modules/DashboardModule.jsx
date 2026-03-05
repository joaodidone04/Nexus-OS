import { Icons, MODULES, MONTHS_FULL, MONTHS_SHORT, fmt, calcAccountBalance, calcCardUsed, calcCardLimitUsed, getCardInvoices } from "./financeConstants.jsx";
import { BarChart, DonutChart, ProgressBar } from "./financeComponents.jsx";

export default function DashboardModule({ transactions, accounts, goals, cards = [], cardTxs = [], investAccounts = [], investMovements = [] }) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalReceitas  = thisMonth.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
  const totalDespesas  = thisMonth.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  const saldoLivre     = totalReceitas - totalDespesas;

  // Total investido via novo módulo
  function calcInvestBalance(acc) {
    const movs = investMovements.filter(m => m.accountId === acc.id);
    return (acc.initialBalance || 0) + movs.reduce((s, m) => m.type === "aporte" ? s + m.amount : s - m.amount, 0);
  }
  const totalInvestido = investAccounts.reduce((s, a) => s + calcInvestBalance(a), 0);
  const totalSaldo     = accounts.reduce((a, b) => a + calcAccountBalance(b, transactions), 0);

  // ── Dados dos cartões ──────────────────────────────
  const cardsWithData = cards.map(card => {
    const usedNow  = calcCardLimitUsed(card, cardTxs);
    const invoices = getCardInvoices(card, cardTxs);
    const pendingInvoices = invoices.filter(inv => !inv.paid);
    const totalPending = pendingInvoices.reduce((a, b) => a + b.total, 0);
    return { ...card, usedNow, invoices, totalPending };
  });
  const totalCartoes = cardsWithData.reduce((a, b) => a + b.usedNow, 0);

  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const val = transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === "despesas";
      })
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

      {/* KPIs */}
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

      {/* Saldo livre */}
      <div className="fs-balance glass-premium" style={{ "--bal-color": saldoLivre >= 0 ? "#10b981" : "#ef4444" }}>
        <span className="fs-balance-label">SALDO LIVRE DO MÊS</span>
        <span className="fs-balance-value">{fmt(saldoLivre)}</span>
        <span className="fs-balance-hint">{saldoLivre >= 0 ? "✦ POSITIVO" : "⚠ DÉFICIT"}</span>
      </div>

      {/* ── Cartões de Crédito ── */}
      {cardsWithData.length > 0 && (
        <div className="fs-card glass-premium">
          <p className="fs-section-label">CARTÕES DE CRÉDITO — {MONTHS_FULL[now.getMonth()].toUpperCase()}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cardsWithData.map(card => {
              const pct = card.limit > 0 ? Math.min((card.usedNow / card.limit) * 100, 100) : 0;
              const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : card.color;
              // próxima fatura pendente
              const nextInv = card.invoices
                .filter(i => !i.paid)
                .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)[0];

              return (
                <div key={card.id} style={{
                  padding: "14px 16px", borderRadius: 16,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${card.color}33`,
                  borderLeft: `3px solid ${card.color}`,
                }}>
                  {/* Nome + banco */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `${card.color}22`, border: `1px solid ${card.color}44`,
                      display: "grid", placeItems: "center", color: card.color,
                    }}>{Icons.card}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: ".08em" }}>
                        {card.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
                        {card.bank} · Fecha dia {card.closingDay} · Vence dia {card.dueDay}
                      </div>
                    </div>
                    {nextInv && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: ".1em" }}>PRÓX. FATURA</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: card.color }}>{fmt(nextInv.total)}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.30)" }}>
                          vence {new Date(nextInv.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra de limite */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.40)", marginBottom: 4 }}>
                      <span>Usado: {fmt(card.usedNow)}</span>
                      <span>Disponível: {fmt(Math.max((card.limit || 0) - card.usedNow, 0))}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width .5s ease" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.30)", marginTop: 4, textAlign: "right" }}>
                      Limite: {fmt(card.limit || 0)} · {Math.round(pct)}% utilizado
                    </div>
                  </div>

                  {/* Faturas pendentes */}
                  {card.invoices.filter(i => !i.paid).length > 1 && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: ".1em" }}>
                      {card.invoices.filter(i => !i.paid).length} faturas em aberto · Total: {fmt(card.totalPending)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total geral cartões */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderRadius: 12,
              background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.20)",
            }}>
              <span style={{ fontSize: 10, letterSpacing: ".2em", color: "rgba(255,255,255,0.45)" }}>
                TOTAL EM CARTÕES ESTE MÊS
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f97316" }}>{fmt(totalCartoes)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
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

      {/* Transações recentes */}
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
                    <span className="fs-tx-amount" data-type={tx.type}>
                      {tx.type === "receitas" ? "+" : "-"}{fmt(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
        }
      </div>

      {/* Metas */}
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