import "./TaskCard.css";

const PRIORITY_LABEL = {
  normal:    { label: "NORMAL",     color: "#64748b" },
  important: { label: "IMPORTANTE", color: "#fbbf24" },
  priority:  { label: "PRIORIDADE", color: "#f97316" },
  urgent:    { label: "URGENTE",    color: "#ef4444" },
};

export default function TaskCard({ task, onOpen, onMove, onDelete, TaskStatus }) {
  const p = PRIORITY_LABEL[task.priority] || PRIORITY_LABEL.normal;
  const border = task.borderColor || "#7c3aed";

  const canMoveBack    = task.status !== TaskStatus.TODO;
  const canMoveForward = task.status !== TaskStatus.DONE;

  const prevStatus = task.status === TaskStatus.DONE
    ? TaskStatus.IN_PROGRESS
    : TaskStatus.TODO;

  const nextStatus = task.status === TaskStatus.TODO
    ? TaskStatus.IN_PROGRESS
    : TaskStatus.DONE;

  return (
    <div
      className="tc-root"
      style={{ "--border-color": border }}
      onClick={() => onOpen(task)}
    >
      {/* Left accent */}
      <div className="tc-accent" />

      {/* Content */}
      <div className="tc-body">
        <div className="tc-top">
          {task.icon && <span className="tc-icon">{task.icon}</span>}
          <div className="tc-title">{task.title}</div>
          <span className="tc-xp tech-font">+{task.xp} XP</span>
        </div>

        {task.description && (
          <div className="tc-desc">{task.description}</div>
        )}

        <div className="tc-footer">
          <span
            className="tc-priority tech-font"
            style={{ color: p.color, borderColor: p.color + "44", background: p.color + "16" }}
          >
            {p.label}
          </span>

          {task.time && (
            <span className="tc-time data-font">{task.time}</span>
          )}

          <div className="tc-actions" onClick={e => e.stopPropagation()}>
            {canMoveBack && (
              <button
                type="button"
                className="tc-btn"
                title="Voltar"
                onClick={() => onMove(task.id, prevStatus)}
              >◀</button>
            )}
            {canMoveForward && (
              <button
                type="button"
                className="tc-btn tc-btn--fwd"
                title="Avançar"
                onClick={() => onMove(task.id, nextStatus)}
              >▶</button>
            )}
            <button
              type="button"
              className="tc-btn tc-btn--del"
              title="Deletar"
              onClick={() => onDelete(task.id)}
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}