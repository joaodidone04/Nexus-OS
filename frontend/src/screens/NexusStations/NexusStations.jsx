import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useNexus } from "../../context/NexusContext";
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
function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name || "");
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [avatar, setAvatar] = useState(profile.avatar || "👤");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleSave = () => {
    if (!name.trim()) return setError("CODINOME OBRIGATÓRIO");
    if (pass && pass !== passConf) return setError("CHAVES NÃO COINCIDEM");

    onSave({
      ...profile,
      name: name.trim(),
      avatar,
      ...(pass ? { password: pass } : {}),
    });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="nx-overlay" onClick={onClose}>
      <div className="nx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nx-modal-header">
          <span className="nx-modal-title tech-font">EDITAR OPERADOR</span>
          <button type="button" className="nx-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Avatar */}
        <div className="nx-avatar-edit-wrap">
          <div
            className="nx-avatar-edit"
            onClick={() => fileRef.current?.click()}
          >
            {isImgAvatar(avatar) ? (
              <img src={avatar} alt="avatar" />
            ) : (
              <span>{avatar}</span>
            )}
            <div className="nx-avatar-edit-overlay tech-font">TROCAR</div>
          </div>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            className="nx-hidden"
            onChange={handleFile}
          />
        </div>

        <div className="nx-modal-field">
          <label className="nx-modal-label tech-font">CODINOME</label>
          <input
            className="nx-modal-input tech-font"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="NOME DO OPERADOR"
            autoFocus
          />
        </div>

        <div className="nx-modal-field">
          <label className="nx-modal-label tech-font">
            NOVA CHAVE{" "}
            <span
              style={{ color: "rgba(255,255,255,0.22)", fontWeight: 400 }}
            >
              (opcional)
            </span>
          </label>

          <div className="nx-modal-input-row">
            <input
              className="nx-modal-input tech-font"
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              placeholder="DEIXE EM BRANCO PARA MANTER"
            />
            <button
              type="button"
              className="nx-modal-eye"
              onClick={() => setShowPass((s) => !s)}
            >
              {showPass ? "○" : "●"}
            </button>
          </div>
        </div>

        {pass && (
          <div className="nx-modal-field">
            <label className="nx-modal-label tech-font">
              CONFIRMAR NOVA CHAVE
            </label>
            <input
              className="nx-modal-input tech-font"
              type="password"
              value={passConf}
              onChange={(e) => {
                setPassConf(e.target.value);
                setError("");
              }}
              placeholder="REPITA A CHAVE"
            />
          </div>
        )}

        {error && <div className="nx-modal-error tech-font">{error}</div>}

        <div className="nx-modal-actions">
          <button
            type="button"
            className="nx-modal-btn nx-modal-btn--ghost tech-font"
            onClick={onClose}
          >
            CANCELAR
          </button>
          <button
            type="button"
            className="nx-modal-btn nx-modal-btn--primary tech-font"
            onClick={handleSave}
          >
            SALVAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: conquistas ─────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 1,
    icon: "🎯",
    name: "PRIMEIRO ACESSO",
    desc: "Entrou no sistema pela primeira vez.",
    unlocked: true,
  },
  {
    id: 2,
    icon: "⚡",
    name: "VELOCIDADE NEURAL",
    desc: "Completou 5 missões em um único dia.",
    unlocked: false,
  },
  {
    id: 3,
    icon: "🔥",
    name: "SEQUÊNCIA DE FOGO",
    desc: "7 dias consecutivos de atividade.",
    unlocked: false,
  },
  {
    id: 4,
    icon: "💎",
    name: "OPERADOR ELITE",
    desc: "Atingiu o nível 10.",
    unlocked: false,
  },
  {
    id: 5,
    icon: "🌐",
    name: "MULTIESTAÇÃO",
    desc: "Acessou todas as estações do sistema.",
    unlocked: false,
  },
  {
    id: 6,
    icon: "💰",
    name: "PATRIMÔNIO DIGITAL",
    desc: "Registrou 10 transações financeiras.",
    unlocked: false,
  },
];

function AchievementsModal({ onClose }) {
  return (
    <div className="nx-overlay" onClick={onClose}>
      <div className="nx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nx-modal-header">
          <span className="nx-modal-title tech-font">CONQUISTAS</span>
          <button type="button" className="nx-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="nx-ach-list">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.id}
              className={`nx-ach-item${a.unlocked ? " is-unlocked" : ""}`}
            >
              <span className="nx-ach-icon">{a.icon}</span>
              <div className="nx-ach-info">
                <span className="nx-ach-name tech-font">{a.name}</span>
                <span className="nx-ach-desc data-font">{a.desc}</span>
              </div>
              <span className="nx-ach-status">{a.unlocked ? "✓" : "🔒"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Relógio vertical NΞXUS (ÚNICO) ─────────────────────────────────────────
// Cada coluna de dígitos faz scroll para mostrar o valor atual.
// Visível: atual (100%), ±1 (28%), ±2 (8%). Além disso: 0%.
function DigitColumn({ value, max }) {
  const digits = Array.from({ length: max }, (_, i) => i);
  const ITEM_H = 36;

  return (
    <div className="nclock-col" style={{ "--cell": `${ITEM_H}px` }}>
      <div
        className="nclock-track"
        style={{ transform: `translateY(calc(-${value} * ${ITEM_H}px))` }}
      >
        {digits.map((d) => {
          const dist = Math.abs(d - value);
          const opacity =
            dist === 0 ? 1 : dist === 1 ? 0.28 : dist === 2 ? 0.08 : 0;
          const scale = dist === 0 ? 1 : dist === 1 ? 0.85 : 0.72;

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

  const h0 = Math.floor(h / 10);
  const h1 = h % 10;
  const m0 = Math.floor(m / 10);
  const m1 = m % 10;
  const s0 = Math.floor(s / 10);
  const s1 = s % 10;

  return (
    <div className="nclock-root" style={{ "--accent": accentColor }}>
      <DigitColumn value={h0} max={3} />
      <DigitColumn value={h1} max={10} />
      <div className="nclock-sep data-font">:</div>
      <DigitColumn value={m0} max={6} />
      <DigitColumn value={m1} max={10} />
      <div className="nclock-sep data-font">:</div>
      <DigitColumn value={s0} max={6} />
      <DigitColumn value={s1} max={10} />
    </div>
  );
}

export default function NexusStations() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentProfile,
    setCurrentProfile,
    currentStation,
    setCurrentStation,
  } = useNexus();

  if (!currentProfile) return <Navigate to="/login" replace />;

  const isHub = location.pathname === "/stations";

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const sid = parts[1];
    if (!sid) return;
    if (sid !== currentStation) setCurrentStation(sid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ── Menu dropdown state ───────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [achieveOpen, setAchieveOpen] = useState(false);
  const menuRef = useRef(null);

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

  const handleAction = (id) => {
    setMenuOpen(false);
    switch (id) {
      case "logout":
        setCurrentStation("");
        setCurrentProfile(null);
        navigate("/login", { replace: true });
        break;
      case "profile":
        setEditOpen(true);
        break;
      case "achievements":
        setAchieveOpen(true);
        break;
      case "settings":
        // futuro
        break;
      default:
        break;
    }
  };

  const handleSaveProfile = (updated) => {
    setCurrentProfile(updated);
    try {
      const raw = localStorage.getItem("nexus_profiles");
      if (raw) {
        const list = JSON.parse(raw);
        localStorage.setItem(
          "nexus_profiles",
          JSON.stringify(list.map((p) => (p.id === updated.id ? updated : p)))
        );
      }
    } catch {}
    setEditOpen(false);
  };

  const enterStation = (s) => {
    setCurrentStation(s.id);
    navigate(s.path);
  };

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
              {/* Menu dropdown */}
              <div className="hub-menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className={`hub-menu-trigger${menuOpen ? " is-open" : ""}`}
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Menu do operador"
                  aria-expanded={menuOpen}
                >
                  <div className="hub-avatar">
                    {isImgAvatar(currentProfile.avatar) ? (
                      <img src={currentProfile.avatar} alt="avatar" />
                    ) : (
                      <span>
                        {typeof currentProfile.avatar === "string"
                          ? currentProfile.avatar
                          : "👤"}
                      </span>
                    )}
                  </div>

                  <div className="hub-trigger-info">
                    <span className="hub-trigger-name tech-font">
                      {currentProfile.name}
                    </span>
                    <span className="hub-trigger-level data-font">
                      LV {currentProfile.level ?? 1}
                    </span>
                  </div>

                  <svg
                    className="hub-menu-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="12"
                    height="12"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="hub-dropdown">
                    {MENU_ITEMS.map((item, i) =>
                      item.id === "divider" ? (
                        <div
                          key={`div-${i}`}
                          className="hub-dropdown-divider"
                        />
                      ) : (
                        <button
                          key={item.id}
                          type="button"
                          className="hub-dropdown-item tech-font"
                          style={{ "--color": item.color }}
                          onClick={() => handleAction(item.id)}
                        >
                          <span
                            className="hub-dropdown-icon"
                            style={{ color: item.color }}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Relógio */}
              <div className="hub-topbar-clock">
                <NexusClock accentColor={currentProfile?.color || "#3b82f6"} />
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

            {/* Cards */}
            <div className="hub-grid">
              {STATIONS.map((s) => (
                <StationCard
                  key={s.id}
                  station={s}
                  onClick={() => enterStation(s)}
                />
              ))}
            </div>

            <div className="hub-footer data-font">
              AGUARDANDO COMANDO DE INTERFACE...
            </div>
          </div>
        </div>
      )}

      {!isHub && (
        <div className="ns-outlet">
          <Outlet />
        </div>
      )}

      {/* Modais */}
      {editOpen && (
        <EditProfileModal
          profile={currentProfile}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      {achieveOpen && (
        <AchievementsModal onClose={() => setAchieveOpen(false)} />
      )}
    </div>
  );
}