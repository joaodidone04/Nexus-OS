import { useState, useEffect, useCallback } from "react";
import { API } from "../healthApi";

const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

export default function SupplementsModule({ profileId, color }) {
  const [supps, setSupps]     = useState([]);
  const [log, setLog]         = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState("today"); // today | manage
  const [form, setForm] = useState({
    name: "", dose: "", times: ["08:00"], with_food: false, notes: ""
  });

  const C = { "--mod-color": color };
  const todayStr = today();

  const load = useCallback(async () => {
    const [sr, lr] = await Promise.all([
      fetch(`${API}/supplements?profile_id=${profileId}`).then(r => r.json()),
      fetch(`${API}/supplements/log?profile_id=${profileId}&date=${todayStr}`).then(r => r.json()),
    ]);
    if (sr.ok) setSupps(sr.data);
    if (lr.ok) setLog(lr.data);
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  const addTime = () => setForm(f => ({ ...f, times: [...f.times, "12:00"] }));
  const updateTime = (i, v) => setForm(f => ({ ...f, times: f.times.map((t, j) => j === i ? v : t) }));
  const removeTime = (i) => setForm(f => ({ ...f, times: f.times.filter((_, j) => j !== i) }));

  const save = async () => {
    if (!form.name.trim() || !form.dose.trim()) return;
    setLoading(true);
    await fetch(`${API}/supplements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, ...form }),
    });
    setForm({ name: "", dose: "", times: ["08:00"], with_food: false, notes: "" });
    setShowForm(false);
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/supplements/${id}`, { method: "DELETE" });
    load();
  };

  const markTaken = async (suppId) => {
    await fetch(`${API}/supplements/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplement_id: suppId, profile_id: profileId, date: todayStr, time: nowTime() }),
    });
    load();
  };

  const isTaken = (suppId) => log.some(l => l.supplement_id === suppId);

  // contar doses de hoje
  const totalToday = supps.reduce((s, sup) => s + (sup.times?.length || 0), 0);
  const takenToday = supps.filter(s => isTaken(s.id)).length;
  const pct = totalToday > 0 ? Math.round((takenToday / supps.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, ...C }}>

      {/* Tabs */}
      <div className="hs-toggle-wrap">
        {[
          { id: "today", label: "HOJE" },
          { id: "manage", label: "GERENCIAR" },
        ].map(t => (
          <button key={t.id} className={`hs-toggle-btn${tab === t.id ? " active" : ""}`} style={C}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: HOJE ─────────────────────────────────────── */}
      {tab === "today" && (
        <>
          {/* Progresso */}
          <div className="hs-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace", letterSpacing: ".18em", color: "rgba(255,255,255,.50)" }}>
                PROGRESSO DO DIA
              </span>
              <span style={{ fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color }}>
                {takenToday}/{supps.filter(s => s.active).length} TOMADOS
              </span>
            </div>
            <div className="hs-progress-wrap">
              <div className="hs-progress-fill" style={{ ...C, width: `${pct}%` }} />
            </div>
          </div>

          {supps.filter(s => s.active).length === 0 && (
            <div className="hs-empty">NENHUM SUPLEMENTO CADASTRADO<br/>VÁ EM "GERENCIAR" PARA ADICIONAR</div>
          )}

          {/* Lista para marcar tomada */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {supps.filter(s => s.active).map(s => {
              const taken = isTaken(s.id);
              return (
                <div key={s.id} className="hs-list-item"
                  style={{ borderColor: taken ? `${color}50` : undefined, background: taken ? `color-mix(in srgb, ${color} 6%, transparent)` : undefined }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".1em" }}>{s.name}</span>
                      <span className="hs-chip" style={{ color, borderColor: `${color}40` }}>{s.dose}</span>
                      {s.with_food && <span className="hs-chip" style={{ color: "#10b981", borderColor: "#10b98140" }}>🍽 COM COMIDA</span>}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 8, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {s.times?.join(" · ")}
                    </div>
                  </div>
                  <button
                    className="hs-btn"
                    style={{
                      padding: "6px 16px",
                      background: taken ? `color-mix(in srgb, ${color} 20%, transparent)` : "transparent",
                      borderColor: taken ? color : "rgba(255,255,255,.15)",
                      color: taken ? color : "rgba(255,255,255,.40)",
                      fontSize: 8,
                    }}
                    onClick={() => !taken && markTaken(s.id)}
                    disabled={taken}
                  >
                    {taken ? "✓ TOMADO" : "MARCAR"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── TAB: GERENCIAR ─────────────────────────────────── */}
      {tab === "manage" && (
        <>
          <button className="hs-btn hs-btn-primary" style={{ ...C, alignSelf: "flex-start" }} onClick={() => setShowForm(s => !s)}>
            {showForm ? "✕ FECHAR" : "+ NOVO SUPLEMENTO"}
          </button>

          {showForm && (
            <div className="hs-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p className="hs-section-title">CADASTRAR SUPLEMENTO</p>
              <div className="hs-row">
                <div className="hs-field" style={{ flex: 2 }}>
                  <label className="hs-label">NOME</label>
                  <input className="hs-input" placeholder="Ex: Creatina, Whey, Ômega-3..."
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="hs-field hs-col">
                  <label className="hs-label">DOSE</label>
                  <input className="hs-input" placeholder="Ex: 5g, 2 caps"
                    value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} />
                </div>
              </div>

              <div className="hs-field">
                <label className="hs-label">HORÁRIOS</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {form.times.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <input type="time" className="hs-input" value={t} style={{ width: 130 }}
                        onChange={e => updateTime(i, e.target.value)} />
                      {form.times.length > 1 && (
                        <button className="hs-del-btn" style={{ marginLeft: 0 }} onClick={() => removeTime(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="hs-btn hs-btn-ghost" style={{ alignSelf: "flex-start", padding: "6px 14px" }} onClick={addTime}>
                    + HORÁRIO
                  </button>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.with_food} onChange={e => setForm(f => ({ ...f, with_food: e.target.checked }))} />
                <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace", letterSpacing: ".14em", color: "rgba(255,255,255,.55)" }}>
                  TOMAR COM COMIDA
                </span>
              </label>

              <div className="hs-field">
                <label className="hs-label">NOTAS</label>
                <input className="hs-input" placeholder="Instruções adicionais..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="hs-btn hs-btn-primary" style={C} onClick={save} disabled={loading}>
                  {loading ? "SALVANDO..." : "SALVAR"}
                </button>
                <button className="hs-btn hs-btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
              </div>
            </div>
          )}

          {supps.length === 0 && !showForm && (
            <div className="hs-empty">NENHUM SUPLEMENTO CADASTRADO</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {supps.map(s => (
              <div key={s.id} className="hs-list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".1em" }}>{s.name}</span>
                    <span className="hs-chip" style={{ color, borderColor: `${color}40` }}>{s.dose}</span>
                    {s.with_food && <span className="hs-chip" style={{ color: "#10b981", borderColor: "#10b98140" }}>🍽 COM COMIDA</span>}
                    {!s.active && <span className="hs-chip" style={{ color: "rgba(255,255,255,.30)", borderColor: "rgba(255,255,255,.15)" }}>INATIVO</span>}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 8, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {Array.isArray(s.times) ? s.times.join(" · ") : s.times}
                  </div>
                  {s.notes && <div style={{ marginTop: 3, fontSize: 9, color: "rgba(255,255,255,.28)", fontFamily: "'Share Tech Mono', monospace" }}>{s.notes}</div>}
                </div>
                <button className="hs-del-btn" onClick={() => del(s.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}