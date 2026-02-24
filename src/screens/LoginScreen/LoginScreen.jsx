import React, { useEffect, useRef, useState } from "react";
import {
  streamProfilesLocal,
  createProfileLocal,
  deleteProfileLocal,
} from "../../services/profileStorage";

// ✅ DEFAULT_STATIONS definido aqui (MVP)
const DEFAULT_STATIONS = [
  { id: "missions", name: "MISSÕES", xp: 0, level: 1 },
  { id: "finance", name: "FINANCEIRO", xp: 0, level: 1 },
  { id: "health", name: "SAÚDE", xp: 0, level: 1 },
];

export default function LoginScreen({ onSelectProfile }) {
  // Boot / Transition
  const [booting, setBooting] = useState(true);
  const [bootFadeOut, setBootFadeOut] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Data
  const [profiles, setProfiles] = useState([]);
  const [step, setStep] = useState("selection"); // selection | password | create | delete_confirm

  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newAvatar, setNewAvatar] = useState("👤");

  const [passInput, setPassInput] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  // show/hide
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);

  // delete flow
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deletePassInput, setDeletePassInput] = useState("");
  const [deleteConfirmWord, setDeleteConfirmWord] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Streams
  useEffect(() => {
    const unsubscribe = streamProfilesLocal((data) => setProfiles(data));
    return () => unsubscribe();
  }, []);

  // Boot sequence: show for 2000ms, fade out 600ms, then show content
  useEffect(() => {
    const t1 = setTimeout(() => setBootFadeOut(true), 2000);
    const t2 = setTimeout(() => {
      setBooting(false);
      requestAnimationFrame(() => setContentVisible(true));
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const resetForm = () => {
    setNewName("");
    setNewPass("");
    setNewAvatar("👤");

    setPassInput("");
    setSelectedProfile(null);

    setShowLoginPass(false);
    setShowCreatePass(false);
    setShowDeletePass(false);

    setProfileToDelete(null);
    setDeletePassInput("");
    setDeleteConfirmWord("");

    setError("");
    setIsSubmitting(false);
  };

  const isImageAvatar = (v) =>
    typeof v === "string" && (v.startsWith("data:") || v.startsWith("http"));

  const handleCreate = () => {
    if (!newName.trim() || !newPass.trim()) {
      setError("Identidade incompleta.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const profileData = {
        name: newName.trim(),
        avatar: newAvatar,
        password: newPass,
        level: 1,
        xp: 0,
        maxXp: 100,
        stations: [...DEFAULT_STATIONS], // ✅ agora existe
      };

      createProfileLocal(profileData);

      resetForm();
      setStep("selection");
    } catch (err) {
      console.error("ERRO AO REGISTRAR:", err);
      setError("Falha ao registrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    if (selectedProfile && passInput === selectedProfile.password) {
      if (typeof onSelectProfile === "function") onSelectProfile(selectedProfile);
      return;
    }
    setError("Chave inválida.");
    setTimeout(() => setError(""), 2500);
  };

  const openDelete = (profile) => {
    setProfileToDelete(profile);
    setDeletePassInput("");
    setDeleteConfirmWord("");
    setError("");
    setStep("delete_confirm");
  };

  const handleDelete = () => {
    if (!profileToDelete) return;

    const confirmOk = deleteConfirmWord.trim().toUpperCase() === "EXCLUIR";
    if (!confirmOk) {
      setError('Digite "EXCLUIR" para confirmar.');
      return;
    }

    if (deletePassInput !== profileToDelete.password) {
      setError("Senha incorreta.");
      return;
    }

    try {
      deleteProfileLocal(profileToDelete.id);
      resetForm();
      setStep("selection");
    } catch (err) {
      console.error("ERRO AO EXCLUIR:", err);
      setError("Falha ao excluir operador.");
    }
  };

  return (
    <div className="login-root">
      {/* Background layers globais */}
      <div className="bg-base" />
      <div className="bg-grid" />
      <div className="vignette" />

      {/* BOOT */}
      {booting && (
        <>
          <div className="boot-noise" />
          <div className="boot-scanlines" />

          <div className={`login-boot ${bootFadeOut ? "is-fadeout" : ""}`}>
            <div className="login-boot-inner">
              <div className="boot-orb" />
              <div className="login-boot-text">
                <div className="glitch" data-text="NΞXUS">
                  NΞXUS
                </div>
                <div className="login-boot-sub">INITIALIZING SYSTEM INTERFACE</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CONTENT */}
      {!booting && (
        <div className={`login-content ${contentVisible ? "is-visible" : ""}`}>
          <div className="login-shell">
            <h1 className="login-title brand-font">
              NΞXUS<span className="login-dot">.</span>
            </h1>

            {/* SELECTION */}
            {step === "selection" && (
              <div className="login-selection">
                {profiles.map((profile) => (
                  <div className="login-card-wrap" key={profile.id}>
                    <button
                      type="button"
                      className="login-card"
                      onClick={() => {
                        setSelectedProfile(profile);
                        setPassInput("");
                        setError("");
                        setStep("password");
                      }}
                    >
                      <div className="login-avatar">
                        {isImageAvatar(profile.avatar) ? (
                          <img src={profile.avatar} alt="avatar" />
                        ) : (
                          <span>{typeof profile.avatar === "string" ? profile.avatar : "👤"}</span>
                        )}
                      </div>

                      <div className="login-card-name">{profile.name}</div>
                    </button>

                    <button
                      type="button"
                      className="login-card-delete"
                      title="Excluir operador"
                      onClick={() => openDelete(profile)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="login-card-add"
                  onClick={() => {
                    resetForm();
                    setStep("create");
                  }}
                >
                  <div className="login-plus">+</div>
                  <span className="login-add-label">Novo Operador</span>
                </button>
              </div>
            )}

            {/* PASSWORD */}
            {step === "password" && selectedProfile && (
              <div className="login-panel">
                <div className="login-avatar big">
                  {isImageAvatar(selectedProfile.avatar) ? (
                    <img src={selectedProfile.avatar} alt="avatar" />
                  ) : (
                    <span>{typeof selectedProfile.avatar === "string" ? selectedProfile.avatar : "👤"}</span>
                  )}
                </div>

                <div className="login-panel-title">{selectedProfile.name}</div>

                <div className="login-input-row">
                  <input
                    className="login-input"
                    type={showLoginPass ? "text" : "password"}
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="CHAVE DE ACESSO"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowLoginPass((s) => !s)}
                    title={showLoginPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showLoginPass ? "🙈" : "👁️"}
                  </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <div className="login-actions">
                  <button
                    type="button"
                    className="login-btn ghost"
                    onClick={() => {
                      setStep("selection");
                      resetForm();
                    }}
                  >
                    Voltar
                  </button>

                  <button type="button" className="login-btn primary" onClick={handleLogin}>
                    Acessar
                  </button>
                </div>
              </div>
            )}

            {/* CREATE */}
            {step === "create" && (
              <div className="login-panel">
                <div className="login-avatar big">
                  {isImageAvatar(newAvatar) ? (
                    <img src={newAvatar} alt="avatar" />
                  ) : (
                    <span>{typeof newAvatar === "string" ? newAvatar : "👤"}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="login-link"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Mudar Avatar
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="login-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setNewAvatar(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />

                <input
                  className="login-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="CODINOME"
                />

                <div className="login-input-row">
                  <input
                    className="login-input"
                    type={showCreatePass ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="CHAVE DE ACESSO"
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowCreatePass((s) => !s)}
                    title={showCreatePass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showCreatePass ? "🙈" : "👁️"}
                  </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <div className="login-actions">
                  <button
                    type="button"
                    className="login-btn ghost"
                    onClick={() => {
                      setStep("selection");
                      resetForm();
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="login-btn primary"
                    onClick={handleCreate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "INICIALIZANDO..." : "REGISTRAR"}
                  </button>
                </div>
              </div>
            )}

            {/* DELETE CONFIRM */}
            {step === "delete_confirm" && profileToDelete && (
              <div className="login-panel danger">
                <div className="login-panel-title danger">Excluir Operador</div>

                <div className="login-danger-hint">
                  Você está prestes a excluir <b>{profileToDelete.name}</b>.
                  <br />
                  Digite <b>EXCLUIR</b> e informe a senha do operador.
                </div>

                <input
                  className="login-input"
                  value={deleteConfirmWord}
                  onChange={(e) => setDeleteConfirmWord(e.target.value)}
                  placeholder='Digite "EXCLUIR"'
                />

                <div className="login-input-row">
                  <input
                    className="login-input"
                    type={showDeletePass ? "text" : "password"}
                    value={deletePassInput}
                    onChange={(e) => setDeletePassInput(e.target.value)}
                    placeholder="Senha do operador"
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowDeletePass((s) => !s)}
                    title={showDeletePass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showDeletePass ? "🙈" : "👁️"}
                  </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <div className="login-actions">
                  <button
                    type="button"
                    className="login-btn ghost"
                    onClick={() => {
                      setStep("selection");
                      resetForm();
                    }}
                  >
                    Voltar
                  </button>

                  <button type="button" className="login-btn danger" onClick={handleDelete}>
                    EXCLUIR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}