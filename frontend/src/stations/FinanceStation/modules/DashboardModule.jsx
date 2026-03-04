import { Icons, MODULES, MONTHS_FULL, MONTHS_SHORT, fmt, calcAccountBalance } from "./financeConstants.jsx";
import { BarChart, DonutChart, ProgressBar } from "./financeComponents.jsx";

export default function DashboardModule({ transactions, accounts, goals }) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalReceitas  = thisMonth.filter(t => t.type === "receitas").reduce((a, b) => a + b.amount, 0);
  const totalDespesas  = thisMonth.filter(t => t.type === "despesas").reduce((a, b) => a + b.amount, 0);
  const totalInvestido = thisMonth.filter(t => t.type === "investimentos").reduce((a, b) => a + b.amount, 0);
  const totalSaldo     = accounts.reduce((a, b) => a + calcAccountBalance(b, transactions), 0);
  const saldoLivre     = totalReceitas - totalDespesas;

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

      <div className="fs-balance glass-premium" style={{ "--bal-color": saldoLivre >= 0 ? "#10b981" : "#ef4444" }}>
        <span className="fs-balance-label">SALDO LIVRE DO MÊS</span>
        <span className="fs-balance-value">{fmt(saldoLivre)}</span>
        <span className="fs-balance-hint">{saldoLivre >= 0 ? "✦ POSITIVO" : "⚠ DÉFICIT"}</span>
      </div>

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