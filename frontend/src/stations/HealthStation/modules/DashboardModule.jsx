/**
 * NΞXUS — Health Station
 * DashboardModule.jsx
 * Visão geral dos 6 módulos de saúde
 */
import { useState, useEffect } from "react";
import { API } from "../healthApi";

// ── Mini bar chart ─────────────────────────────────────────────────────────
function MiniBar({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="hd-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="hd-bar-col">
          <div className="hd-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: color }} />
          <span className="hd-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Ring progress ──────────────────────────────────────────────────────────
function Ring({ pct, color, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="hd-stat-pill" style={{ "--c": color }}>
      <span className="hd-stat-pill-val" style={{ color }}>{value}</span>
      <span className="hd-stat-pill-label">{label}</span>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────
function SectionCard({ icon, label, color, children, empty }) {
  return (
    <div className="hd-section glass-premium" style={{ "--c": color }}>
      <div className="hd-section-header">
        <span className="hd-section-icon">{icon}</span>
        <span className="hd-section-label">{label}</span>
        <div className="hd-section-glow-line" />
      </div>
      {empty
        ? <p className="hd-empty">Sem dados registrados</p>
        : children
      }
    </div>
  );
}

const DAYS  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmt2(v, unit = "") { return v != null ? `${v}${unit}` : "—"; }
function fmtH(min) {
  if (!min) return "—";
  return `${Math.floor(min/60)}h${String(min%60).padStart(2,"0")}m`;
}

export default function DashboardModule({ profileId, color }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/diet/summary?profile_id=${profileId}&date=${today}`).then(r => r.json()),
      fetch(`${API}/diet?profile_id=${profileId}&date=${today}`).then(r => r.json()),
      fetch(`${API}/workout?profile_id=${profileId}&from=${last7()[0]}&to=${today}`).then(r => r.json()),
      fetch(`${API}/hydration?profile_id=${profileId}&date=${today}`).then(r => r.json()),
      fetch(`${API}/sleep/avg?profile_id=${profileId}&days=7`).then(r => r.json()),
      fetch(`${API}/sleep?profile_id=${profileId}&limit=7`).then(r => r.json()),
      fetch(`${API}/measures?profile_id=${profileId}&limit=1`).then(r => r.json()),
      fetch(`${API}/supplements?profile_id=${profileId}`).then(r => r.json()),
      fetch(`${API}/supplements/log?profile_id=${profileId}&date=${today}`).then(r => r.json()),
    ]).then(([dietSum, dietEntries, workouts, hydration, sleepAvg, sleepLog, measures, supps, suppLog]) => {
      setData({ dietSum, dietEntries, workouts, hydration, sleepAvg, sleepLog, measures, supps, suppLog });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId, today]);

  if (loading) return (
    <div className="hd-loading">
      <div className="hd-loading-dot" style={{ background: color }} />
      <span>CARREGANDO DADOS...</span>
    </div>
  );

  if (!data) return <p className="hd-empty" style={{ textAlign: "center", padding: 40 }}>Erro ao carregar dados</p>;

  const { dietSum, dietEntries, workouts, hydration, sleepAvg, sleepLog, measures, supps, suppLog } = data;

  // ── Diet ──────────────────────────────────────────────────────────────
  const dietData   = dietSum?.data || {};
  const dietCals   = dietData.calories || 0;
  const dietGoal   = 2000;
  const dietPct    = Math.min(Math.round((dietCals / dietGoal) * 100), 100);
  const macros     = [
    { label: "Proteína", value: dietData.protein_g || 0, unit: "g", color: "#10b981", goal: 150 },
    { label: "Carbo",    value: dietData.carbs_g   || 0, unit: "g", color: "#3b82f6", goal: 250 },
    { label: "Gordura",  value: dietData.fat_g     || 0, unit: "g", color: "#f59e0b", goal: 70  },
  ];

  // ── Workout ────────────────────────────────────────────────────────────
  const wkList    = workouts?.data || [];
  const wkThisWeek = wkList.filter(w => last7().includes(w.date));
  const wkDays    = wkThisWeek.map(w => new Date(w.date).getDay());
  const wkCalsBurned = wkThisWeek.reduce((a, w) => a + (w.calories || 0), 0);
  const wkMinutes = wkThisWeek.reduce((a, w) => a + (w.duration_min || 0), 0);

  // ── Hydration ──────────────────────────────────────────────────────────
  const hydData  = hydration?.data || {};
  const hydTotal = hydData.total_ml || 0;
  const hydGoal  = hydData.goal_ml  || 2500;
  const hydPct   = Math.min(Math.round((hydTotal / hydGoal) * 100), 100);

  // ── Sleep ──────────────────────────────────────────────────────────────
  const sleepData  = sleepAvg?.data || {};
  const sleepList  = sleepLog?.data  || [];
  const avgDurMin  = sleepData.avg_duration_min || 0;
  const avgQuality = sleepData.avg_quality      || 0;
  const sleepBarData = sleepList.slice(0, 7).reverse().map(s => ({
    label: DAYS[new Date(s.date).getDay()],
    value: s.duration_min || 0,
  }));

  // ── Measures ───────────────────────────────────────────────────────────
  const lastMeasure = (measures?.data || [])[0] || null;

  // ── Supplements ────────────────────────────────────────────────────────
  const suppList  = supps?.data    || [];
  const suppTaken = suppLog?.data  || [];
  const activeSups = suppList.filter(s => s.active !== false);
  const takenIds   = suppTaken.map(l => l.supplement_id);
  const suppDone   = activeSups.filter(s => takenIds.includes(s.id)).length;
  const suppTotal  = activeSups.length;
  const suppPct    = suppTotal > 0 ? Math.round((suppDone / suppTotal) * 100) : 0;

  return (
    <div className="hd-root">

      {/* ── Top KPI strip ─────────────────────────────────────────────── */}
      <div className="hd-kpi-strip">
        {[
          { icon: "🥗", label: "Calorias Hoje",  value: `${dietCals} kcal`,     color: "#10b981" },
          { icon: "⚡", label: "Treinos na Semana", value: `${wkThisWeek.length} sessões`, color: "#3b82f6" },
          { icon: "💧", label: "Hidratação Hoje", value: `${hydTotal} ml`,       color: "#06b6d4" },
          { icon: "🌙", label: "Sono Médio",      value: fmtH(avgDurMin),        color: "#6366f1" },
          { icon: "💊", label: "Suplementos",     value: `${suppDone}/${suppTotal}`, color: "#f59e0b" },
        ].map((k, i) => (
          <div key={i} className="hd-kpi glass-premium" style={{ "--c": k.color }}>
            <span className="hd-kpi-icon">{k.icon}</span>
            <div className="hd-kpi-info">
              <span className="hd-kpi-value" style={{ color: k.color }}>{k.value}</span>
              <span className="hd-kpi-label">{k.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid principal ────────────────────────────────────────────── */}
      <div className="hd-grid">

        {/* DIETA */}
        <SectionCard icon="🥗" label="DIETA — HOJE" color="#10b981" empty={dietCals === 0}>
          <div className="hd-ring-row">
            <div className="hd-ring-wrap">
              <Ring pct={dietPct} color="#10b981" size={80} />
              <div className="hd-ring-center">
                <span className="hd-ring-pct" style={{ color: "#10b981" }}>{dietPct}%</span>
              </div>
            </div>
            <div className="hd-ring-info">
              <span className="hd-ring-main">{dietCals} <small>kcal</small></span>
              <span className="hd-ring-sub">meta {dietGoal} kcal</span>
              <span className="hd-ring-meals">{dietData.entries || 0} refeições</span>
            </div>
          </div>
          <div className="hd-macros">
            {macros.map((m, i) => {
              const pct = Math.min((m.value / m.goal) * 100, 100);
              return (
                <div key={i} className="hd-macro-row">
                  <span className="hd-macro-label">{m.label}</span>
                  <div className="hd-macro-bar-track">
                    <div className="hd-macro-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                  <span className="hd-macro-val" style={{ color: m.color }}>{m.value}{m.unit}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* TREINO */}
        <SectionCard icon="⚡" label="TREINO — 7 DIAS" color="#3b82f6" empty={wkThisWeek.length === 0}>
          <div className="hd-workout-stats">
            <StatPill label="Sessões" value={wkThisWeek.length} color="#3b82f6" />
            <StatPill label="Minutos" value={wkMinutes} color="#60a5fa" />
            <StatPill label="Calorias" value={wkCalsBurned || "—"} color="#93c5fd" />
          </div>
          <div className="hd-week-days">
            {DAYS.map((d, i) => (
              <div key={i} className={`hd-week-day ${wkDays.includes(i) ? "active" : ""}`}
                style={wkDays.includes(i) ? { background: "#3b82f6", borderColor: "#3b82f6" } : {}}>
                <span>{d.charAt(0)}</span>
              </div>
            ))}
          </div>
          {wkThisWeek.length > 0 && (
            <div className="hd-workout-list">
              {wkThisWeek.slice(0, 3).map((w, i) => (
                <div key={i} className="hd-workout-item">
                  <span className="hd-workout-name">{w.name}</span>
                  <span className="hd-workout-meta">{w.duration_min}min · {w.type}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* HIDRATAÇÃO */}
        <SectionCard icon="💧" label="HIDRATAÇÃO — HOJE" color="#06b6d4" empty={false}>
          <div className="hd-ring-row">
            <div className="hd-ring-wrap">
              <Ring pct={hydPct} color="#06b6d4" size={80} />
              <div className="hd-ring-center">
                <span className="hd-ring-pct" style={{ color: "#06b6d4" }}>{hydPct}%</span>
              </div>
            </div>
            <div className="hd-ring-info">
              <span className="hd-ring-main">{hydTotal} <small>ml</small></span>
              <span className="hd-ring-sub">meta {hydGoal} ml</span>
              <span className="hd-ring-meals">{Math.max(0, hydGoal - hydTotal)} ml restantes</span>
            </div>
          </div>
          <div className="hd-hyd-track">
            <div className="hd-hyd-fill" style={{ width: `${hydPct}%` }} />
          </div>
          <div className="hd-hyd-markers">
            {[25,50,75,100].map(m => (
              <span key={m} className="hd-hyd-marker" style={{ color: hydPct >= m ? "#06b6d4" : "rgba(255,255,255,0.15)" }}>{m}%</span>
            ))}
          </div>
        </SectionCard>

        {/* SONO */}
        <SectionCard icon="🌙" label="SONO — 7 DIAS" color="#6366f1" empty={sleepList.length === 0}>
          <div className="hd-sleep-stats">
            <StatPill label="Média" value={fmtH(avgDurMin)} color="#6366f1" />
            <StatPill label="Qualidade" value={avgQuality ? `${avgQuality.toFixed(1)}/5` : "—"} color="#818cf8" />
            <StatPill label={avgDurMin >= 420 ? "ADEQUADO" : "INSUF."} value={avgDurMin >= 420 ? "✓" : "⚠"} color={avgDurMin >= 420 ? "#10b981" : "#f59e0b"} />
          </div>
          {sleepBarData.length > 0 && <MiniBar data={sleepBarData} color="#6366f1" />}
        </SectionCard>

        {/* MEDIDAS */}
        <SectionCard icon="📐" label="MEDIDAS — ÚLTIMA" color="#8b5cf6" empty={!lastMeasure}>
          {lastMeasure && (
            <>
              <div className="hd-measures-grid">
                {[
                  { label: "Peso",      value: fmt2(lastMeasure.weight_kg, " kg") },
                  { label: "Altura",    value: fmt2(lastMeasure.height_cm, " cm") },
                  { label: "% Gordura", value: fmt2(lastMeasure.body_fat_pct, "%") },
                  { label: "Cintura",   value: fmt2(lastMeasure.waist_cm, " cm")  },
                  { label: "Braço",     value: fmt2(lastMeasure.arm_cm, " cm")    },
                  { label: "IMC",       value: lastMeasure.weight_kg && lastMeasure.height_cm
                      ? (lastMeasure.weight_kg / ((lastMeasure.height_cm/100)**2)).toFixed(1)
                      : "—" },
                ].map((m, i) => (
                  <div key={i} className="hd-measure-cell">
                    <span className="hd-measure-val" style={{ color: "#8b5cf6" }}>{m.value}</span>
                    <span className="hd-measure-label">{m.label}</span>
                  </div>
                ))}
              </div>
              <span className="hd-measure-date">
                Registrado em {new Date(lastMeasure.date + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            </>
          )}
        </SectionCard>

        {/* SUPLEMENTOS */}
        <SectionCard icon="💊" label="SUPLEMENTOS — HOJE" color="#f59e0b" empty={suppTotal === 0}>
          <div className="hd-ring-row">
            <div className="hd-ring-wrap">
              <Ring pct={suppPct} color="#f59e0b" size={80} />
              <div className="hd-ring-center">
                <span className="hd-ring-pct" style={{ color: "#f59e0b" }}>{suppPct}%</span>
              </div>
            </div>
            <div className="hd-ring-info">
              <span className="hd-ring-main">{suppDone}<small>/{suppTotal}</small></span>
              <span className="hd-ring-sub">tomados hoje</span>
            </div>
          </div>
          <div className="hd-supp-list">
            {activeSups.slice(0, 5).map((s, i) => {
              const taken = takenIds.includes(s.id);
              return (
                <div key={i} className={`hd-supp-item ${taken ? "taken" : ""}`}>
                  <span className="hd-supp-dot" style={{ background: taken ? "#f59e0b" : "rgba(255,255,255,0.10)" }} />
                  <span className="hd-supp-name">{s.name}</span>
                  <span className="hd-supp-dose">{s.dose}</span>
                  {taken && <span className="hd-supp-check">✓</span>}
                </div>
              );
            })}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────
function last7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split("T")[0];
  });
}