import { useMemo, useState } from "react";
import ModalContainer from "../ModalContainer/ModalContainer";
import "./ModulesEditorModal.css";

const DEFAULT_COLORS = [
  "#7c3aed", "#3b82f6", "#f97316", "#22c55e",
  "#ef4444", "#eab308", "#06b6d4", "#a855f7",
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

  // FIX: cada item recebe um _key interno estável para o map/update —
  // sem isso, editar o campo ID fazia o item "sumir" da lista porque
  // usávamos m.id (que muda) como identificador de busca no updateItem.
  const [list, setList] = useState(() =>
    initial.map((m, i) => ({ ...m, _key: m.id || `mod_${i}` }))
  );

  const canSave = useMemo(() => {
    if (!list.length) return false;
    for (const m of list) {
      if (!String(m.id    || "").trim()) return false;
      if (!String(m.name  || "").trim()) return false;
      if (!String(m.color || "").trim()) return false;
    }
    const ids = list.map(m => m.id);
    return new Set(ids).size === ids.length; // ids únicos
  }, [list]);

  // FIX: busca por _key (estável) em vez de id (mutável pelo usuário)
  const updateItem = (_key, patch) => {
    setList(prev => prev.map(m => m._key === _key ? { ...m, ...patch } : m));
  };

  const addModule = () => {
    const base = "NOVO_MODULO";
    const existing = new Set(list.map(m => m.id));
    let idx = 1;
    while (existing.has(`${base}_${idx}`)) idx++;
    const newId = `${base}_${idx}`;
    const _key  = `_new_${Date.now()}`;
    setList(prev => [...prev, { id: newId, name: `NOVO MÓDULO ${idx}`, color: "#7c3aed", _key }]);
  };

  const removeModule = (_key) => {
    setList(prev => prev.filter(m => m._key !== _key));
  };

  const handleSave = () => {
    if (!canSave) return;
    // Remove _key antes de salvar — não deve vazar para o estado da app
    onSave(list.map(({ _key, ...rest }) => rest));
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
        disabled={!canSave}
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
            // FIX: key estável via _key, não via m.id
            <div key={m._key} className="nx-mod-row glass">

              <div className="nx-mod-col">
                <div className="nx-mod-label tech-font">ID</div>
                <input
                  className="nx-mod-input tech-font"
                  value={m.id}
                  onChange={(e) => updateItem(m._key, { id: normalizeId(e.target.value) })}
                  placeholder="TRABALHO"
                />
              </div>

              <div className="nx-mod-col">
                <div className="nx-mod-label tech-font">NOME</div>
                <input
                  className="nx-mod-input tech-font"
                  value={m.name}
                  onChange={(e) => updateItem(m._key, { name: e.target.value.toUpperCase() })}
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
                      className={`nx-color${m.color === c ? " is-active" : ""}`}
                      onClick={() => updateItem(m._key, { color: c })}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    className="nx-mod-colorinput"
                    type="color"
                    value={m.color}
                    onChange={(e) => updateItem(m._key, { color: e.target.value })}
                    title="Escolher cor"
                  />
                </div>
              </div>

              <button
                type="button"
                className="nx-mod-del"
                onClick={() => removeModule(m._key)}
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