import { useEffect, useRef, useState } from "react";
import {
  streamProfilesLocal,
  createProfileLocal,
  deleteProfileLocal,
} from "../../services/profileStorage";
import "./LoginScreen.css";

const DEFAULT_STATIONS = [
  { id: "missions",  name: "MISSÕES",    xp: 0, level: 1 },
  { id: "finance",   name: "FINANCEIRO", xp: 0, level: 1 },
  { id: "health",    name: "SAÚDE",      xp: 0, level: 1 },
];

const isImageAvatar = (v) =>
  typeof v === "string" && (v.startsWith("data:") || v.startsWith("http"));

// ── Boot lines geradas uma vez ─────────────────────────────────────────────
const BOOT_LINES = [
  "NΞXUS OS v4.1.0 ............ [OK]",
  "KERNEL MAINFRAME ............ [OK]",
  "NEURAL INTERFACE ............ [OK]",
  "ENCRYPTION LAYER AES-512 .... [OK]",
  "BIOMETRIC MODULE ............ [OK]",
  "PROFILE DATABASE ............ [OK]",
  "AWAITING OPERATOR AUTH ......",
];

// ══════════════════════════════════════════════════════════════════════════
export default function LoginScreen({ onSelectProfile }) {
  // ── Boot ─────────────────────────────────────────────────────────────────
  const [bootPhase, setBootPhase]   = useState("boot");   // boot | fadeout | ready
  const [bootLine,  setBootLine]    = useState(0);

  useEffect(() => {
    // Anima as linhas de boot uma a uma
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setBootLine(idx);
      if (idx >= BOOT_LINES.length) clearInterval(interval);
    }, 260);

    // Inicia fadeout após 2.4s
    const t1 = setTimeout(() => setBootPhase("fadeout"), 2400);
    // Mostra conteúdo após 3.0s
    const t2 = setTimeout(() => setBootPhase("ready"),   3000);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Profiles ──────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    const unsub = streamProfilesLocal((data) => setProfiles(data ?? []));
    return () => unsub?.();
  }, []);

  // ── Step ──────────────────────────────────────────────────────────────────
  // "select" | "password" | "create" | "delete"
  const [step, setStep] = useState("select");

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [passInput,        setPassInput]       = useState("");
  const [showPass,         setShowPass]        = useState(false);

  const [newName,     setNewName]     = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [newPassConf, setNewPassConf] = useState("");
  const [newAvatar,   setNewAvatar]   = useState("👤");
  const [showNewPass, setShowNewPass] = useState(false);

  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deletePass,    setDeletePass]    = useState("");
  const [deleteWord,    setDeleteWord]    = useState("");
  const [showDelPass,   setShowDelPass]   = useState(false);

  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]   = useState(false);

  const fileRef = useRef(null);

  const clearError = () => setError("");

  const resetAll = () => {
    setSelectedProfile(null);
    setPassInput(""); setShowPass(false);
    setNewName(""); setNewPass(""); setNewPassConf(""); setNewAvatar("👤"); setShowNewPass(false);
    setDeleteTarget(null); setDeletePass(""); setDeleteWord(""); setShowDelPass(false);
    setError(""); setSubmitting(false);
  };

  const go = (s) => { resetAll(); setStep(s); };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectProfile = (p) => {
    resetAll();
    setSelectedProfile(p);
    setStep("password");
  };

  const handleLogin = () => {
    if (!selectedProfile) return;
    if (passInput === selectedProfile.password) {
      onSelectProfile?.(selectedProfile);
      return;
    }
    setError("CHAVE INVÁLIDA — ACESSO NEGADO");
    setTimeout(clearError, 2500);
  };

  const handleCreate = () => {
    if (!newName.trim())       return setError("CODINOME OBRIGATÓRIO");
    if (!newPass.trim())       return setError("CHAVE DE ACESSO OBRIGATÓRIA");
    if (newPass !== newPassConf) return setError("CHAVES NÃO COINCIDEM");

    setSubmitting(true);
    setError("");
    try {
      createProfileLocal({
        name:     newName.trim(),
        avatar:   newAvatar,
        password: newPass,
        level:    1,
        xp:       0,
        maxXp:    100,
        stations: [...DEFAULT_STATIONS],
      });
      go("select");
    } catch (e) {
      console.error(e);
      setError("FALHA AO REGISTRAR OPERADOR");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (p) => {
    resetAll();
    setDeleteTarget(p);
    setStep("delete");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteWord.trim().toUpperCase() !== "EXCLUIR")
      return setError('DIGITE "EXCLUIR" PARA CONFIRMAR');
    if (deletePass !== deleteTarget.password)
      return setError("CHAVE INCORRETA");
    try {
      deleteProfileLocal(deleteTarget.id);
      go("select");
    } catch (e) {
      console.error(e);
      setError("FALHA AO EXCLUIR OPERADOR");
    }
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ls-root">
      {/* Background */}
      <div className="ls-bg" />
      <div className="ls-grid" />
      <div className="ls-scanlines" />
      <div className="ls-vignette" />

      {/* ── BOOT SCREEN ── */}
      {bootPhase !== "ready" && (
        <div className={`ls-boot${bootPhase === "fadeout" ? " is-out" : ""}`}>
          <div className="ls-boot-orb" />
          <div className="ls-boot-logo">NΞXUS</div>
          <div className="ls-boot-lines">
            {BOOT_LINES.slice(0, bootLine).map((line, i) => (
              <div key={i} className="ls-boot-line data-font">
                <span className="ls-boot-prompt">{">"}</span>
                {line}
                {i === bootLine - 1 && <span className="ls-boot-cursor" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {bootPhase === "ready" && (
        <div className="ls-content">

          {/* Logo */}
          <div className="ls-logo-row">
            <div className="ls-logo tech-font">NΞXUS</div>
            <div className="ls-logo-sub tech-font">MAINFRAME INTERFACE v4.1</div>
          </div>

          {/* ── SELECT ── */}
          {step === "select" && (
            <div className="ls-panel">
              <div className="ls-panel-title tech-font">SELECIONAR OPERADOR</div>

              <div className="ls-profiles">
                {profiles.length === 0 && (
                  <div className="ls-empty data-font">NENHUM OPERADOR REGISTRADO</div>
                )}

                {profiles.map(p => (
                  <div key={p.id} className="ls-profile-row">
                    <button
                      type="button"
                      className="ls-profile-btn"
                      onClick={() => handleSelectProfile(p)}
                    >
                      <div className="ls-avatar-sm">
                        {isImageAvatar(p.avatar)
                          ? <img src={p.avatar} alt="avatar" />
                          : <span>{typeof p.avatar === "string" ? p.avatar : "👤"}</span>}
                      </div>
                      <div className="ls-profile-info">
                        <span className="ls-profile-name tech-font">{p.name}</span>
                        <span className="ls-profile-level data-font">LV {p.level ?? 1}</span>
                      </div>
                      <span className="ls-profile-arrow">▶</span>
                    </button>

                    <button
                      type="button"
                      className="ls-profile-del"
                      title="Excluir operador"
                      onClick={() => handleOpenDelete(p)}
                    >✕</button>
                  </div>
                ))}
              </div>

              <button type="button" className="ls-add-btn tech-font" onClick={() => go("create")}>
                <span>+</span> REGISTRAR NOVO OPERADOR
              </button>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {step === "password" && selectedProfile && (
            <div className="ls-panel ls-panel--narrow">
              <div className="ls-avatar-lg">
                {isImageAvatar(selectedProfile.avatar)
                  ? <img src={selectedProfile.avatar} alt="avatar" />
                  : <span>{typeof selectedProfile.avatar === "string" ? selectedProfile.avatar : "👤"}</span>}
              </div>

              <div className="ls-panel-title tech-font">{selectedProfile.name}</div>
              <div className="ls-panel-sub data-font">AUTENTICAÇÃO NECESSÁRIA</div>

              <div className="ls-input-wrap">
                <input
                  className="ls-input tech-font"
                  type={showPass ? "text" : "password"}
                  value={passInput}
                  onChange={e => { setPassInput(e.target.value); clearError(); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="CHAVE DE ACESSO"
                  autoFocus
                />
                <button
                  type="button"
                  className="ls-eye"
                  onClick={() => setShowPass(s => !s)}
                >{showPass ? "○" : "●"}</button>
              </div>

              {error && <div className="ls-error tech-font">{error}</div>}

              <div className="ls-actions">
                <button type="button" className="ls-btn ls-btn--ghost tech-font" onClick={() => go("select")}>
                  ← VOLTAR
                </button>
                <button type="button" className="ls-btn ls-btn--primary tech-font" onClick={handleLogin}>
                  ACESSAR SISTEMA
                </button>
              </div>
            </div>
          )}

          {/* ── CREATE ── */}
          {step === "create" && (
            <div className="ls-panel ls-panel--narrow">
              <div className="ls-panel-title tech-font">REGISTRAR OPERADOR</div>
              <div className="ls-panel-sub data-font">NOVO ACESSO AO MAINFRAME</div>

              {/* Avatar */}
              <div className="ls-avatar-edit">
                <div className="ls-avatar-lg" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
                  {isImageAvatar(newAvatar)
                    ? <img src={newAvatar} alt="avatar" />
                    : <span>{newAvatar}</span>}
                  <div className="ls-avatar-overlay tech-font">FOTO</div>
                </div>
              </div>
              <input type="file" ref={fileRef} accept="image/*" className="ls-hidden" onChange={handleAvatarFile} />

              <input
                className="ls-input tech-font"
                value={newName}
                onChange={e => { setNewName(e.target.value); clearError(); }}
                placeholder="CODINOME DO OPERADOR"
                style={{ marginBottom: 8 }}
              />

              <div className="ls-input-wrap">
                <input
                  className="ls-input tech-font"
                  type={showNewPass ? "text" : "password"}
                  value={newPass}
                  onChange={e => { setNewPass(e.target.value); clearError(); }}
                  placeholder="CHAVE DE ACESSO"
                />
                <button type="button" className="ls-eye" onClick={() => setShowNewPass(s => !s)}>
                  {showNewPass ? "○" : "●"}
                </button>
              </div>

              <input
                className="ls-input tech-font"
                type="password"
                value={newPassConf}
                onChange={e => { setNewPassConf(e.target.value); clearError(); }}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="CONFIRMAR CHAVE"
                style={{ marginTop: 8 }}
              />

              {error && <div className="ls-error tech-font">{error}</div>}

              <div className="ls-actions">
                <button type="button" className="ls-btn ls-btn--ghost tech-font" onClick={() => go("select")}>
                  ← CANCELAR
                </button>
                <button
                  type="button"
                  className="ls-btn ls-btn--primary tech-font"
                  onClick={handleCreate}
                  disabled={submitting}
                >
                  {submitting ? "INICIALIZANDO..." : "REGISTRAR"}
                </button>
              </div>
            </div>
          )}

          {/* ── DELETE ── */}
          {step === "delete" && deleteTarget && (
            <div className="ls-panel ls-panel--narrow ls-panel--danger">
              <div className="ls-panel-title tech-font" style={{ color: "#f87171" }}>
                EXCLUIR OPERADOR
              </div>
              <div className="ls-panel-sub data-font" style={{ color: "rgba(248,113,113,0.65)" }}>
                {deleteTarget.name} — ESTA AÇÃO É IRREVERSÍVEL
              </div>

              <input
                className="ls-input tech-font"
                value={deleteWord}
                onChange={e => { setDeleteWord(e.target.value); clearError(); }}
                placeholder='DIGITE "EXCLUIR" PARA CONFIRMAR'
                style={{ marginBottom: 8 }}
              />

              <div className="ls-input-wrap">
                <input
                  className="ls-input tech-font"
                  type={showDelPass ? "text" : "password"}
                  value={deletePass}
                  onChange={e => { setDeletePass(e.target.value); clearError(); }}
                  onKeyDown={e => e.key === "Enter" && handleDelete()}
                  placeholder="CHAVE DO OPERADOR"
                />
                <button type="button" className="ls-eye" onClick={() => setShowDelPass(s => !s)}>
                  {showDelPass ? "○" : "●"}
                </button>
              </div>

              {error && <div className="ls-error tech-font">{error}</div>}

              <div className="ls-actions">
                <button type="button" className="ls-btn ls-btn--ghost tech-font" onClick={() => go("select")}>
                  ← CANCELAR
                </button>
                <button type="button" className="ls-btn ls-btn--danger tech-font" onClick={handleDelete}>
                  CONFIRMAR EXCLUSÃO
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}