import React, { useState } from "react";

const PRIORITY_LABELS = {
  normal: { label: "Normal", color: "#64748b" },
  important: { label: "Importante", color: "#fbbf24" },
  priority: { label: "Prioridade", color: "#f97316" },
  urgent: { label: "Urgente", color: "#ef4444", pulse: true },
};

export default function TaskCard({ task, onMove, onDelete, TaskStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prio = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.normal;

  return (
    <div
      className="taskcard glass"
      style={{ borderLeftColor: task.borderColor }}
    >
      <div
        className="taskcard-glow"
        style={{ backgroundColor: task.borderColor }}
      />

      <div className="taskcard-main">
        <div
          className="taskcard-icon"
          style={{
            boxShadow: `inset 0 0 15px ${task.borderColor}22, 0 0 10px ${task.borderColor}11`,
          }}
        >
          <div className="taskcard-ring">
            <svg className="taskcard-ring-svg" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke={task.borderColor}
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={task.borderColor}
                strokeWidth="0.5"
                strokeDasharray="10 15"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke={task.borderColor}
                strokeWidth="2"
                strokeDasharray="1 20"
              />
            </svg>
          </div>

          <div className="taskcard-scan" />

          <span className="taskcard-ghost">{task.icon}</span>
          <span className="taskcard-icon-text">{task.icon}</span>

          <div
            className="taskcard-pulse"
            style={{
              background: `radial-gradient(circle, ${task.borderColor}44 0%, transparent 80%)`,
            }}
          />
        </div>

        <div className="taskcard-body">
          <div className="taskcard-top">
            <div className="taskcard-head">
              <h4 className="taskcard-title tech-font">{task.title}</h4>

              <div className="taskcard-tags">
                <span
                  className={`taskcard-prio tech-font ${
                    prio.pulse ? "is-pulse" : ""
                  }`}
                  style={{
                    color: prio.color,
                    borderColor: prio.color + "44",
                    backgroundColor: prio.color + "11",
                  }}
                >
                  {prio.label}
                </span>

                {task.time ? (
                  <span className="taskcard-time data-font">{task.time}</span>
                ) : null}
              </div>
            </div>

            <span className="taskcard-xp data-font">+{task.xp} XP</span>
          </div>

          <div
            className="taskcard-descwrap"
            onClick={() => setIsExpanded((v) => !v)}
          >
            <p className={`taskcard-desc ${isExpanded ? "is-open" : ""}`}>
              {task.description}
            </p>

            {!isExpanded && task.description?.length > 60 ? (
              <div className="taskcard-expand tech-font">[Expandir log]</div>
            ) : null}
          </div>

          {Array.isArray(task.objectives) && task.objectives.length > 0 ? (
            <div className={`taskcard-objs ${isExpanded ? "is-open" : ""}`}>
              {task.objectives.map((obj) => (
                <span key={obj.id} className="taskcard-obj">
                  {obj.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="taskcard-actions">
        {task.status !== TaskStatus.TODO ? (
          <button
            className="taskcard-actionlink tech-font"
            onClick={() => onMove(task.id, TaskStatus.TODO)}
          >
            Reativar
          </button>
        ) : null}

        {task.status === TaskStatus.TODO ? (
          <button
            className="taskcard-actionbtn tech-font"
            onClick={() => onMove(task.id, TaskStatus.IN_PROGRESS)}
            style={{
              backgroundColor: task.borderColor + "15",
              border: `1px solid ${task.borderColor}44`,
              color: task.borderColor,
            }}
          >
            <span className="taskcard-actionbtn-text">
              Iniciar sequência
            </span>
            <div
              className="taskcard-actionbtn-fill"
              style={{ backgroundColor: task.borderColor + "22" }}
            />
          </button>
        ) : null}

        {task.status === TaskStatus.IN_PROGRESS ? (
          <button
            className="taskcard-done tech-font"
            onClick={() => onMove(task.id, TaskStatus.DONE)}
          >
            Finalizar
          </button>
        ) : null}

        <button
          className="taskcard-trash"
          title="Eliminar Registro"
          onClick={() => onDelete(task.id)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}