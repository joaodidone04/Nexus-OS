import React, { useMemo, useState } from "react";
import { ICONS, BORDER_COLORS } from "../../styles/Constants";
import ModalContainer from "../ModalContainer/ModalContainer";
import "./NewTaskModal.css";

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

function TimePicker({ value, onChange, accent = "#3b82f6" }) {
  const [open, setOpen] = useState(null);
  const [h = "", m = ""] = (value || "").split(":");

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const mins = [
    "00","05","10","15","20","25",
    "30","35","40","45","50","55"
  ];

  const setTime = (hh, mm) => {
    if (!hh || !mm) return onChange("");
    onChange(`${hh}:${mm}`);
  };

  const pickH = (hh) => {
    setTime(hh, m);
    setOpen("m");
  };

  const pickM = (mm) => {
    setTime(h, mm);
    setOpen(null);
  };

  return (
    <div className="nx-field">
      <label className="nx-label tech-font">HORÁRIO OPERACIONAL</label>

      <div className="nx-timepicker">
        <div
          className={`nx-combo ${open === "h" ? "is-open" : ""}`}
          style={{ "--accent": accent }}
        >
          <button
            type="button"
            className="nx-combo-btn tech-font"
            onClick={() => setOpen(open === "h" ? null : "h")}
          >
            <span>{h || "--"}</span>
            <span className="nx-combo-caret">▾</span>
          </button>

          {open === "h" && (
            <div className="nx-combo-pop">
              {hours.map((x) => (
                <button
                  key={x}
                  type="button"
                  className={`nx-combo-opt ${x === h ? "is-active" : ""}`}
                  onClick={() => pickH(x)}
                >
                  {x}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="nx-tsep tech-font">:</span>

        <div
          className={`nx-combo ${open === "m" ? "is-open" : ""}`}
          style={{ "--accent": accent }}
        >
          <button
            type="button"
            className="nx-combo-btn tech-font"
            disabled={!h}
            onClick={() => setOpen(open === "m" ? null : "m")}
          >
            <span>{m || "--"}</span>
            <span className="nx-combo-caret">▾</span>
          </button>

          {open === "m" && (
            <div className="nx-combo-pop">
              {mins.map((x) => (
                <button
                  key={x}
                  type="button"
                  className={`nx-combo-opt ${x === m ? "is-active" : ""}`}
                  onClick={() => pickM(x)}
                >
                  {x}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewTaskModal({
  currentModule,
  onClose,
  onSave,
  selectedDate,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState([]);
  const [objInput, setObjInput] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📅");
  const [selectedBorder, setSelectedBorder] = useState("default");
  const [priority, setPriority] = useState("normal");
  const [time, setTime] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceDays, setRecurrenceDays] = useState([]);

  const borderColor = useMemo(() => {
    if (selectedBorder === "default") return currentModule.color;
    return (
      BORDER_COLORS.find((b) => b.id === selectedBorder)?.color ||
      currentModule.color
    );
  }, [selectedBorder, currentModule.color]);

  const toggleRecurrenceDay = (day) => {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const addObjective = () => {
    const text = objInput.trim();
    if (!text) return;

    setObjectives((prev) => [
      ...prev,
      {
        id:
          (typeof crypto !== "undefined" &&
            crypto.randomUUID?.()) ||
          String(Date.now()),
        text,
      },
    ]);
    setObjInput("");
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const recurrence = { type: recurrenceType };
    if (recurrenceType === "weekly")
      recurrence.daysOfWeek = recurrenceDays;

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
      <button
        onClick={onClose}
        className="nx-modal-link tech-font"
        type="button"
      >
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
          <label className="nx-label tech-font">
            OBJETIVO PRINCIPAL
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="EX: SINCRONIZAR NÚCLEO DE DADOS"
            className="nx-input tech-font"
            autoFocus
          />
        </div>

        <div className="nx-field">
          <label className="nx-label tech-font">
            DADOS ADICIONAIS
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="DETALHAMENTO DA OPERAÇÃO..."
            className="nx-textarea data-font"
          />
        </div>

        <div className="nx-grid-2">
          <div className="nx-field">
            <label className="nx-label tech-font">
              PRIORIDADE
            </label>

            <div className="nx-priority-grid">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`nx-chip tech-font ${
                    priority === p.id ? "is-active" : ""
                  }`}
                  style={{
                    borderColor:
                      priority === p.id
                        ? p.color
                        : "rgba(255,255,255,0.06)",
                    backgroundColor:
                      priority === p.id
                        ? p.color + "33"
                        : "transparent",
                    color:
                      priority === p.id
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(255,255,255,0.45)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <TimePicker
            value={time}
            onChange={setTime}
            accent={currentModule.color}
          />
        </div>
      </div>
    </ModalContainer>
  );
}