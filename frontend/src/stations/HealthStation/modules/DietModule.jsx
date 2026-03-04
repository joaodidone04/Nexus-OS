import { useState, useEffect, useCallback } from "react";
import { API } from "../healthApi";

const MEALS = ["cafe", "almoco", "jantar", "lanche", "outro"];
const MEAL_LABELS = { cafe: "☕ CAFÉ", almoco: "🍽 ALMOÇO", jantar: "🌙 JANTAR", lanche: "🥜 LANCHE", outro: "📦 OUTRO" };

const today = () => new Date().toISOString().split("T")[0];

export default function DietModule({ profileId, color }) {
  const [date, setDate]       = useState(today());
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm]       = useState({ meal: "cafe", food: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const C = { "--mod-color": color };

  const load = useCallback(async () => {
    const [e, s] = await Promise.all([
      fetch(`${API}/diet?profile_id=${profileId}&date=${date}`).then(r => r.json()),
      fetch(`${API}/diet/summary?profile_id=${profileId}&date=${date}`).then(r => r.json()),
    ]);
    if (e.ok) setEntries(e.data);
    if (s.ok) setSummary(s.data);
  }, [profileId, date]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.food.trim()) return;
    setLoading(true);
    await fetch(`${API}/diet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, date, ...form }),
    });
    setForm({ meal: "cafe", food: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", notes: "" });
    setShowForm(false);
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/diet/${id}`, { method: "DELETE" });
    load();
  };

  const grouped = MEALS.reduce((acc, m) => {
    acc[m] = entries.filter(e => e.meal === m);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, ...C }}>

      {/* Barra de data + stats */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input type="date" className="hs-input" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: 160 }} />
        <button className="hs-btn hs-btn-primary" style={C} onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ FECHAR" : "+ REFEIÇÃO"}
        </button>
      </div>

      {/* Macros do dia */}
      {summary && (
        <div className="hs-row">
          {[
            { val: summary.calories  ?? 0, label: "KCAL",    unit: "" },
            { val: summary.protein_g ?? 0, label: "PROTEÍNA", unit: "g" },
            { val: summary.carbs_g   ?? 0, label: "CARBS",    unit: "g" },
            { val: summary.fat_g     ?? 0, label: "GORDURA",  unit: "g" },
          ].map(s => (
            <div key={s.label} className="hs-stat hs-col" style={C}>
              <span className="hs-stat-val">{Math.round(s.val)}<span style={{ fontSize: 11 }}>{s.unit}</span></span>
              <span className="hs-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="hs-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="hs-section-title">REGISTRAR REFEIÇÃO</p>
          <div className="hs-row">
            <div className="hs-field hs-col">
              <label className="hs-label">REFEIÇÃO</label>
              <select className="hs-select" value={form.meal} onChange={e => setForm(f => ({ ...f, meal: e.target.value }))}>
                {MEALS.map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="hs-field" style={{ flex: 2 }}>
              <label className="hs-label">ALIMENTO</label>
              <input className="hs-input" placeholder="Ex: Frango grelhado 150g"
                value={form.food} onChange={e => setForm(f => ({ ...f, food: e.target.value }))} />
            </div>
          </div>
          <div className="hs-row">
            {["calories", "protein_g", "carbs_g", "fat_g"].map(field => (
              <div key={field} className="hs-field hs-col">
                <label className="hs-label">{field === "calories" ? "KCAL" : field.replace("_g","").toUpperCase() + " (g)"}</label>
                <input className="hs-input" type="number" min="0" placeholder="0"
                  value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="hs-field">
            <label className="hs-label">NOTAS</label>
            <input className="hs-input" placeholder="Opcional..." value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="hs-btn hs-btn-primary" style={C} onClick={submit} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR"}
            </button>
            <button className="hs-btn hs-btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Entradas agrupadas */}
      {MEALS.map(meal => grouped[meal].length > 0 && (
        <div key={meal}>
          <p className="hs-section-title">{MEAL_LABELS[meal]}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {grouped[meal].map(entry => (
              <div key={entry.id} className="hs-list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".08em" }}>
                    {entry.food}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                    {entry.calories  && <span className="hs-chip" style={{ color, borderColor: `${color}40` }}>{entry.calories} kcal</span>}
                    {entry.protein_g && <span className="hs-chip" style={{ color: "#f59e0b", borderColor: "#f59e0b40" }}>{entry.protein_g}g prot</span>}
                    {entry.carbs_g   && <span className="hs-chip" style={{ color: "#06b6d4", borderColor: "#06b6d440" }}>{entry.carbs_g}g carbs</span>}
                    {entry.fat_g     && <span className="hs-chip" style={{ color: "#8b5cf6", borderColor: "#8b5cf640" }}>{entry.fat_g}g gord</span>}
                  </div>
                  {entry.notes && <div style={{ fontSize: 9, color: "rgba(255,255,255,.28)", marginTop: 3, fontFamily: "'Share Tech Mono', monospace", letterSpacing: ".08em" }}>{entry.notes}</div>}
                </div>
                <button className="hs-del-btn" onClick={() => del(entry.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {entries.length === 0 && !showForm && (
        <div className="hs-empty">NENHUMA REFEIÇÃO REGISTRADA PARA ESTE DIA</div>
      )}
    </div>
  );
}