import { useState, useEffect, useCallback, useRef } from "react";
import { API } from "../healthApi";

const FIELDS = [
  { key: "weight_kg",    label: "PESO",     unit: "kg",  step: "0.1" },
  { key: "height_cm",   label: "ALTURA",   unit: "cm",  step: "0.5" },
  { key: "body_fat_pct",label: "G. CORPO", unit: "%",   step: "0.1" },
  { key: "chest_cm",    label: "PEITORAL", unit: "cm",  step: "0.5" },
  { key: "waist_cm",    label: "CINTURA",  unit: "cm",  step: "0.5" },
  { key: "hip_cm",      label: "QUADRIL",  unit: "cm",  step: "0.5" },
  { key: "arm_cm",      label: "BRAÇO",    unit: "cm",  step: "0.5" },
  { key: "thigh_cm",    label: "COXA",     unit: "cm",  step: "0.5" },
  { key: "calf_cm",     label: "PANTURRILHA", unit: "cm", step: "0.5" },
];

const today = () => new Date().toISOString().split("T")[0];

export default function MeasuresModule({ profileId, color }) {
  const [records, setRecords]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [photo, setPhoto]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm]         = useState({ date: today(), notes: "" });
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);

  const C = { "--mod-color": color };

  const load = useCallback(async () => {
    const r = await fetch(`${API}/measures?profile_id=${profileId}&limit=20`).then(r => r.json());
    if (r.ok) setRecords(r.data);
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("profile_id", profileId);
    FIELDS.forEach(f => { if (form[f.key]) fd.append(f.key, form[f.key]); });
    fd.append("date", form.date);
    fd.append("notes", form.notes || "");
    if (photo) fd.append("photo", photo);

    await fetch(`${API}/measures`, { method: "POST", body: fd });
    setForm({ date: today(), notes: "" });
    setPhoto(null); setPhotoPreview(null);
    setShowForm(false);
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    await fetch(`${API}/measures/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  };

  // BMI
  const bmi = (r) => {
    if (!r.weight_kg || !r.height_cm) return null;
    return (r.weight_kg / ((r.height_cm / 100) ** 2)).toFixed(1);
  };
  const bmiLabel = (v) => {
    if (!v) return null;
    if (v < 18.5) return { label: "ABAIXO", color: "#06b6d4" };
    if (v < 25)   return { label: "NORMAL", color: "#10b981" };
    if (v < 30)   return { label: "ACIMA",  color: "#f59e0b" };
    return           { label: "OBESO",  color: "#ef4444" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, ...C }}>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <button className="hs-btn hs-btn-primary" style={C} onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ FECHAR" : "+ NOVA MEDIÇÃO"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="hs-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="hs-section-title">REGISTRAR MEDIDAS</p>
          <div className="hs-field" style={{ width: 180 }}>
            <label className="hs-label">DATA</label>
            <input type="date" className="hs-input" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {FIELDS.map(f => (
              <div key={f.key} className="hs-field">
                <label className="hs-label">{f.label} ({f.unit})</label>
                <input className="hs-input" type="number" step={f.step} min="0"
                  placeholder="—" value={form[f.key] || ""}
                  onChange={e => setForm(ff => ({ ...ff, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>

          {/* Foto */}
          <div className="hs-field">
            <label className="hs-label">FOTO (opcional)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: `1px solid ${color}40` }} />
                : <div onClick={() => fileRef.current?.click()}
                    style={{ width: 80, height: 80, borderRadius: 10, border: "1px dashed rgba(255,255,255,.15)",
                      display: "grid", placeItems: "center", cursor: "pointer", fontSize: 22 }}>📷</div>
              }
              <button className="hs-btn hs-btn-ghost" onClick={() => fileRef.current?.click()}>
                {photoPreview ? "TROCAR FOTO" : "SELECIONAR FOTO"}
              </button>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handlePhoto} />
            </div>
          </div>

          <div className="hs-field">
            <label className="hs-label">NOTAS</label>
            <input className="hs-input" placeholder="Observações..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="hs-btn hs-btn-primary" style={C} onClick={submit} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR MEDIÇÃO"}
            </button>
            <button className="hs-btn hs-btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Grid de registros */}
      {records.length === 0 && !showForm && (
        <div className="hs-empty">NENHUMA MEDIÇÃO REGISTRADA</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {records.map(r => {
          const b = bmi(r);
          const bl = bmiLabel(b);
          return (
            <div key={r.id} className="hs-panel"
              style={{ cursor: "pointer", border: selected?.id === r.id ? `1px solid ${color}60` : undefined }}
              onClick={() => setSelected(selected?.id === r.id ? null : r)}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, fontFamily: "'Share Tech Mono', monospace", color: "rgba(255,255,255,.40)", letterSpacing: ".16em" }}>
                  {r.date}
                </div>
                <button className="hs-del-btn" onClick={e => { e.stopPropagation(); del(r.id); }}>✕</button>
              </div>

              {r.photo_url && (
                <img src={`http://localhost:3001${r.photo_url}`} alt="body"
                  style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginTop: 10, marginBottom: 10 }} />
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                {r.weight_kg && (
                  <div className="hs-stat" style={C}>
                    <span className="hs-stat-val">{r.weight_kg}<span style={{ fontSize: 11 }}>kg</span></span>
                    <span className="hs-stat-label">PESO</span>
                  </div>
                )}
                {b && (
                  <div className="hs-stat" style={{ "--mod-color": bl?.color }}>
                    <span className="hs-stat-val">{b}</span>
                    <span className="hs-stat-label">IMC · {bl?.label}</span>
                  </div>
                )}
                {r.body_fat_pct && (
                  <div className="hs-stat" style={{ "--mod-color": "#f59e0b" }}>
                    <span className="hs-stat-val">{r.body_fat_pct}<span style={{ fontSize: 11 }}>%</span></span>
                    <span className="hs-stat-label">G. CORPO</span>
                  </div>
                )}
              </div>

              {selected?.id === r.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {FIELDS.filter(f => r[f.key]).map(f => (
                      <div key={f.key} style={{ fontSize: 10, fontFamily: "'Share Tech Mono', monospace" }}>
                        <div style={{ color: "rgba(255,255,255,.35)", fontSize: 7, letterSpacing: ".16em" }}>{f.label}</div>
                        <div style={{ color: "rgba(255,255,255,.80)" }}>{r[f.key]}{f.unit}</div>
                      </div>
                    ))}
                  </div>
                  {r.notes && <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,.28)", fontFamily: "'Share Tech Mono', monospace" }}>{r.notes}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}