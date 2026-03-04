import { useState, useEffect, useCallback } from "react";
import { API } from "../HealthStation";

const today = () => new Date().toISOString().split("T")[0];
const fmtDuration = (min) => {
  if (!min) return "—";
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h${m > 0 ? `${String(m).padStart(2,"0")}m` : ""}`;
};
const QUALITY_LABELS = ["", "PÉSSIMO", "RUIM", "OK", "BOM", "ÓTIMO"];
const QUALITY_COLORS = ["", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];

export default function SleepModule({ profileId, color }) {
  const [logs, setLogs]     = useState([]);
  const [avg, setAvg]       = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]     = useState({ date: today(), bed_time: "22:00", wake_time: "06:30", quality: 4, deep_sleep_pct: "", notes: "" });

  const C = { "--mod-color": color };

  const load = useCallback(async () => {
    const [lr, ar] = await Promise.all([
      fetch(`${API}/sleep?profile_id=${profileId}&limit=14`).then(r => r.json()),
      fetch(`${API}/sleep/avg?profile_id=${profileId}&days=7`).then(r => r.json()),
    ]);
    if (lr.ok) setLogs(lr.data);
    if (ar.ok) setAvg(ar.data);
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setLoading(true);
    await fetch(`${API}/sleep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId, ...form }),
    });
    setShowForm(false);
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/sleep/${id}`, { method: "DELETE" });
    load();
  };

  // Mini bar chart — últimos 7 dias
  const chartData = [...logs].slice(0, 7).reverse();
  const maxMin = Math.max(...chartData.map(l => l.duration_min || 0), 480);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, ...C }}>

      {/* Médias 7 dias */}
      {avg && (
        <div className="hs-row">
          <div className="hs-stat hs-col" style={C}>
            <span className="hs-stat-val">{fmtDuration(Math.round(avg.avg_duration_min))}</span>
            <span className="hs-stat-label">MÉDIA 7 DIAS</span>
          </div>
          <div className="hs-stat hs-col" style={{ "--mod-color": QUALITY_COLORS[Math.round(avg.avg_quality)] || color }}>
            <span className="hs-stat-val">{avg.avg_quality?.toFixed(1) ?? "—"}<span style={{ fontSize: 11 }}>/5</span></span>
            <span className="hs-stat-label">QUALIDADE MÉDIA</span>
          </div>
          <div className="hs-stat hs-col" style={{ "--mod-color": avg.avg_duration_min >= 420 ? "#10b981" : "#ef4444" }}>
            <span className="hs-stat-val" style={{ fontSize: 14 }}>
              {avg.avg_duration_min >= 420 ? "✓ ADEQUADO" : "⚠ BAIXO"}
            </span>
            <span className="hs-stat-label">STATUS GERAL</span>
          </div>
        </div>
      )}

      {/* Gráfico de barras mini */}
      {chartData.length > 0 && (
        <div className="hs-panel">
          <p className="hs-section-title">ÚLTIMAS {chartData.length} NOITES</p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
            {chartData.map((l, i) => {
              const h = ((l.duration_min || 0) / maxMin) * 72;
              const qc = QUALITY_COLORS[l.quality] || color;
              return (
                <div key={l.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {fmtDuration(l.duration_min)}
                  </div>
                  <div style={{ width: "100%", height: h, borderRadius: "4px 4px 0 0",
                    background: `linear-gradient(to top, ${qc}, color-mix(in srgb, ${qc} 50%, transparent))`,
                    boxShadow: `0 0 8px ${qc}60`, minHeight: 4, transition: "height .4s" }} />
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,.25)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {l.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button className="hs-btn hs-btn-primary" style={{ ...C, alignSelf: "flex-start" }} onClick={() => setShowForm(s => !s)}>
        {showForm ? "✕ FECHAR" : "+ REGISTRAR SONO"}
      </button>

      {/* Formulário */}
      {showForm && (
        <div className="hs-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="hs-section-title">NOVA ENTRADA DE SONO</p>
          <div className="hs-row">
            <div className="hs-field hs-col">
              <label className="hs-label">DATA (acordou)</label>
              <input type="date" className="hs-input" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">DEITOU</label>
              <input type="time" className="hs-input" value={form.bed_time}
                onChange={e => setForm(f => ({ ...f, bed_time: e.target.value }))} />
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">ACORDOU</label>
              <input type="time" className="hs-input" value={form.wake_time}
                onChange={e => setForm(f => ({ ...f, wake_time: e.target.value }))} />
            </div>
          </div>

          {/* Preview duração */}
          {form.bed_time && form.wake_time && (() => {
            const [bh,bm] = form.bed_time.split(":").map(Number);
            const [wh,wm] = form.wake_time.split(":").map(Number);
            let mins = (wh*60+wm) - (bh*60+bm);
            if (mins < 0) mins += 1440;
            return (
              <div style={{ fontSize: 11, fontFamily: "'Share Tech Mono', monospace", color, letterSpacing: ".14em" }}>
                ⏱ {fmtDuration(mins)} de sono
              </div>
            );
          })()}

          <div className="hs-row">
            <div className="hs-field">
              <label className="hs-label">QUALIDADE</label>
              <div className="hs-stars">
                {[1,2,3,4,5].map(v => (
                  <button key={v} className="hs-star"
                    onClick={() => setForm(f => ({ ...f, quality: v }))}
                    style={{ color: v <= form.quality ? QUALITY_COLORS[form.quality] : "rgba(255,255,255,.15)", fontSize: 18 }}>
                    ★
                  </button>
                ))}
              </div>
              {form.quality > 0 && (
                <span style={{ fontSize: 8, color: QUALITY_COLORS[form.quality], fontFamily: "'Share Tech Mono', monospace", letterSpacing: ".16em", marginTop: 4 }}>
                  {QUALITY_LABELS[form.quality]}
                </span>
              )}
            </div>
            <div className="hs-field hs-col">
              <label className="hs-label">SONO PROFUNDO (%)</label>
              <input className="hs-input" type="number" min="0" max="100" placeholder="—"
                value={form.deep_sleep_pct}
                onChange={e => setForm(f => ({ ...f, deep_sleep_pct: e.target.value }))} />
            </div>
          </div>

          <div className="hs-field">
            <label className="hs-label">NOTAS</label>
            <input className="hs-input" placeholder="Acordou durante a noite? Sonhos? Estresse?"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="hs-btn hs-btn-primary" style={C} onClick={submit} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR"}
            </button>
            <button className="hs-btn hs-btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Lista */}
      {logs.length === 0 && !showForm && (
        <div className="hs-empty">NENHUM REGISTRO DE SONO</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logs.map(l => (
          <div key={l.id} className="hs-list-item">
            <span style={{ fontSize: 20 }}>🌙</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".1em" }}>
                  {fmtDuration(l.duration_min)}
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", fontFamily: "'Share Tech Mono', monospace" }}>
                  {l.bed_time} → {l.wake_time}
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,.25)", fontFamily: "'Share Tech Mono', monospace" }}>{l.date}</span>
              </div>
              {l.quality && (
                <div style={{ marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
                  {"★".repeat(l.quality).split("").map((_, i) => (
                    <span key={i} style={{ color: QUALITY_COLORS[l.quality], fontSize: 11 }}>★</span>
                  ))}
                  <span style={{ fontSize: 8, color: QUALITY_COLORS[l.quality], fontFamily: "'Share Tech Mono', monospace", letterSpacing: ".14em" }}>
                    {QUALITY_LABELS[l.quality]}
                  </span>
                </div>
              )}
            </div>
            <button className="hs-del-btn" onClick={() => del(l.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}