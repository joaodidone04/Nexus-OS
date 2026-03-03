import { useMemo, useState } from "react";
import { ICONS, BORDER_COLORS } from "../../styles/Constants";
import ModalContainer from "../ModalContainer/ModalContainer";
import "./NewTaskModal.css";

const PRIORITIES = [
  { id: "normal",    label: "NORMAL",     color: "#64748b" },
  { id: "important", label: "IMPORTANTE", color: "#fbbf24" },
  { id: "priority",  label: "PRIORIDADE", color: "#f97316" },
  { id: "urgent",    label: "URGENTE",    color: "#ef4444" },
];

const RECURRENCE_TYPES = [
  { id: "none",    label: "ÚNICA"   },
  { id: "weekly",  label: "SEMANAL" },
  { id: "monthly", label: "MENSAL"  },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS  = ["00","05","10","15","20","25","30","35","40","45","50","55"];

export default function NewTaskModal({ currentModule, onClose, onSave, selectedDate }) {
  const [title,          setTitle]          = useState("");
  const [description,    setDescription]    = useState("");
  const [objectives,     setObjectives]     = useState([]);
  const [objInput,       setObjInput]       = useState("");
  const [selectedIcon,   setSelectedIcon]   = useState("📅");
  const [selectedBorder, setSelectedBorder] = useState("default");
  const [priority,       setPriority]       = useState("normal");
  const [timeH,          setTimeH]          = useState("");
  const [timeM,          setTimeM]          = useState("");
  const [recurrenceType, setRecurrenceType] = useState("none");

  const timeValue = timeH && timeM ? `${timeH}:${timeM}` : undefined;

  const borderColor = useMemo(() => {
    if (selectedBorder === "default") return currentModule.color;
    return BORDER_COLORS.find(b => b.id === selectedBorder)?.color || currentModule.color;
  }, [selectedBorder, currentModule.color]);

  const addObjective = () => {
    const text = objInput.trim();
    if (!text) return;
    const id = crypto?.randomUUID?.() || String(Date.now());
    setObjectives(prev => [...prev, { id, text }]);
    setObjInput("");
  };

  const removeObjective = (id) =>
    setObjectives(prev => prev.filter(o => o.id !== id));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title:       title.trim(),
      description: description.trim(),
      objectives,
      icon:        selectedIcon,
      borderColor,
      date:        selectedDate,
      time:        timeValue,
      priority,
      recurrence:  { type: recurrenceType },
    });
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
        disabled={!title.trim()}
        style={{ backgroundColor: currentModule.color }}
      >
        CONFIRMAR MISSÃO
      </button>
    </>
  );

  return (
    <ModalContainer title={`CRIAR MISSÃO: ${currentModule.name}`} onClose={onClose} footer={footer}>
      <div className="nx-form">

        {/* Título */}
        <div className="nx-field">
          <label className="nx-label tech-font">OBJETIVO PRINCIPAL</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && title.trim()) handleSave(); }}
            placeholder="EX: SINCRONIZAR NÚCLEO DE DADOS"
            className="nx-input tech-font"
            autoFocus
          />
        </div>

        {/* Descrição */}
        <div className="nx-field">
          <label className="nx-label tech-font">DADOS ADICIONAIS</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="DETALHAMENTO DA OPERAÇÃO..."
            className="nx-textarea data-font"
          />
        </div>

        {/* Prioridade + Horário + Recorrência */}
        <div className="nx-grid-3">

          <div className="nx-field">
            <label className="nx-label tech-font">PRIORIDADE</label>
            <div className="nx-priority-grid">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className="nx-chip tech-font"
                  style={{
                    borderColor:     priority === p.id ? p.color : "rgba(255,255,255,0.06)",
                    backgroundColor: priority === p.id ? p.color + "33" : "transparent",
                    color:           priority === p.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="nx-field">
            <label className="nx-label tech-font">HORÁRIO</label>
            <div className="nx-time-row">
              <select className="nx-select tech-font" value={timeH} onChange={e => setTimeH(e.target.value)}>
                <option value="">--</option>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="nx-time-sep">:</span>
              <select className="nx-select tech-font" value={timeM} onChange={e => setTimeM(e.target.value)}>
                <option value="">--</option>
                {MINS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="nx-field">
            <label className="nx-label tech-font">RECORRÊNCIA</label>
            <div className="nx-recur-row">
              {RECURRENCE_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRecurrenceType(t.id)}
                  className="nx-recur-chip tech-font"
                  style={{
                    borderColor:     recurrenceType === t.id ? currentModule.color : "rgba(255,255,255,0.06)",
                    backgroundColor: recurrenceType === t.id ? currentModule.color + "28" : "transparent",
                    color:           recurrenceType === t.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.40)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {recurrenceType !== "none" && (
              <div className="nx-recur-hint data-font">
                {recurrenceType === "weekly"
                  ? "Gera 8 semanas a partir da data selecionada"
                  : "Gera 6 meses a partir da data selecionada"}
              </div>
            )}
          </div>

        </div>

        {/* Objetivos */}
        <div className="nx-field">
          <label className="nx-label tech-font">OBJETIVOS</label>
          <div className="nx-obj-row">
            <input
              value={objInput}
              onChange={e => setObjInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addObjective(); }}
              placeholder="EX: CRIAR 3 COLUNAS"
              className="nx-input tech-font"
            />
            <button type="button" className="nx-obj-add tech-font" onClick={addObjective}>
              ADICIONAR
            </button>
          </div>

          {objectives.length > 0 && (
            <div className="nx-obj-list">
              {objectives.map(o => (
                <div key={o.id} className="nx-obj-item">
                  <span className="data-font">{o.text}</span>
                  <button type="button" className="nx-obj-del" onClick={() => removeObjective(o.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cor / Ícone */}
        <div className="nx-grid-2">
          <div className="nx-field">
            <label className="nx-label tech-font">COR / BORDA</label>
            <div className="nx-border-grid">
              <button
                type="button"
                className="nx-border-chip tech-font"
                onClick={() => setSelectedBorder("default")}
                style={{
                  borderColor:     selectedBorder === "default" ? currentModule.color : "rgba(255,255,255,0.06)",
                  backgroundColor: selectedBorder === "default" ? currentModule.color + "22" : "transparent",
                }}
              >
                <span className="nx-swatch" style={{ backgroundColor: currentModule.color }} />
                PADRÃO
              </button>
              {BORDER_COLORS.filter(b => b.id !== "default").map(b => (
                <button
                  key={b.id}
                  type="button"
                  className="nx-border-chip tech-font"
                  onClick={() => setSelectedBorder(b.id)}
                  style={{
                    borderColor:     selectedBorder === b.id ? b.color : "rgba(255,255,255,0.06)",
                    backgroundColor: selectedBorder === b.id ? b.color + "22" : "transparent",
                  }}
                >
                  <span className="nx-swatch" style={{ backgroundColor: b.color }} />
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="nx-field">
            <label className="nx-label tech-font">ÍCONE DA MISSÃO</label>
            <div className="nx-icons">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className="nx-icon-btn"
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    borderColor:     selectedIcon === icon ? currentModule.color : "transparent",
                    backgroundColor: selectedIcon === icon ? currentModule.color + "22" : "transparent",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </ModalContainer>
  );
}