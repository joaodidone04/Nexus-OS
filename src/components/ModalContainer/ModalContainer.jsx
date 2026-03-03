import { useEffect } from "react";
import "./ModalContainer.css";

export default function ModalContainer({ title, onClose, footer, children }) {
  // FIX: fechar modal ao pressionar Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="nx-modal-overlay"
      role="dialog"
      aria-modal="true"
      // FIX: fechar ao clicar no overlay (fundo escuro)
      onClick={onClose}
    >
      <div
        className="nx-modal glass"
        // FIX: impede que cliques dentro do modal fechem pelo overlay
        onClick={(e) => e.stopPropagation()}
      >
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

        {footer && <footer className="nx-modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}