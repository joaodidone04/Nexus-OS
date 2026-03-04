// ═══════════════════════════════════════════════════════════
//  NΞXUS — OnboardingScreen  (src/auth/OnboardingScreen.jsx)
//  Aparece na primeira vez após login com Google/Apple.
//  O usuário escolhe seu codinome de operador.
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./OnboardingScreen.css";

const RANK_INTRO = {
  id:    "recruit",
  title: "RECRUTA",
  icon:  "⬡",
  color: "#6b7280",
  desc:  "Operador recém-ativado. O sistema aguarda sua ação.",
};

const SUGGESTIONS = [
  "GHOST", "CIPHER", "NEXUS", "VECTOR", "PHANTOM",
  "SIGMA", "ECHO", "RAVEN", "APEX", "ZERO",
];

export default function OnboardingScreen() {
  const { profile, updateMyProfile, firebaseUser } = useAuth();

  const [step,       setStep]       = useState(1); // 1 = nome, 2 = confirmação
  const [codename,   setCodename]   = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [particles,  setParticles]  = useState([]);

  // Sugestão de nome baseada no nome real do Google
  useEffect(() => {
    if (firebaseUser?.displayName) {
      const firstName = firebaseUser.displayName.split(" ")[0].toUpperCase();
      setCodename(firstName);
    }
  }, [firebaseUser]);

  // Partículas decorativas
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x:  Math.random() * 100,
        y:  Math.random() * 100,
        s:  Math.random() * 3 + 1,
        d:  Math.random() * 6 + 4,
        o:  Math.random() * 0.4 + 0.1,
      }))
    );
  }, []);

  function handleCodenameChange(e) {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9_\-. ]/g, "")
      .slice(0, 20);
    setCodename(val);
    setError("");
  }

  function validate() {
    const trimmed = codename.trim();
    if (!trimmed)           return "Defina seu codinome de operador.";
    if (trimmed.length < 2) return "Codinome muito curto. Mínimo 2 caracteres.";
    return "";
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    setStep(2);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await updateMyProfile({
        displayName:     codename.trim(),
        onboardingDone:  true,
        profileComplete: false, // bio ainda não preenchida
      });
      // AuthContext já vai atualizar o profile em tempo real via listener
    } catch (e) {
      setError("Erro ao salvar. Tente novamente.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  const photoURL = firebaseUser?.photoURL;

  return (
    <div className="ob-root">
      {/* Fundo */}
      <div className="ob-bg" />
      <div className="ob-grid" />
      <div className="ob-vignette" />

      {/* Partículas */}
      <div className="ob-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="ob-particle"
            style={{
              left:            `${p.x}%`,
              top:             `${p.y}%`,
              width:           `${p.s}px`,
              height:          `${p.s}px`,
              opacity:         p.o,
              animationDuration: `${p.d}s`,
            }}
          />
        ))}
      </div>

      <div className="ob-content">
        {/* Logo */}
        <div className="ob-logo tech-font">NΞXUS</div>
        <div className="ob-logo-sub data-font">PROTOCOLO DE IDENTIFICAÇÃO</div>

        {/* ── STEP 1 — Escolher codinome ── */}
        {step === 1 && (
          <div className="ob-card" key="step1">
            {/* Avatar do Google */}
            <div className="ob-avatar-row">
              {photoURL ? (
                <img src={photoURL} alt="avatar" className="ob-avatar" />
              ) : (
                <div className="ob-avatar ob-avatar--placeholder">
                  {firebaseUser?.email?.[0]?.toUpperCase() || "O"}
                </div>
              )}
              <div className="ob-avatar-info">
                <div className="ob-avatar-email tech-font">
                  {firebaseUser?.email}
                </div>
                <div className="ob-avatar-badge data-font">CONTA VERIFICADA ✓</div>
              </div>
            </div>

            <div className="ob-divider" />

            {/* Campo de codinome */}
            <div className="ob-field">
              <label className="ob-label tech-font">
                DEFINA SEU CODINOME DE OPERADOR
              </label>
              <div className="ob-input-wrap">
                <input
                  type="text"
                  className="ob-input tech-font"
                  value={codename}
                  onChange={handleCodenameChange}
                  placeholder="EX: GHOST, CIPHER, PHANTOM..."
                  maxLength={20}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
                <span className="ob-input-count data-font">
                  {codename.trim().length}/20
                </span>
              </div>
              <p className="ob-field-hint data-font">
                Apenas letras, números, hífen e underscore. Pode mudar depois.
              </p>
            </div>

            {/* Sugestões rápidas */}
            <div className="ob-suggestions">
              <span className="ob-suggestions-label data-font">SUGESTÕES</span>
              <div className="ob-suggestions-pills">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="ob-pill tech-font"
                    onClick={() => { setCodename(s); setError(""); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="ob-error tech-font">{error}</div>}

            <button className="ob-btn-primary tech-font" onClick={handleNext}>
              CONTINUAR →
            </button>
          </div>
        )}

        {/* ── STEP 2 — Confirmação + rank inicial ── */}
        {step === 2 && (
          <div className="ob-card ob-card--confirm" key="step2">
            {/* Rank inicial */}
            <div
              className="ob-rank-badge"
              style={{ "--r": RANK_INTRO.color }}
            >
              <div className="ob-rank-icon">{RANK_INTRO.icon}</div>
              <div className="ob-rank-info">
                <div className="ob-rank-label data-font">RANK INICIAL</div>
                <div className="ob-rank-title tech-font">{RANK_INTRO.title}</div>
              </div>
            </div>

            {/* Confirmação do nome */}
            <div className="ob-confirm-name">
              <div className="ob-confirm-label data-font">SEU CODINOME</div>
              <div className="ob-confirm-value tech-font">{codename.trim()}</div>
            </div>

            {/* XP de boas-vindas */}
            <div className="ob-welcome-xp">
              <div className="ob-xp-row">
                <span>🚀</span>
                <span className="ob-xp-label data-font">Bônus de primeiro acesso</span>
                <span className="ob-xp-val tech-font">+25 XP</span>
              </div>
              <div className="ob-xp-row">
                <span>📅</span>
                <span className="ob-xp-label data-font">Login diário</span>
                <span className="ob-xp-val tech-font">+5 XP</span>
              </div>
            </div>

            {/* Desc do rank */}
            <p className="ob-rank-desc data-font">
              {RANK_INTRO.desc}
            </p>

            <div className="ob-confirm-actions">
              <button
                className="ob-btn-ghost tech-font"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← ALTERAR
              </button>
              <button
                className="ob-btn-primary tech-font"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "ATIVANDO..." : "ATIVAR OPERADOR ⚡"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}