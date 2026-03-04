import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NexusStations.css";

// ── Stations ───────────────────────────────────────────────────────────────
const STATIONS = [
  {
    id: "missions",
    name: "MISSÕES",
    icon: "💠",
    description: "Gerenciamento de objetivos e workflow neural.",
    color: "#3b82f6",
    path: "/stations/missions",
  },
  {
    id: "finance",
    name: "FINANCEIRO",
    icon: "💰",
    description: "Controle de créditos e fluxos monetários.",
    color: "#10b981",
    path: "/stations/finance",
  },
  {
    id: "health",
    name: "SAÚDE",
    icon: "🧬",
    description: "Monitoramento de biometria e vitalidade.",
    color: "#ef4444",
    path: "/stations/health",
  },
];

// ── Itens do menu dropdown ─────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: "profile",
    label: "EDITAR PERFIL",
    color: "#3b82f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d="M12 2a5 5 0 1 1-5 5l.005-.217A5 5 0 0 1 12 2z" />
        <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1a5 5 0 0 1 5-5h4z" />
      </svg>
    ),
  },
  {
    id: "achievements",
    label: "CONQUISTAS",
    color: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "CONFIGURAÇÕES",
    color: "#8b5cf6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d="M14.647 4.081a.724.724 0 0 0 1.08.448c2.439-1.485 5.23 1.305 3.745 3.744a.724.724 0 0 0 .447 1.08c2.775.673 2.775 4.62 0 5.294a.724.724 0 0 0-.448 1.08c1.485 2.439-1.305 5.23-3.744 3.745a.724.724 0 0 0-1.08.447c-.673 2.775-4.62 2.775-5.294 0a.724.724 0 0 0-1.08-.448c-2.439 1.485-5.23-1.305-3.745-3.744a.724.724 0 0 0-.447-1.08c-2.775-.673-2.775-4.62 0-5.294a.724.724 0 0 0 .448-1.08c-1.485-2.439 1.305-5.23 3.744-3.745a.722.722 0 0 0 1.08-.447c.673-2.775 4.62-2.775 5.294 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    ),
  },
  { id: "divider" },
  {
    id: "logout",
    label: "SAIR DO SISTEMA",
    color: "#ef4444",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="15"
        height="15"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

// ── Card com spotlight no mouse ────────────────────────────────────────────
function StationCard({ station, onClick }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
  };

  return (
    <button
      ref={cardRef}
      type="button"
      className="hub-card"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ "--card-color": station.color, "--mx": "50%", "--my": "50%" }}
    >
      <div className="hub-card-spotlight" />
      <div className="hub-card-glow" />
      <div className="hub-card-header">
        <h3 className="hub-card-title tech-font">{station.name}</h3>
        <div className="hub-card-status data-font">ONLINE</div>
      </div>
      <div className="hub-card-icon-wrap">
        <div className="hub-icon">{station.icon}</div>
      </div>
      <div className="hub-card-footer">
        <p className="hub-card-desc data-font">{station.description}</p>
        <span className="hub-card-cta tech-font">ACESSAR TERMINAL ⇢</span>
      </div>
    </button>
  );
}

const isImgAvatar = (v) =>
  typeof v === "string" && (v.startsWith("data:") || v.startsWith("http"));

// ── Modal: editar perfil ───────────────────────────────────────────────────
function EditProfileModal({ profile, onClose }) {
  const { updateMyProfile, firebaseUser } = useAuth();
  const [name,   setName]   = useState(profile?.displayName || "");
  const [bio,    setBio]    = useState(profile?.bio || "");
  const [error,  setError]  = useState("");
  const [saving, setSaving] = useState(false);

  const RANK_META = {
    recruit:    { title: "RECRUTA",      icon: "⬡", color: "#6b7280", border: "rgba(107,114,128,0.30)", bg: "rgba(107,114,128,0.08)" },
    operative:  { title: "OPERATIVO",    icon: "◈", color: "#3b82f6", border: "rgba(59,130,246,0.35)",  bg: "rgba(59,130,246,0.08)"  },
    specialist: { title: "ESPECIALISTA", icon: "⬟", color: "#8b5cf6", border: "rgba(139,92,246,0.35)", bg: "rgba(139,92,246,0.08)"  },
    commander:  { title: "COMANDANTE",   icon: "✦", color: "#f59e0b", border: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.08)"  },
    elite:      { title: "ELITE",        icon: "⬠", color: "#ef4444", border: "rgba(239,68,68,0.35)",  bg: "rgba(239,68,68,0.08)"   },
    phantom:    { title: "FANTASMA",     icon: "◉", color: "#06b6d4", border: "rgba(6,182,212,0.35)",  bg: "rgba(6,182,212,0.08)"   },
    legend:     { title: "LENDÁRIO",     icon: "★", color: "#fbbf24", border: "rgba(251,191,36,0.40)", bg: "rgba(251,191,36,0.08)"  },
  };
  const rank        = RANK_META[profile?.rankId] || RANK_META.recruit;
  const totalXP     = profile?.totalXP     || 0;
  const level       = profile?.level       || 1;
  const loginStreak = profile?.loginStreak || 0;

  const handleSave = async () => {
    if (!name.trim()) return setError("CODINOME OBRIGATÓRIO");
    setSaving(true);
    try {
      await updateMyProfile({ displayName: name.trim(), bio: bio.trim() });
      onClose();
    } catch {
      setError("ERRO AO SALVAR. TENTE NOVAMENTE.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nx-overlay" onClick={onClose}>
      <div className="nx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nx-modal-header">
          <span className="nx-modal-title tech-font">EDITAR OPERADOR</span>
          <button type="button" className="nx-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Hero */}
        <div className="nx-profile-hero">
          <div className="nx-profile-avatar">
            {profile?.photoURL
              ? <img src={profile.photoURL} alt="avatar" />
              : <span className="nx-profile-avatar-placeholder">
                  {(profile?.displayName || firebaseUser?.email || "O")[0].toUpperCase()}
                </span>
            }
          </div>
          <div className="nx-profile-name tech-font">{profile?.displayName || "OPERADOR"}</div>
          <div className="nx-profile-email data-font">{firebaseUser?.email || ""}</div>
          <div className="nx-profile-stats">
            <div className="nx-profile-stat">
              <span className="nx-profile-stat-val tech-font">{level}</span>
              <span className="nx-profile-stat-label">NÍVEL</span>
            </div>
            <div className="nx-profile-stat-divider" />
            <div className="nx-profile-stat">
              <span className="nx-profile-stat-val tech-font">{totalXP.toLocaleString()}</span>
              <span className="nx-profile-stat-label">XP TOTAL</span>
            </div>
            <div className="nx-profile-stat-divider" />
            <div className="nx-profile-stat">
              <span className="nx-profile-stat-val tech-font">{loginStreak}</span>
              <span className="nx-profile-stat-label">SEQUÊNCIA</span>
            </div>
          </div>
          <div className="nx-profile-rank-pill" style={{ "--rk-border": rank.border, "--rk-bg": rank.bg, "--rk-color": rank.color }}>
            <span className="nx-profile-rank-icon">{rank.icon}</span>
            <span className="nx-profile-rank-name">{rank.title}</span>
          </div>
        </div>

        {/* Campos */}
        <div className="nx-modal-fields">
          <div className="nx-modal-field">
            <label className="nx-modal-label tech-font">CODINOME</label>
            <input className="nx-modal-input tech-font" value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="NOME DO OPERADOR" autoFocus />
          </div>
          <div className="nx-modal-field">
            <label className="nx-modal-label tech-font">
              BIO <span className="nx-modal-label-opt">(opcional)</span>
            </label>
            <textarea className="nx-modal-input tech-font" value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="BREVE DESCRIÇÃO DO OPERADOR..." />
          </div>
        </div>

        {error && <div className="nx-modal-error tech-font">{error}</div>}

        <div className="nx-modal-actions">
          <button type="button" className="nx-modal-btn nx-modal-btn--ghost tech-font" onClick={onClose}>CANCELAR</button>
          <button type="button" className="nx-modal-btn nx-modal-btn--primary tech-font" onClick={handleSave} disabled={saving}>
            {saving ? "SALVANDO..." : "SALVAR PERFIL"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: conquistas ─────────────────────────────────────────────────────
function AchievementsModal({ onClose, profile }) {
  const LEGACY = [
    { id: "first_blood",      icon: "🚀", name: "PRIMEIRO ACESSO",    desc: "Conectou ao NΞXUS pela primeira vez."  },
    { id: "profile_complete", icon: "🪪", name: "IDENTIDADE FORJADA", desc: "Completou o perfil de operador."       },
    { id: "first_mission",    icon: "💠", name: "PRIMEIRA MISSÃO",     desc: "Completou sua primeira missão."        },
    { id: "mission_10",       icon: "⚡", name: "OPERATIVO ATIVO",     desc: "10 missões concluídas."                },
    { id: "mission_50",       icon: "🎖️", name: "VETERANO DE CAMPO",   desc: "50 missões no histórico."              },
    { id: "health_week",      icon: "🧬", name: "CORPO EM PROTOCOLO",  desc: "7 dias registrando saúde."             },
    { id: "workout_10",       icon: "💪", name: "MÁQUINA DE GUERRA",   desc: "10 treinos registrados."               },
    { id: "first_finance",    icon: "💰", name: "CONTROLE INICIADO",   desc: "Primeira transação financeira."        },
    { id: "goal_reached",     icon: "🎯", name: "META ATINGIDA",       desc: "Alcançou uma meta financeira."         },
    { id: "streak_7",         icon: "🔥", name: "SEQUÊNCIA NEURAL",    desc: "7 dias consecutivos no sistema."       },
    { id: "streak_30",        icon: "💎", name: "PRESENÇA CONSTANTE",  desc: "30 dias consecutivos."                 },
    { id: "streak_100",       icon: "👻", name: "MODO FANTASMA",       desc: "100 dias sem falhar."                  },
    { id: "reach_operative",  icon: "◈", name: "OPERATIVO",           desc: "Atingiu o rank Operativo."            },
    { id: "reach_elite",      icon: "⬠", name: "STATUS ELITE",        desc: "Atingiu o rank Elite."                },
    { id: "reach_legend",     icon: "★", name: "LENDÁRIO",            desc: "O topo da hierarquia NΞXUS."          },
  ];
  const unlockedSet   = new Set(profile?.badges || []);
  const unlockedCount = LEGACY.filter(a => unlockedSet.has(a.id)).length;

  return (
    <div className="nx-overlay" onClick={onClose}>
      <div className="nx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nx-modal-header">
          <span className="nx-modal-title tech-font">CONQUISTAS</span>
          <button type="button" className="nx-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="nx-ach-header">
          <span className="nx-ach-header-label">DESBLOQUEADAS</span>
          <span className="nx-ach-header-count tech-font">{unlockedCount} / {LEGACY.length}</span>
        </div>
        <div className="nx-ach-list">
          {LEGACY.map((a) => {
            const unlocked = unlockedSet.has(a.id);
            return (
              <div key={a.id} className={`nx-ach-item${unlocked ? " is-unlocked" : ""}`}>
                <div className="nx-ach-icon-wrap">{a.icon}</div>
                <div className="nx-ach-info">
                  <span className="nx-ach-name tech-font">{a.name}</span>
                  <span className="nx-ach-desc data-font">{a.desc}</span>
                </div>
                <div className="nx-ach-badge">{unlocked ? "✓" : "🔒"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



// ── Relógio vertical NΞXUS ─────────────────────────────────────────
function DigitColumn({ value, max }) {
  const digits = Array.from({ length: max }, (_, i) => i);
  const ITEM_H = 36;

  return (
    <div className="nclock-col">
      <div
        className="nclock-track"
        style={{ transform: `translateY(${-value * ITEM_H}px)` }}
      >
        {digits.map((d) => {
          const dist    = Math.abs(d - value);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.28 : dist === 2 ? 0.08 : 0;
          const scale   = dist === 0 ? 1 : dist === 1 ? 0.85 : 0.72;
          return (
            <div
              key={d}
              className="nclock-digit data-font"
              style={{ opacity, transform: `scale(${scale})` }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NexusClock({ accentColor = "#3b82f6" }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  return (
    <div className="nclock-root" style={{ "--accent": accentColor }}>
      <DigitColumn value={Math.floor(h / 10)} max={3}  />
      <DigitColumn value={h % 10}             max={10} />
      <div className="nclock-sep data-font">:</div>
      <DigitColumn value={Math.floor(m / 10)} max={6}  />
      <DigitColumn value={m % 10}             max={10} />
      <div className="nclock-sep data-font">:</div>
      <DigitColumn value={Math.floor(s / 10)} max={6}  />
      <DigitColumn value={s % 10}             max={10} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  NEXUS STATIONS — componente principal
//  REGRA: TODOS os hooks ANTES de qualquer return condicional
// ══════════════════════════════════════════════════════════════════════
export default function NexusStations() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Todos os hooks aqui em cima ───────────────────────────────────
  const { profile, logout, loading, isAuthenticated } = useAuth();

  const [currentStation, setCurrentStation] = useState("");
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [editOpen,       setEditOpen]       = useState(false);
  const [achieveOpen,    setAchieveOpen]    = useState(false);
  const menuRef = useRef(null);

  // Sincroniza currentStation com a URL
  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const sid = parts[1] || "";
    setCurrentStation(sid);
  }, [location.pathname]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  // ── Returns condicionais DEPOIS de todos os hooks ─────────────────
  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#05050a",
        display: "grid", placeItems: "center",
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: "11px", letterSpacing: ".32em",
        color: "rgba(255,255,255,0.28)",
      }}>
        INICIALIZANDO NΞXUS...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profile)         return null; // aguarda o listener do Firestore

  // ── Dados do perfil ───────────────────────────────────────────────
  const isHub        = location.pathname === "/stations";
  const displayName  = profile.displayName || "OPERADOR";
  const photoURL     = profile.photoURL    || "";
  const level        = profile.level       || 1;
  const accentColor  = profile.settings?.color || "#3b82f6";

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAction = async (id) => {
    setMenuOpen(false);
    switch (id) {
      case "logout":
        try { await logout(); } catch {}
        navigate("/login", { replace: true });
        break;
      case "profile":
        setEditOpen(true);
        break;
      case "achievements":
        setAchieveOpen(true);
        break;
      default:
        break;
    }
  };

  const enterStation = (s) => {
    setCurrentStation(s.id);
    navigate(s.path);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="ns-root">
      <div className="ns-bg" />
      <div className="ns-grid" />
      <div className="ns-scanlines" />
      <div className="ns-vignette" />

      {/* ── HUB ── */}
      {isHub && (
        <div className="hub-root">
          <div className="hub-shell">
            {/* Topbar */}
            <div className="hub-topbar">
              <div className="hub-menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className={`hub-menu-trigger${menuOpen ? " is-open" : ""}`}
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Menu do operador"
                  aria-expanded={menuOpen}
                >
                  <div className="hub-avatar">
                    {isImgAvatar(photoURL)
                      ? <img src={photoURL} alt="avatar" />
                      : <span>👤</span>
                    }
                  </div>
                  <div className="hub-trigger-info">
                    <span className="hub-trigger-name tech-font">{displayName}</span>
                    <span className="hub-trigger-level data-font">LV {level}</span>
                  </div>
                  <svg
                    className="hub-menu-chevron"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    width="12" height="12"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="hub-dropdown">
                    {MENU_ITEMS.map((item, i) =>
                      item.id === "divider" ? (
                        <div key={`div-${i}`} className="hub-dropdown-divider" />
                      ) : (
                        <button
                          key={item.id}
                          type="button"
                          className="hub-dropdown-item tech-font"
                          style={{ "--color": item.color }}
                          onClick={() => handleAction(item.id)}
                        >
                          <span className="hub-dropdown-icon" style={{ color: item.color }}>
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="hub-topbar-clock">
                <NexusClock accentColor={accentColor} />
              </div>
            </div>

            {/* Header */}
            <div className="hub-header">
              <div className="hub-badge tech-font">SELECIONE O TERMINAL</div>
              <h1 className="hub-title">
                NΞXUS<span className="hub-dot">.</span>HUB
              </h1>
              <p className="hub-subtitle data-font">
                MAINFRAME OPERACIONAL — TODOS OS SISTEMAS ATIVOS
              </p>
            </div>

            {/* Grid de estações */}
            <div className="hub-grid">
              {STATIONS.map((s) => (
                <StationCard key={s.id} station={s} onClick={() => enterStation(s)} />
              ))}
            </div>

            <div className="hub-footer data-font">
              AGUARDANDO COMANDO DE INTERFACE...
            </div>
          </div>
        </div>
      )}

      {/* ── Outlet das estações ── */}
      {!isHub && (
        <div className="ns-outlet">
          <Outlet />
        </div>
      )}

      {/* ── Modais ── */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={() => setEditOpen(false)}
        />
      )}
      {achieveOpen && (
        <AchievementsModal
          profile={profile}
          onClose={() => setAchieveOpen(false)}
        />
      )}
    </div>
  );
}