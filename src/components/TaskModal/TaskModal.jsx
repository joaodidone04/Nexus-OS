import { useState } from "react";
import ModalContainer from "../ModalContainer/ModalContainer";
import "./TaskModal.css";

const PRIORITY_META = {
  normal:    { label: "NORMAL",     color: "#64748b" },
  important: { label: "IMPORTANTE", color: "#fbbf24" },
  priority:  { label: "PRIORIDADE", color: "#f97316" },
  urgent:    { label: "URGENTE",    color: "#ef4444" },
};

export default function TaskModal({ task, onClose, onSave, onDelete }) {
  const [title,       setTitle]       = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [subtasks,    setSubtasks]    = useState(task.subtasks || []);
  const [comments,    setComments]    = useState(task.comments || []);
  const [newComment,  setNewComment]  = useState("");
  const [newSubtask,  setNewSubtask]  = useState("");

  const p = PRIORITY_META[task.priority] || PRIORITY_META.normal;
  const completedCount = subtasks.filter(s => s.done).length;

  const toggleSubtask = (id) =>
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));

  const addSubtask = () => {
    const text = newSubtask.trim();
    if (!text) return;
    const id = crypto?.randomUUID?.() || String(Date.now());
    setSubtasks(prev => [...prev, { id, text, done: false }]);
    setNewSubtask("");
  };

  const removeSubtask = (id) =>
    setSubtasks(prev => prev.filter(s => s.id !== id));

  const addComment = () => {
    const text = newComment.trim();
    if (!text) return;
    const id = crypto?.randomUUID?.() || String(Date.now());
    const now = new Date().toLocaleString("pt-BR");
    setComments(prev => [...prev, { id, text, date: now }]);
    setNewComment("");
  };

  const removeComment = (id) =>
    setComments(prev => prev.filter(c => c.id !== id));

  const handleSave = () => {
    onSave({ ...task, title, description, subtasks, comments });
  };

  const footer = (
    <>
      <button
        type="button"
        className="nx-modal-link tech-font"
        style={{ color: "rgba(248,113,113,0.55)" }}
        onClick={() => onDelete(task.id)}
      >
        ELIMINAR
      </button>
      <button type="button" className="nx-modal-link tech-font" onClick={onClose}>
        CANCELAR
      </button>
      <button
        type="button"
        className="nx-modal-confirm tech-font"
        style={{ backgroundColor: task.borderColor || "#7c3aed" }}
        onClick={handleSave}
      >
        SALVAR
      </button>
    </>
  );

  return (
    <ModalContainer title="TASK LOG" onClose={onClose} footer={footer}>
      <div className="tm-root">

        {/* ── Identity row ── */}
        <div className="tm-identity" style={{ "--accent": task.borderColor || "#7c3aed" }}>
          {task.icon && <div className="tm-icon">{task.icon}</div>}
          <div className="tm-identity-body">
            <input
              className="tm-title-input tech-font"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="tm-badges">
              <span
                className="tm-badge tech-font"
                style={{ color: p.color, borderColor: p.color + "44", background: p.color + "18" }}
              >
                {p.label}
              </span>
              <span className="tm-badge tech-font">+{task.xp} XP</span>
              {subtasks.length > 0 && (
                <span className="tm-badge tech-font">
                  {completedCount}/{subtasks.length} ETAPAS
                </span>
              )}
              {task.date && (
                <span className="tm-badge data-font">{task.date}</span>
              )}
              {task.time && (
                <span className="tm-badge data-font">{task.time}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="tm-grid">

          {/* Left: description */}
          <div className="tm-section">
            <div className="tm-section-label tech-font">DESCRIÇÃO</div>
            <textarea
              className="tm-textarea data-font"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalhamento da operação..."
            />
          </div>

          {/* Right: subtasks */}
          <div className="tm-section">
            <div className="tm-section-header">
              <div className="tm-section-label tech-font">ETAPAS</div>
            </div>

            <div className="tm-subtask-add">
              <input
                className="tm-input tech-font"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addSubtask(); }}
                placeholder="Nova etapa..."
              />
              <button type="button" className="tm-add-btn tech-font" onClick={addSubtask}>+</button>
            </div>

            <div className="tm-subtask-list">
              {subtasks.length === 0 && (
                <div className="tm-empty tech-font">SEM ETAPAS</div>
              )}
              {subtasks.map(s => (
                <div key={s.id} className={`tm-subtask${s.done ? " is-done" : ""}`}>
                  <button
                    type="button"
                    className="tm-check"
                    onClick={() => toggleSubtask(s.id)}
                    style={s.done ? { borderColor: task.borderColor, background: task.borderColor } : undefined}
                  >
                    {s.done && <span>✓</span>}
                  </button>
                  <span className="tm-subtask-text">{s.text}</span>
                  <button type="button" className="tm-sub-del" onClick={() => removeSubtask(s.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Comments ── */}
        <div className="tm-section">
          <div className="tm-section-label tech-font">COMENTÁRIOS</div>
          <div className="tm-comment-add">
            <input
              className="tm-input tech-font"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addComment(); }}
              placeholder="Escreve um comentário..."
            />
            <button type="button" className="tm-add-btn tech-font" onClick={addComment}>ENVIAR</button>
          </div>

          {comments.length > 0 && (
            <div className="tm-comment-list">
              {comments.map(c => (
                <div key={c.id} className="tm-comment">
                  <span className="tm-comment-text">{c.text}</span>
                  <div className="tm-comment-foot">
                    <span className="tm-comment-date data-font">{c.date}</span>
                    <button type="button" className="tm-sub-del" onClick={() => removeComment(c.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ModalContainer>
  );
}