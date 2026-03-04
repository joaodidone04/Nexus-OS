import { useState, useEffect, useCallback } from "react";
import { API } from "../HealthStation";

const QUICK = [150, 200, 250, 300, 500];
const TYPES = ["agua","isotônico","suco","cafe"];
const TYPE_ICONS = { agua: "💧", "isotônico": "⚡", suco: "🥤", cafe: "☕" };
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

export default function HydrationModule({ profileId, color }) {
  const [date, setDate]     = useState(today());
  const [data, setData]     = useState({ entries: [], total_ml: 0, goal_ml: 2500 });
  const [form, setForm]     = useState({ amount_ml: 250, type: "agua", time: nowTime() });
  const [editGoal, setEditGoal] = useState(false);
  const [newGoal, setNewGoal]   = useState(2500);
  const [loading, setLoading]   = useState(false);

  const C = { "--mod-color": color };

  const load = useCallback(async () => {
    const r = await fetch(`${API}/hydration?profile_id=${profileId}&date=${date}`).then(r => r.json());
    if (r.ok) { setData(r.data); setNewGoal(r.data.goal_ml); }
  }, [profileId, date]);

  useEffect(() => { load(); }, [load]);

  const add = async (amount_ml, type = form.type) => {
    setLoading(true);
    await fetch(`${API}/hydration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, date, time: nowTime(), amount_ml, type }),
    });
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/hydration/${id}`, { method: "DELETE" });
    load();
  };

  const saveGoal = async () => {
    await fetch(`${API}/hydration/goal`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, goal_ml: Number(newGoal) }),
    });
    setEditGoal(false);
    load();
  };

  const pct = Math.min(100, Math.round((data.total_ml / data.goal_ml) * 100));
  const glasses = Math.round(data.total_ml / 250);

  // Ring SVG
  const R = 70; const circ = 2 * Math.PI * R;
  const fill = circ * (1 - pct / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, ...C }}>

      {/* Date */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input type="date" className="hs-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 160 }} />
      </div>

      {/* Ring + stats */}
      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        {/* Ring */}
        <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={80} cy={80} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
            <circle cx={80} cy={80} r={R} fill="none" stroke={color} strokeWidth={12}
              strokeDasharray={circ} strokeDashoffset={fill}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset .8s cubic-bezier(.25,.8,.25,1)" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", color }}>{pct}%</span>
            <span style={{ fontSize: 9, letterSpacing: ".18em", color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>HIDRATADO</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          <div className="hs-row">
            <div className="hs-stat hs-col" style={C}>
              <span className="hs-stat-val">{data.total_ml}<span style={{ fontSize: 11 }}>ml</span></span>
              <span className="hs-stat-label">INGERIDO</span>
            </div>
            <div className="hs-stat hs-col" style={{ "--mod-color": "rgba(255,255,255,.40)" }}>
              <span className="hs-stat-val">{data.goal_ml - data.total_ml > 0 ? data.goal_ml - data.total_ml : 0}<span style={{ fontSize: 11 }}>ml</span></span>
              <span className="hs-stat-label">RESTANTE</span>
            </div>
            <div className="hs-stat hs-col" style={{ "--mod-color": "#10b981" }}>
              <span className="hs-stat-val">{glasses}</span>
              <span className="hs-stat-label">COPOS</span>
            </div>
          </div>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {editGoal ? (
              <>
                <input className="hs-input" type="number" value={newGoal} min={500} step={100}
                  onChange={e => setNewGoal(e.target.value)} style={{ width: 100 }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>ml/dia</span>
                <button className="hs-btn hs-btn-primary" style={{ ...C, padding: "6px 14px" }} onClick={saveGoal}>SALVAR</button>
                <button className="hs-btn hs-btn-ghost" style={{ padding: "6px 14px" }} onClick={() => setEditGoal(false)}>✕</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace", color: "rgba(255,255,255,.35)", letterSpacing: ".14em" }}>META: {data.goal_ml}ml/dia</span>
                <button className="hs-btn hs-btn-ghost" style={{ padding: "4px 10px", fontSize: 8 }} onClick={() => setEditGoal(true)}>EDITAR</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="hs-progress-wrap">
          <div className="hs-progress-fill" style={{ ...C, width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,.25)", fontFamily: "'Share Tech Mono', monospace" }}>0ml</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,.25)", fontFamily: "'Share Tech Mono', monospace" }}>{data.goal_ml}ml</span>
        </div>
      </div>

      {/* Registro rápido */}
      <div className="hs-panel">
        <p className="hs-section-title">REGISTRAR</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {TYPES.map(t => (
            <button key={t} className={`hs-toggle-btn${form.type === t ? " active" : ""}`} style={C}
              onClick={() => setForm(f => ({ ...f, type: t }))}>
              {TYPE_ICONS[t]} {t.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Quick add */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {QUICK.map(ml => (
            <button key={ml} className="hs-btn hs-btn-ghost"
              style={{ padding: "7px 16px", fontSize: 10 }}
              onClick={() => add(ml)}
              disabled={loading}>
              +{ml}ml
            </button>
          ))}
        </div>
        {/* Custom */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div className="hs-field" style={{ width: 120 }}>
            <label className="hs-label">QUANTIDADE (ml)</label>
            <input className="hs-input" type="number" min={50} step={50} value={form.amount_ml}
              onChange={e => setForm(f => ({ ...f, amount_ml: Number(e.target.value) }))} />
          </div>
          <button className="hs-btn hs-btn-primary" style={C} onClick={() => add(form.amount_ml)} disabled={loading}>
            {loading ? "..." : "REGISTRAR"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      {data.entries.length > 0 && (
        <div>
          <p className="hs-section-title">HISTÓRICO DO DIA</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...data.entries].reverse().map(e => (
              <div key={e.id} className="hs-list-item">
                <span style={{ fontSize: 18 }}>{TYPE_ICONS[e.type] || "💧"}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".08em" }}>
                    {e.amount_ml}ml
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace", marginLeft: 8 }}>
                    {e.type} · {e.time}
                  </span>
                </div>
                <button className="hs-del-btn" onClick={() => del(e.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}