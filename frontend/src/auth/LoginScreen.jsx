// ═══════════════════════════════════════════════════════════
//  NΞXUS — LoginScreen  (src/auth/LoginScreen.jsx)
//  Google · Apple · E-mail/Senha · Cadastro · Reset de senha
// ═══════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginScreen.css";

// ── Linhas de boot ─────────────────────────────
const BOOT_LINES = [
  "INICIALIZANDO NEXUS OS v4.2.1...",
  "CARREGANDO MÓDULOS DE SEGURANÇA...",
  "PROTOCOLO DE AUTENTICAÇÃO ATIVO...",
  "VERIFICANDO CREDENCIAIS DE ACESSO...",
  "SISTEMA PRONTO.",
];

// ── Ícone Google ────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Ícone Apple ─────────────────────────────────
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ── Ícone E-mail ────────────────────────────────
function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════
//  BOOT SCREEN
// ══════════════════════════════════════════════════════════
function BootScreen({ onDone }) {
  const [lines,   setLines]   = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLines((prev) => [...prev, BOOT_LINES[i]]);
      i++;
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onDone, 600);
        }, 600);
      }
    }, 320);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className={`ls-boot${visible ? "" : " is-out"}`}>
      <div className="ls-boot-orb" />
      <div className="ls-boot-logo tech-font">NΞXUS</div>
      <div className="ls-boot-lines">
        {lines.map((line, i) => (
          <div key={i} className="ls-boot-line data-font">
            <span className="ls-boot-prompt">{">"}</span>
            {line}
          </div>
        ))}
        {lines.length < BOOT_LINES.length && (
          <div className="ls-boot-line">
            <span className="ls-boot-prompt">{">"}</span>
            <span className="ls-boot-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  TELA PRINCIPAL DE AUTH
// ══════════════════════════════════════════════════════════
export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple, signInWithEmail,
          signUpWithEmail, resetPassword, authError, clearError,
          isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [booted,   setBooted]   = useState(false);
  // view: "choose" | "email-login" | "email-register" | "reset"
  const [view,     setView]     = useState("choose");
  const [loading,  setLoading]  = useState(false);
  const [localErr, setLocalErr] = useState("");
  const [success,  setSuccess]  = useState("");

  // Campos
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);

  // Redireciona se já autenticado
  useEffect(() => {
    if (isAuthenticated) navigate("/stations", { replace: true });
  }, [isAuthenticated, navigate]);

  const error = localErr || authError;

  function resetFields() {
    setName(""); setEmail(""); setPassword(""); setConfirm("");
    setLocalErr(""); setSuccess(""); clearError();
  }

  function goView(v) { resetFields(); setView(v); }

  // ── Handlers ──────────────────────────────────

  async function handleGoogle() {
  setLocalErr(""); clearError();
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) {
    setLoading(true);
    try { await signInWithGoogle(); }
    catch { setLoading(false); } // só cai aqui se errar ANTES do redirect
    return; // página vai recarregar — não chega no finally
  }
  setLoading(true);
  try { await signInWithGoogle(); }
  catch { }
  finally { setLoading(false); }
}

  async function handleApple() {
    setLocalErr(""); clearError();
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      setLoading(true);
      try {
        await signInWithApple();
      } catch {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try { await signInWithApple(); }
    catch { /* erro já no context */ }
    finally { setLoading(false); }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!email || !password) return setLocalErr("Preencha todos os campos.");
    setLoading(true); setLocalErr(""); clearError();
    try { await signInWithEmail(email, password); }
    catch { /* erro no context */ }
    finally { setLoading(false); }
  }

  async function handleEmailRegister(e) {
    e.preventDefault();
    if (!name.trim())           return setLocalErr("Informe seu codinome.");
    if (!email)                 return setLocalErr("Informe o e-mail.");
    if (password.length < 6)    return setLocalErr("Senha mínima de 6 caracteres.");
    if (password !== confirm)   return setLocalErr("As chaves não coincidem.");
    setLoading(true); setLocalErr(""); clearError();
    try { await signUpWithEmail(email, password, name.trim()); }
    catch { /* erro no context */ }
    finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email) return setLocalErr("Informe o e-mail.");
    setLoading(true); setLocalErr(""); clearError();
    try {
      await resetPassword(email);
      setSuccess("Link enviado! Verifique seu e-mail.");
    } catch { /* erro no context */ }
    finally { setLoading(false); }
  }

  // ══════════════════════════════════════════════
  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;

  return (
    <div className="ls-root">
      {/* Layers de fundo */}
      <div className="ls-bg" />
      <div className="ls-grid" />
      <div className="ls-scanlines" />
      <div className="ls-vignette" />

      <div className="ls-content">
        {/* Logo */}
        <div className="ls-logo-row">
          <div className="ls-logo tech-font">NΞXUS</div>
          <div className="ls-logo-sub data-font">SISTEMA OPERACIONAL PESSOAL</div>
        </div>

        {/* ── CHOOSE VIEW ── */}
        {view === "choose" && (
          <div className="ls-panel ls-panel--narrow">
            <p className="ls-panel-title tech-font">ACESSO AO SISTEMA</p>
            <p className="ls-panel-sub data-font">Escolha seu método de autenticação</p>

            <div className="ls-oauth-stack">
              {/* Google */}
              <button
                type="button"
                className="ls-oauth-btn ls-oauth-btn--google tech-font"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon />
                CONTINUAR COM GOOGLE
              </button>

              {/* Apple */}
              <button
                type="button"
                className="ls-oauth-btn ls-oauth-btn--apple tech-font"
                onClick={handleApple}
                disabled={loading}
              >
                <AppleIcon />
                CONTINUAR COM APPLE
              </button>

              {/* Divisor */}
              <div className="ls-divider">
                <span className="ls-divider-line" />
                <span className="ls-divider-text data-font">OU</span>
                <span className="ls-divider-line" />
              </div>

              {/* Email */}
              <button
                type="button"
                className="ls-oauth-btn ls-oauth-btn--email tech-font"
                onClick={() => goView("email-login")}
                disabled={loading}
              >
                <EmailIcon />
                CONTINUAR COM E-MAIL
              </button>
            </div>

            {error && <div className="ls-error tech-font">{error}</div>}

            <p className="ls-terms data-font">
              Ao continuar você concorda com os termos de uso do NΞXUS.
            </p>
          </div>
        )}

        {/* ── EMAIL LOGIN ── */}
        {view === "email-login" && (
          <div className="ls-panel ls-panel--narrow">
            <p className="ls-panel-title tech-font">AUTENTICAÇÃO VIA E-MAIL</p>

            <form onSubmit={handleEmailLogin} className="ls-form">
              <div className="ls-field">
                <label className="ls-label tech-font">E-MAIL</label>
                <input
                  type="email"
                  className="ls-input tech-font"
                  placeholder="operador@nexus.sys"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalErr(""); }}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="ls-field">
                <label className="ls-label tech-font">CHAVE DE ACESSO</label>
                <div className="ls-input-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    className="ls-input tech-font"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalErr(""); }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="ls-eye"
                    onClick={() => setShowPwd((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPwd ? "○" : "●"}
                  </button>
                </div>
              </div>

              {error && <div className="ls-error tech-font">{error}</div>}

              <div className="ls-actions">
                <button
                  type="button"
                  className="ls-btn ls-btn--ghost tech-font"
                  onClick={() => goView("choose")}
                  disabled={loading}
                >
                  VOLTAR
                </button>
                <button
                  type="submit"
                  className="ls-btn ls-btn--primary tech-font"
                  disabled={loading}
                >
                  {loading ? "AUTENTICANDO..." : "ACESSAR"}
                </button>
              </div>

              <button
                type="button"
                className="ls-link tech-font"
                onClick={() => goView("reset")}
              >
                ESQUECI A CHAVE DE ACESSO
              </button>

              <div className="ls-divider">
                <span className="ls-divider-line" />
                <span className="ls-divider-text data-font">SEM CONTA?</span>
                <span className="ls-divider-line" />
              </div>

              <button
                type="button"
                className="ls-btn ls-btn--outline tech-font"
                onClick={() => goView("email-register")}
                disabled={loading}
              >
                CRIAR NOVO OPERADOR
              </button>
            </form>
          </div>
        )}

        {/* ── EMAIL REGISTER ── */}
        {view === "email-register" && (
          <div className="ls-panel ls-panel--narrow">
            <p className="ls-panel-title tech-font">NOVO OPERADOR</p>

            <form onSubmit={handleEmailRegister} className="ls-form">
              <div className="ls-field">
                <label className="ls-label tech-font">CODINOME</label>
                <input
                  type="text"
                  className="ls-input tech-font"
                  placeholder="SEU NOME NO SISTEMA"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setLocalErr(""); }}
                  autoFocus
                />
              </div>

              <div className="ls-field">
                <label className="ls-label tech-font">E-MAIL</label>
                <input
                  type="email"
                  className="ls-input tech-font"
                  placeholder="operador@nexus.sys"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalErr(""); }}
                  autoComplete="email"
                />
              </div>

              <div className="ls-field">
                <label className="ls-label tech-font">CHAVE DE ACESSO</label>
                <div className="ls-input-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    className="ls-input tech-font"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalErr(""); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="ls-eye" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                    {showPwd ? "○" : "●"}
                  </button>
                </div>
              </div>

              <div className="ls-field">
                <label className="ls-label tech-font">CONFIRMAR CHAVE</label>
                <input
                  type="password"
                  className="ls-input tech-font"
                  placeholder="Repita a chave"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setLocalErr(""); }}
                  autoComplete="new-password"
                />
              </div>

              {error && <div className="ls-error tech-font">{error}</div>}

              <div className="ls-actions">
                <button
                  type="button"
                  className="ls-btn ls-btn--ghost tech-font"
                  onClick={() => goView("email-login")}
                  disabled={loading}
                >
                  VOLTAR
                </button>
                <button
                  type="submit"
                  className="ls-btn ls-btn--primary tech-font"
                  disabled={loading}
                >
                  {loading ? "CRIANDO..." : "CRIAR CONTA"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── RESET PASSWORD ── */}
        {view === "reset" && (
          <div className="ls-panel ls-panel--narrow">
            <p className="ls-panel-title tech-font">RECUPERAR ACESSO</p>
            <p className="ls-panel-sub data-font">
              Enviaremos um link de recuperação para seu e-mail
            </p>

            <form onSubmit={handleReset} className="ls-form">
              <div className="ls-field">
                <label className="ls-label tech-font">E-MAIL</label>
                <input
                  type="email"
                  className="ls-input tech-font"
                  placeholder="operador@nexus.sys"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalErr(""); clearError(); }}
                  autoFocus
                />
              </div>

              {error   && <div className="ls-error tech-font">{error}</div>}
              {success && <div className="ls-success tech-font">{success}</div>}

              <div className="ls-actions">
                <button
                  type="button"
                  className="ls-btn ls-btn--ghost tech-font"
                  onClick={() => goView("email-login")}
                >
                  VOLTAR
                </button>
                <button
                  type="submit"
                  className="ls-btn ls-btn--primary tech-font"
                  disabled={loading || !!success}
                >
                  {loading ? "ENVIANDO..." : "ENVIAR LINK"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}