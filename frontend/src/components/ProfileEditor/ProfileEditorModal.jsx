import React, { useRef, useState } from "react";
import "./ProfileEditorModal.css";

const DEFAULT_AVATARS = ["👤", "🤖", "💠", "🚀", "⚡", "🧬"];

export default function ProfileEditorModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.name || "");
  const [password, setPassword] = useState(profile?.password || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "👤");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatar(String(reader.result || "👤"));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      password,
      avatar,
    });
  };

  const renderAvatar = (av) => {
    const safe = typeof av === "string" ? av : "👤";
    const isImage = safe.startsWith("data:") || safe.startsWith("http");

    return (
      <div className="pem-avatar">
        {isImage ? (
          <img className="pem-avatar-img" src={safe} alt="Avatar" />
        ) : (
          <span className="pem-avatar-emoji">{safe}</span>
        )}
      </div>
    );
  };

  return (
    <div className="pem-overlay" role="dialog" aria-modal="true">
      <div className="pem-modal glass">
        <div className="pem-header">
          <h2 className="pem-title tech-font">EDITAR PERFIL</h2>

          <button
            type="button"
            className="pem-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="pem-body">
          <div className="pem-avatar-block">
            <div className="pem-avatar-wrap">
              {renderAvatar(avatar)}

              <button
                type="button"
                className="pem-avatar-upload"
                onClick={() => fileInputRef.current?.click()}
                title="Alterar foto"
              >
                📷
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="pem-hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="pem-avatar-picks">
              {DEFAULT_AVATARS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  className={`pem-pick ${avatar === ic ? "is-active" : ""}`}
                  onClick={() => setAvatar(ic)}
                  title={`Avatar ${ic}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="pem-fields">
            <div className="pem-field">
              <label className="pem-label tech-font">CODINOME</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="pem-input tech-font"
                placeholder="OPERADOR_XX"
              />
            </div>

            <div className="pem-field">
              <label className="pem-label tech-font">CHAVE DE ACESSO</label>

              <div className="pem-pass-row">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pem-input"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  className="pem-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pem-actions">
          <button type="button" className="pem-btn ghost" onClick={onClose}>
            CANCELAR
          </button>

          <button type="button" className="pem-btn primary" onClick={handleSave}>
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </div>
  );
}