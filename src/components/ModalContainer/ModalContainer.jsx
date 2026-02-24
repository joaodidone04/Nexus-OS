import React from "react";

export default function ModalContainer({ title, onClose, footer, children }) {
  return (
    <div className="nx-modal-overlay" role="dialog" aria-modal="true">
      <div className="nx-modal glass">
        <header className="nx-modal-header">
          <div className="nx-modal-title tech-font">{title}</div>

          <button
            type="button"
            className="nx-modal-close"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            ✕
          </button>
        </header>

        <div className="nx-modal-body">{children}</div>

        {footer ? <footer className="nx-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}