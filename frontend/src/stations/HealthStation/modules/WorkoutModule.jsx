import { useState, useEffect, useCallback } from "react";
import { API } from "../healthApi";

const TYPES = ["musculacao","cardio","funcional","yoga","outro"];
const TYPE_LABELS = { musculacao:"💪 MUSCULAÇÃO", cardio:"🏃 CARDIO", funcional:"⚡ FUNCIONAL", yoga:"🧘 YOGA", outro:"🎯 OUTRO" };
const today = () => new Date().toISOString().split("T")[0];

export default function WorkoutModule({ profileId, color }) {
  const [date, setDate]           = useState(today());
  const [sessions, setSessions]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [form, setForm]           = useState({ type: "musculacao", name: "", duration_min: "", intensity: 3, calories: "", notes: "" });
  const [exercises, setExercises] = useState([]);
  const [exForm, setExForm]       = useState({ name: "", sets: "", reps: "", weight_kg: "", rest_sec: "" });
  const [loading, setLoading]     = useState(false);

  const C = { "--mod-color": color };

  const load = useCallback(async () => {
    const r = await fetch(`${API}/workout?profile_id=${profileId}&date=${date}`).then(r => r.json());
    if (r.ok) setSessions(r.data);
  }, [profileId, date]);

  useEffect(() => { load(); }, [load]);

  const addEx = () => {
    if (!exForm.name.trim()) return;
    setExercises(ex => [...ex, { ...exForm, id: Date.now() }]);
    setExForm({ name: "", sets: "", reps: "", weight_kg: "", rest_sec: "" });
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    await fetch(`${API}/workout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, date, ...form, exercises }),
    });
    setForm({ type: "musculacao", name: "", duration_min: "", intensity: 3, calories: "", notes: "" });
    setExercises([]);
    setShowForm(false);
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/workout/${id}`, { method: "DELETE" });
    load();
  };

  const intensityColor = (v) => ["","#10b981","#84cc16","#f59e0b","#f97316","#ef4444"][v] || "#fff";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, ...C }}>

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input type="date" className="hs-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 160 }} />
        <button className="hs-btn hs-btn-primary" style={C} onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ FECHAR" : "+ SESSÃO"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="hs-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="hs-section-title">NOVA SESSÃO</p>
          <div className="hs-row">
            <div className="hs-field hs-col">
              <label className="hs-label">TIPO</label>
              <select className="hs-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="hs-field" style={{ flex: 2 }}>
              <label className="hs-label">NOME DO TREINO</label>
              <input className="hs-input" placeholder="Ex: Peito e Tríceps"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div className="hs-row">
            <div className="hs-field hs-col">
              <label className="hs-label">DURAÇÃO (min)</label>
              <input className="hs-input" type="number" min="0" placeholder="60"
                value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">KCAL</label>
              <input className="hs-input" type="number" min="0" placeholder="0"
                value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">INTENSIDADE</label>
              <div className="hs-stars">
                {[1,2,3,4,5].map(v => (
                  <button key={v} className="hs-star" onClick={() => setForm(f => ({ ...f, intensity: v }))}
                    style={{ color: v <= form.intensity ? intensityColor(form.intensity) : "rgba(255,255,255,0.15)" }}>
                    ●
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercícios */}
          <p className="hs-section-title">EXERCÍCIOS</p>
          {exercises.map((ex, i) => (
            <div key={ex.id} className="hs-list-item" style={{ padding: "8px 12px" }}>
              <span style={{ flex: 1, fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}>
                {ex.name} {ex.sets && `· ${ex.sets} séries`} {ex.reps && `· ${ex.reps} reps`} {ex.weight_kg && `· ${ex.weight_kg}kg`}
              </span>
              <button className="hs-del-btn" onClick={() => setExercises(exs => exs.filter((_,j) => j !== i))}>✕</button>
            </div>
          ))}
          <div className="hs-row" style={{ alignItems: "flex-end" }}>
            <div className="hs-field" style={{ flex: 3 }}>
              <label className="hs-label">EXERCÍCIO</label>
              <input className="hs-input" placeholder="Ex: Supino reto"
                value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">SÉRIES</label>
              <input className="hs-input" type="number" placeholder="4"
                value={exForm.sets} onChange={e => setExForm(f => ({ ...f, sets: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">REPS</label>
              <input className="hs-input" placeholder="12,10,8"
                value={exForm.reps} onChange={e => setExForm(f => ({ ...f, reps: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">KG</label>
              <input className="hs-input" type="number" step="0.5" placeholder="0"
                value={exForm.weight_kg} onChange={e => setExForm(f => ({ ...f, weight_kg: e.target.value }))} />
            </div>
            <button className="hs-btn hs-btn-ghost" style={{ flexShrink: 0 }} onClick={addEx}>+ ADD</button>
          </div>

          <div className="hs-field">
            <label className="hs-label">NOTAS</label>
            <input className="hs-input" placeholder="Observações..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="hs-btn hs-btn-primary" style={C} onClick={submit} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR SESSÃO"}
            </button>
            <button className="hs-btn hs-btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Lista de sessões */}
      {sessions.length === 0 && !showForm && (
        <div className="hs-empty">NENHUMA SESSÃO REGISTRADA PARA ESTE DIA</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sessions.map(s => (
          <div key={s.id} className="hs-panel" style={{ cursor: "pointer" }}
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{TYPE_LABELS[s.type]?.split(" ")[0]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".1em" }}>{s.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {s.duration_min && <span className="hs-chip" style={{ color, borderColor: `${color}40` }}>{s.duration_min} min</span>}
                  {s.calories     && <span className="hs-chip" style={{ color: "#f59e0b", borderColor: "#f59e0b40" }}>{s.calories} kcal</span>}
                  {s.intensity    && <span className="hs-chip" style={{ color: intensityColor(s.intensity), borderColor: `${intensityColor(s.intensity)}40` }}>
                    INT {s.intensity}/5
                  </span>}
                  <span className="hs-chip" style={{ color: "rgba(255,255,255,.30)", borderColor: "rgba(255,255,255,.15)" }}>
                    {s.exercises?.length || 0} exercícios
                  </span>
                </div>
              </div>
              <button className="hs-del-btn" onClick={e => { e.stopPropagation(); del(s.id); }}>✕</button>
            </div>

            {expanded === s.id && s.exercises?.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <p className="hs-section-title">EXERCÍCIOS</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {s.exercises.map(ex => (
                    <div key={ex.id} style={{ padding: "8px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".1em" }}>{ex.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.40)", fontFamily: "'Share Tech Mono', monospace", marginTop: 3 }}>
                        {[ex.sets && `${ex.sets}×`, ex.reps, ex.weight_kg && `${ex.weight_kg}kg`].filter(Boolean).join(" ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}