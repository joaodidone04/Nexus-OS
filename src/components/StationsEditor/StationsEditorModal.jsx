import React, { useMemo, useState } from "react";

function encodeStation(station) {
  const json = JSON.stringify(station);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeStation(code) {
  const json = decodeURIComponent(escape(atob(code.trim())));
  return JSON.parse(json);
}

const DEFAULTS = [
  { id: "missions", name: "MISSÕES", color: "#3b82f6", sharedWith: [] },
  { id: "finance", name: "FINANCEIRO", color: "#10b981", sharedWith: [] },
  { id: "health", name: "SAÚDE", color: "#ef4444", sharedWith: [] },
];

export default function StationsEditorModal({ profile, onSave, onClose }) {
  const initialStations = useMemo(() => {
    const arr = Array.isArray(profile?.stations) ? profile.stations : [];
    if (arr.length === 0) return DEFAULTS;

    // normaliza (pra não quebrar perfis antigos)
    return arr.map((s) => ({
      id: s.id,
      name: s.name || s.id,
      color: s.color || "#3b82f6",
      sharedWith: Array.isArray(s.sharedWith) ? s.sharedWith : [],
    }));
  }, [profile]);

  const [stations, setStations] = useState(initialStations);
  const [importCode, setImportCode] = useState("");
  const [msg, setMsg] = useState("");

  const setField = (id, patch) => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const handleShare = async (station) => {
    try {
      const code = encodeStation(station);
      await navigator.clipboard.writeText(code);
      setMsg(`Código copiado: ${station.id}`);
      setTimeout(() => setMsg(""), 1800);
    } catch {
      setMsg("Falha ao copiar (clipboard bloqueado).");
      setTimeout(() => setMsg(""), 1800);
    }
  };

  const handleImport = () => {
    try {
      const imported = decodeStation(importCode);
      if (!imported?.id) throw new Error("invalid");

      const normalized = {
        id: String(imported.id),
        name: String(imported.name || imported.id),
        color: String(imported.color || "#3b82f6"),
        sharedWith: Array.isArray(imported.sharedWith) ? imported.sharedWith : [],
      };

      setStations((prev) => {
        const exists = prev.some((s) => s.id === normalized.id);
        if (exists) return prev.map((s) => (s.id === normalized.id ? normalized : s));
        return [...prev, normalized];
      });

      setImportCode("");
      setMsg(`Estação importada: ${normalized.id}`);
      setTimeout(() => setMsg(""), 1800);
    } catch {
      setMsg("Código inválido.");
      setTimeout(() => setMsg(""), 1800);
    }
  };

  const handleSave = () => {
    onSave({ stations });
  };

  return (
    <div className="sem-overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="sem-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sem-header">
          <div className="sem-title">EDITAR ESTAÇÕES</div>
          <button className="sem-close" type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="sem-body">
          {stations.map((s) => (
            <div className="sem-row" key={s.id}>
              <div className="sem-id">{s.id}</div>

              <input
                className="sem-input"
                value={s.name}
                onChange={(e) => setField(s.id, { name: e.target.value })}
                placeholder="NOME"
              />

              <input
                className="sem-color"
                type="color"
                value={s.color}
                onChange={(e) => setField(s.id, { color: e.target.value })}
                title="Cor da estação"
              />

              <div className="sem-actions">
                <button className="sem-btn" type="button" onClick={() => handleShare(s)}>
                  COMPARTILHAR
                </button>
                <button
                  className="sem-btn danger"
                  type="button"
                  onClick={() =>
                    setStations((prev) => prev.filter((x) => x.id !== s.id))
                  }
                >
                  REMOVER
                </button>
              </div>
            </div>
          ))}

          <div className="sem-import">
            <div className="sem-help">
              <b>Compartilhar:</b> clique em COMPARTILHAR para copiar o código da estação. <br />
              <b>Importar:</b> cole o código aqui para adicionar/atualizar uma estação neste operador.
            </div>

            <textarea
              className="sem-input"
              style={{ minHeight: 90, resize: "vertical" }}
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Cole aqui o código de compartilhamento..."
            />

            <div className="sem-actions">
              {msg ? <div className="sem-help">{msg}</div> : <span />}
              <button className="sem-btn" type="button" onClick={handleImport}>
                IMPORTAR
              </button>
              <button className="sem-btn primary" type="button" onClick={handleSave}>
                SALVAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}