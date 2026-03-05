/**
 * NΞXUS — Health Station
 * Módulos: Dieta · Treino · Medidas · Hidratação · Sono · Suplementos
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";              // ← trocado
import "./HealthStation.css";
import "./modules/DashboardModule.css";

// ─── Sub-telas ─────────────────────────────────────────────────────────────
import DashboardModule   from "./modules/DashboardModule";
import DietModule        from "./modules/DietModule";
import WorkoutModule     from "./modules/WorkoutModule";
import MeasuresModule    from "./modules/MeasuresModule";
import HydrationModule   from "./modules/HydrationModule";
import SleepModule       from "./modules/SleepModule";
import SupplementsModule from "./modules/SupplementsModule";

// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "https://nexus-os-e4w9.onrender.com";

const MODULES = [
  { id: "dashboard",   label: "DASHBOARD",   sublabel: "Visão Geral",          icon: "📊", color: "#3b82f6", accent: "#2563eb" },
  { id: "diet",        label: "DIETA",        sublabel: "Nutrição & Macros",     icon: "🥗", color: "#10b981", accent: "#059669" },
  { id: "workout",     label: "TREINO",       sublabel: "Sessões & Exercícios",  icon: "⚡", color: "#3b82f6", accent: "#2563eb" },
  { id: "measures",    label: "MEDIDAS",      sublabel: "Biometria Corporal",    icon: "📐", color: "#8b5cf6", accent: "#7c3aed" },
  { id: "hydration",   label: "HIDRATAÇÃO",   sublabel: "Consumo de Água",       icon: "💧", color: "#06b6d4", accent: "#0891b2" },
  { id: "sleep",       label: "SONO",         sublabel: "Qualidade & Ciclos",    icon: "🌙", color: "#6366f1", accent: "#4f46e5" },
  { id: "supplements", label: "SUPLEMENTOS",  sublabel: "Doses & Lembretes",     icon: "💊", color: "#f59e0b", accent: "#d97706" },
];

// ─── Componente principal ──────────────────────────────────────────────────
export default function HealthStation() {
  const navigate = useNavigate();

  // ── useAuth substitui useNexus ──────────────────────────────────────────
  const { profile, firebaseUser } = useAuth();

  // profileId: usa UID do Firebase (único e persistente)
  const profileId    = firebaseUser?.uid || "default";
  const operatorName = profile?.displayName || "OPERADOR";
  const level        = profile?.level       || 1;

  const [activeModule, setActiveModule] = useState(null);
  const [apiOnline,    setApiOnline]    = useState(null);

  // Verifica se o backend está online
  useEffect(() => {
  fetch(`${API_BASE.replace(/\/$/, "")}/api/health`)
    .then((r) => r.json())
    .then((d) => setApiOnline(!!d.ok))
    .catch(() => setApiOnline(false));
}, []);

  // ── Sub-tela de módulo ─────────────────────────────────────────────────
  if (activeModule) {
    const mod = MODULES.find(m => m.id === activeModule);
    return (
      <ModuleShell mod={mod} onBack={() => setActiveModule(null)}>
        {activeModule === "dashboard"   && <DashboardModule   profileId={profileId} color={mod.color} />}
        {activeModule === "diet"        && <DietModule        profileId={profileId} color={mod.color} />}
        {activeModule === "workout"     && <WorkoutModule     profileId={profileId} color={mod.color} />}
        {activeModule === "measures"    && <MeasuresModule    profileId={profileId} color={mod.color} />}
        {activeModule === "hydration"   && <HydrationModule   profileId={profileId} color={mod.color} />}
        {activeModule === "sleep"       && <SleepModule       profileId={profileId} color={mod.color} />}
        {activeModule === "supplements" && <SupplementsModule profileId={profileId} color={mod.color} />}
      </ModuleShell>
    );
  }

  return (
    <div className="hs-root">
      <div className="hs-bg" />
      <div className="hs-grid" />
      <div className="hs-scanlines" />

      <div className="hs-shell">
        {/* Header */}
        <header className="hs-header">
          <button className="hs-back tech-font" onClick={() => navigate("/stations")}>
            ← HUB
          </button>
          <div className="hs-header-center">
            <div className="hs-badge tech-font">ESTAÇÃO DE SAÚDE</div>
            <h1 className="hs-title">
              NΞXUS<span className="hs-dot">.</span>HEALTH
            </h1>
            <p className="hs-subtitle data-font">MONITORAMENTO BIOMÉTRICO — SISTEMA OPERACIONAL</p>
          </div>
          <div className={`hs-api-status tech-font ${apiOnline === null ? "checking" : apiOnline ? "online" : "offline"}`}>
            <span className="hs-api-dot" />
            {apiOnline === null ? "CONECTANDO" : apiOnline ? "API ONLINE" : "API OFFLINE"}
          </div>
        </header>

        {/* API offline warning */}
        {apiOnline === false && (
          <div className="hs-api-warn tech-font">
            ⚠ Backend offline — verifique o serviço em{" "}
            <code>https://nexus-os-e4w9.onrender.com</code>
          </div>
        )}

        {/* Módulos grid */}
        <div className="hs-modules-grid">
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              disabled={apiOnline === false}
              onClick={() => setActiveModule(mod.id)}
            />
          ))}
        </div>

        <footer className="hs-footer data-font">
          OPERADOR: {operatorName.toUpperCase()} · LV {level}
        </footer>
      </div>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────
function ModuleCard({ mod, index, onClick, disabled }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
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
      className="hs-mod-card"
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ "--c": mod.color, "--ca": mod.accent, "--mx": "50%", "--my": "50%", animationDelay: `${index * 60}ms` }}
    >
      <div className="hs-mod-spotlight" />
      <div className="hs-mod-glow" />
      <div className="hs-mod-top">
        <span className="hs-mod-icon">{mod.icon}</span>
        <span className="hs-mod-status data-font">ONLINE</span>
      </div>
      <div className="hs-mod-body">
        <h3 className="hs-mod-label tech-font">{mod.label}</h3>
        <p className="hs-mod-sublabel data-font">{mod.sublabel}</p>
      </div>
      <div className="hs-mod-cta tech-font">ACESSAR ⇢</div>
      <div className="hs-mod-corner" />
    </button>
  );
}

// ─── Module Shell ─────────────────────────────────────────────────────────
function ModuleShell({ mod, onBack, children }) {
  return (
    <div className="hs-root">
      <div className="hs-bg" />
      <div className="hs-grid" />
      <div className="hs-scanlines" />
      <div className="hs-shell">
        <header className="hs-module-header">
          <button className="hs-back tech-font" onClick={onBack}>← SAÚDE</button>
          <div className="hs-module-title-wrap">
            <span className="hs-module-icon">{mod.icon}</span>
            <div>
              <h2 className="hs-module-title tech-font" style={{ color: mod.color }}>{mod.label}</h2>
              <p className="hs-module-sub data-font">{mod.sublabel}</p>
            </div>
          </div>
          <div className="hs-module-accent-bar" style={{ background: mod.color }} />
        </header>
        <div className="hs-module-body">{children}</div>
      </div>
    </div>
  );
}