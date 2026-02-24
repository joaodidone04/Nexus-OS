import React, { useMemo, useState } from "react";
import { ICONS, BORDER_COLORS } from "../styles/Constants";
import ModalContainer from "./ModalContainer";

const PRIORITIES = [    
  { id: "normal", label: "NORMAL", color: "#64748b" },
  { id: "important", label: "IMPORTANTE", color: "#fbbf24" },
  { id: "priority", label: "PRIORIDADE", color: "#f97316" },
  { id: "urgent", label: "URGENTE", color: "#ef4444" },
];

const WEEK_DAYS = [
  { label: "D", value: 0 },
  { label: "S", value: 1 },
  { label: "T", value: 2 },
  { label: "Q", value: 3 },
  { label: "Q", value: 4 },
  { label: "S", value: 5 },
  { label: "S", value: 6 },
];

export default function NewTaskModal({ currentModule, onClose, onSave, selectedDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [objectives, setObjectives] = useState([]);
  const [objInput, setObjInput] = useState("");

  const [selectedIcon, setSelectedIcon] = useState("📅");
  const [selectedBorder, setSelectedBorder] = useState("default");
  const [priority, setPriority] = useState("normal");
  const [time, setTime] = useState("");

  const [recurrenceType, setRecurrenceType] = useState("none"); // none | weekly | monthly
  const [recurrenceDays, setRecurrenceDays] = useState([]);

  const borderColor = useMemo(() => {
    if (selectedBorder === "default") return currentModule.color;
    return (
      BORDER_COLORS.find((b) => b.id === selectedBorder)?.color || currentModule.color
    );
  }, [selectedBorder, currentModule.color]);

  const toggleRecurrenceDay = (day) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addObjective = () => {
    const text = objInput.trim();
    if (!text) return;
    setObjectives((prev) => [...prev, { id: crypto.randomUUID?.() || String(Date.now()), text }]);
    setObjInput("");
  };

  const removeObjective = (id) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const recurrence = { type: recurrenceType };
    if (recurrenceType === "weekly") recurrence.daysOfWeek = recurrenceDays;

    onSave({
      title: title.trim(),
      description: description.trim(),
      objectives,
      icon: selectedIcon,
      borderColor,
      date: selectedDate,
      time: time || undefined,
      priority,
      recurrence,
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
        style={{ backgroundColor: currentModule.color }}
      >
        CONFIRMAR MISSÃO
      </button>
    </>
  );

  return (
    <ModalContainer
      title={`CRIAR MISSÃO: ${currentModule.name}`}
      onClose={onClose}
      footer={footer}
    >
      <div className="nx-form">
        <div className="nx-field">
          <label className="nx-label tech-font">OBJETIVO PRINCIPAL</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="EX: SINCRONIZAR NÚCLEO DE DADOS"
            className="nx-input tech-font"
            autoFocus
          />
        </div>

        <div className="nx-field">
          <label className="nx-label tech-font">DADOS ADICIONAIS</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="DETALHAMENTO DA OPERAÇÃO..."
            className="nx-textarea data-font"
          />
        </div>

        <div className="nx-grid-2">
          <div className="nx-field">
            <label className="nx-label tech-font">PRIORIDADE</label>
            <div className="nx-priority-grid">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`nx-chip tech-font ${priority === p.id ? "is-active" : ""}`}
                  style={{
                    borderColor: priority === p.id ? p.color : "rgba(255,255,255,0.06)",
                    backgroundColor: priority === p.id ? p.color + "33" : "transparent",
                    color: priority === p.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="nx-field">
            <label className="nx-label tech-font">HORÁRIO OPERACIONAL</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="nx-input tech-font"
            />
          </div>
        </div>

        <div className="nx-recurrence">
          <label className="nx-label tech-font">RECORRÊNCIA SINÁPTICA</label>
          <div className="nx-recurrence-row">
            {[
              { id: "none", label: "ÚNICA" },
              { id: "weekly", label: "SEMANAL" },
              { id: "monthly", label: "MENSAL" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRecurrenceType(t.id)}
                className={`nx-recur-btn tech-font ${recurrenceType === t.id ? "is-active" : ""}`}
                style={{
                  backgroundColor: recurrenceType === t.id ? currentModule.color + "33" : undefined,
                  borderColor: recurrenceType === t.id ? currentModule.color : "rgba(255,255,255,0.06)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {recurrenceType === "weekly" && (
            <div className="nx-weekdays">
              {WEEK_DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleRecurrenceDay(d.value)}
                  className={`nx-day tech-font ${recurrenceDays.includes(d.value) ? "is-on" : ""}`}
                  style={{
                    backgroundColor: recurrenceDays.includes(d.value)
                      ? currentModule.color + "55"
                      : "rgba(255,255,255,0.03)",
                    borderColor: recurrenceDays.includes(d.value)
                      ? currentModule.color
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nx-field">
          <label className="nx-label tech-font">OBJETIVOS (SUBTAREFAS)</label>

          <div className="nx-obj-row">
            <input
              value={objInput}
              onChange={(e) => setObjInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addObjective()}
              placeholder="EX: CRIAR 3 COLUNAS"
              className="nx-input tech-font"
            />
            <button type="button" className="nx-obj-add tech-font" onClick={addObjective}>
              ADICIONAR
            </button>
          </div>

          {objectives.length > 0 && (
            <div className="nx-obj-list">
              {objectives.map((o) => (
                <div key={o.id} className="nx-obj-item">
                  <span className="data-font">{o.text}</span>
                  <button type="button" className="nx-obj-del" onClick={() => removeObjective(o.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nx-grid-2">
          <div className="nx-field">
            <label className="nx-label tech-font">COR / BORDA</label>
            <div className="nx-border-grid">
              {BORDER_COLORS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`nx-border-chip tech-font ${selectedBorder === b.id ? "is-active" : ""}`}
                  onClick={() => setSelectedBorder(b.id)}
                  style={{
                    borderColor: selectedBorder === b.id ? b.color : "rgba(255,255,255,0.06)",
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
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`nx-icon-btn ${selectedIcon === icon ? "is-active" : ""}`}
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    borderColor: selectedIcon === icon ? currentModule.color : "transparent",
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