import React, { useMemo, useState } from "react";
import ModalContainer from "./ModalContainer";

const DEFAULT_COLORS = [
  "#7c3aed",
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#a855f7",
];

function normalizeId(str) {
  return String(str || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

export default function ModulesEditorModal({ modules, onClose, onSave }) {
  const initial = Array.isArray(modules) ? modules : [];
  const [list, setList] = useState(() => initial.map((m) => ({ ...m })));

  const canSave = useMemo(() => {
    if (!Array.isArray(list) || list.length === 0) return false;
    // precisa ter id+name
    for (const m of list) {
      if (!String(m.id || "").trim()) return false;
      if (!String(m.name || "").trim()) return false;
      if (!String(m.color || "").trim()) return false;
    }
    // ids únicos
    const ids = list.map((m) => m.id);
    return new Set(ids).size === ids.length;
  }, [list]);

  const updateItem = (id, patch) => {
    setList((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addModule = () => {
    const base = "NOVO_MODULO";
    let idx = 1;
    let newId = `${base}_${idx}`;
    const existing = new Set(list.map((m) => m.id));

    while (existing.has(newId)) {
      idx += 1;
      newId = `${base}_${idx}`;
    }

    setList((prev) => [
      ...prev,
      {
        id: newId,
        name: `NOVO MÓDULO ${idx}`,
        color: "#7c3aed",
      },
    ]);
  };

  const removeModule = (id) => {
    setList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave(list);
  };

  const footer = (
    <>
      <button onClick={onClose} className="nx-modal-link tech-font" type="button">
        CANCELAR
      </button>

      <button
        onClick={handleSave}
        className="nx-modal-confirm tech-font"
        type="button"
        style={{ opacity: canSave ? 1 : 0.5, pointerEvents: canSave ? "auto" : "none" }}
      >
        SALVAR MÓDULOS
      </button>
    </>
  );

  return (
    <ModalContainer title="EDITAR MÓDULOS" onClose={onClose} footer={footer}>
      <div className="nx-modules-editor">
        <div className="nx-modules-top">
          <button type="button" className="nx-mod-add tech-font" onClick={addModule}>
            + ADICIONAR MÓDULO
          </button>
        </div>

        <div className="nx-modules-list">
          {list.map((m) => (
            <div key={m.id} className="nx-mod-row glass">
              <div className="nx-mod-col">
                <div className="nx-mod-label tech-font">ID</div>
                <input
                  className="nx-mod-input tech-font"
                  value={m.id}
                  onChange={(e) => {
                    const next = normalizeId(e.target.value);
                    updateItem(m.id, { id: next });
                  }}
                  placeholder="TRABALHO"
                />
              </div>

              <div className="nx-mod-col">
                <div className="nx-mod-label tech-font">NOME</div>
                <input
                  className="nx-mod-input tech-font"
                  value={m.name}
                  onChange={(e) => updateItem(m.id, { name: e.target.value.toUpperCase() })}
                  placeholder="TRABALHO"
                />
              </div>

              <div className="nx-mod-col">
                <div className="nx-mod-label tech-font">COR</div>

                <div className="nx-mod-colors">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`nx-color ${m.color === c ? "is-active" : ""}`}
                      onClick={() => updateItem(m.id, { color: c })}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}

                  <input
                    className="nx-mod-colorinput"
                    type="color"
                    value={m.color}
                    onChange={(e) => updateItem(m.id, { color: e.target.value })}
                    title="Escolher cor"
                  />
                </div>
              </div>

              <button
                type="button"
                className="nx-mod-del"
                onClick={() => removeModule(m.id)}
                title="Remover módulo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModalContainer>
  );
}