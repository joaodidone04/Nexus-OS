import React, { useEffect, useMemo, useState } from "react";
import ModalContainer from "../ModalContainer/ModalContainer.jsx"; // ajuste o caminho se o teu for diferente
import "./TaskModal.css";

const uid = () => Math.random().toString(36).slice(2, 9);

export default function TaskModal({ task, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(() => normalizeTask(task));

  // ✅ quando abrir outra task, sincroniza o draft
  useEffect(() => {
    setDraft(normalizeTask(task));
  }, [task]);

  const progress = useMemo(() => {
    const total = draft.subtasks.length;
    const done = draft.subtasks.filter((s) => s.done).length;
    return { total, done };
  }, [draft.subtasks]);

  const addSubtask = () => {
    setDraft((d) => ({
      ...d,
      subtasks: [...d.subtasks, { id: uid(), text: "", done: false }],
    }));
  };

  const updateSubtask = (id, patch) => {
    setDraft((d) => ({
      ...d,
      subtasks: d.subtasks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const removeSubtask = (id) => {
    setDraft((d) => ({
      ...d,
      subtasks: d.subtasks.filter((s) => s.id !== id),
    }));
  };

  const addComment = (text) => {
    const t = text.trim();
    if (!t) return;
    setDraft((d) => ({
      ...d,
      comments: [{ id: uid(), text: t, at: Date.now() }, ...d.comments],
    }));
  };

  const removeComment = (id) => {
    setDraft((d) => ({
      ...d,
      comments: d.comments.filter((c) => c.id !== id),
    }));
  };

  const footer = (
    <>
      <button
        type="button"
        className="nx-modal-link"
        onClick={() => onDelete?.(draft.id)}
      >
        Eliminar
      </button>

      <button
        type="button"
        className="nx-modal-confirm"
        onClick={() => onSave?.(draft)}
      >
        Salvar
      </button>
    </>
  );

  return (
    <ModalContainer title="TASK LOG" onClose={onClose} footer={footer}>
      <div className="tm-root">
        <div className="tm-header">
          <div className="tm-icon" style={{ borderColor: draft.borderColor }}>
            {draft.icon}
          </div>

          <div className="tm-head">
            <input
              className="tm-title"
              value={draft.title || ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder="Título da task"
            />

            <div className="tm-meta">
              <span
                className="tm-pill"
                style={{ borderColor: (draft.borderColor || "#3b82f6") + "66" }}
              >
                +{draft.xp || 0} XP
              </span>

              {progress.total > 0 ? (
                <span className="tm-pill">
                  {progress.done}/{progress.total} etapas
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="tm-grid">
          <div className="tm-block tm-desc">
            <div className="tm-label">Descrição</div>
            <textarea
              className="tm-textarea"
              value={draft.description || ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              placeholder="Log / descrição…"
            />
          </div>

          <div className="tm-block tm-subtasks">
            <div className="tm-row">
              <div className="tm-label">Etapas (subtasks)</div>
              <button type="button" className="tm-add" onClick={addSubtask}>
                + Adicionar
              </button>
            </div>

            <div className="tm-list tm-list-scroll">
              {draft.subtasks.length === 0 ? (
                <div className="tm-empty">Sem etapas ainda.</div>
              ) : (
                draft.subtasks.map((s) => (
                  <div key={s.id} className="tm-subtask">
                    <button
                      type="button"
                      className={`tm-check ${s.done ? "is-on" : ""}`}
                      onClick={() => updateSubtask(s.id, { done: !s.done })}
                    >
                      {s.done ? "✓" : ""}
                    </button>

                    <input
                      className="tm-subtask-input"
                      value={s.text || ""}
                      onChange={(e) =>
                        updateSubtask(s.id, { text: e.target.value })
                      }
                      placeholder="Descrição da etapa…"
                    />

                    <button
                      type="button"
                      className="tm-del"
                      onClick={() => removeSubtask(s.id)}
                      title="Remover etapa"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <CommentsBlock
            comments={draft.comments}
            onAdd={addComment}
            onRemove={removeComment}
          />
        </div>
      </div>
    </ModalContainer>
  );
}

function CommentsBlock({ comments, onAdd, onRemove }) {
  const [text, setText] = useState("");

  const submit = () => {
    onAdd(text);
    setText("");
  };

  return (
    <div className="tm-block tm-comments">
      <div className="tm-row">
        <div className="tm-label">Comentários</div>
      </div>

      <div className="tm-commentbox">
        <input
          className="tm-comment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreve um comentário…"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button type="button" className="tm-add" onClick={submit}>
          Enviar
        </button>
      </div>

      <div className="tm-list">
        {comments.length === 0 ? (
          <div className="tm-empty">Sem comentários ainda.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="tm-comment">
              <div className="tm-comment-text">{c.text}</div>
              <div className="tm-comment-actions">
                <span className="tm-comment-at">
                  {c.at ? new Date(c.at).toLocaleString() : ""}
                </span>
                <button
                  type="button"
                  className="tm-del"
                  onClick={() => onRemove(c.id)}
                  title="Remover comentário"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function normalizeTask(task) {
  return {
    ...task,
    borderColor: task?.borderColor || "#3b82f6",
    subtasks: Array.isArray(task?.subtasks) ? task.subtasks : [],
    comments: Array.isArray(task?.comments) ? task.comments : [],
  };
}