import React, { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useNexus } from "../../context/NexusContext";

export default function NexusStations() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentProfile, setCurrentProfile, currentStation, setCurrentStation } =
    useNexus();

  // 🔐 Proteção
  if (!currentProfile) {
    return <Navigate to="/login" replace />;
  }

  const stations = useMemo(
    () => [
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
    ],
    []
  );

  // Mantém currentStation sincronizado com a URL quando estiver dentro de /stations/*
  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean); // ["stations", "missions"]
    const stationFromUrl = parts[1]; // missions | finance | health | undefined

    if (!stationFromUrl) return; // /stations (HUB)

    if (stationFromUrl !== currentStation) {
      setCurrentStation(stationFromUrl);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const goHub = () => {
    setCurrentStation("");
    navigate("/stations", { replace: true });
  };

  const logout = () => {
    setCurrentStation("");
    setCurrentProfile(null);
    navigate("/login", { replace: true });
  };

  const enterStation = (station) => {
    setCurrentStation(station.id);
    navigate(station.path, { replace: true });
  };

  const isHub = location.pathname === "/stations";

  return (
    <div className="stations-root">
      {/* Background global */}
      <div className="bg-base" />
      <div className="bg-grid" />
      <div className="vignette" />

      {/* TOPBAR */}
      <div className="nx-topbar">
        {!isHub && (
          <button className="nx-topbar-btn" onClick={goHub} type="button">
            ← HUB
          </button>
        )}
        <button className="nx-topbar-btn danger" onClick={logout} type="button">
          SAIR
        </button>
    </div>

      {/* HUB */}
      {isHub && (
        <div className="hub-root">
          <div className="hub-shell">
            <div className="hub-header">
              <div className="hub-pill">
                <span>SELECIONE O TERMINAL</span>
              </div>

              <h1 className="hub-title">
                NΞXUS<span className="hub-dot">.</span>HUB
              </h1>

              <div className="hub-operator">
                OPERADOR: <span>{currentProfile?.name || "OPERADOR"}</span>
              </div>
            </div>

            <div className="hub-grid">
              {stations.map((s) => (
                <button
                  key={s.id}
                  className="hub-card"
                  onClick={() => enterStation(s)}
                  type="button"
                >
                  <div className="hub-card-glow" style={{ backgroundColor: s.color }} />
                  <div className="hub-icon" style={{ boxShadow: `0 0 30px ${s.color}22` }}>
                    <span>{s.icon}</span>
                  </div>

                  <div className="hub-card-text">
                    <h3 className="hub-card-title">{s.name}</h3>
                    <p className="hub-card-desc">{s.description}</p>
                  </div>

                  <div className="hub-card-cta">ACESSAR TERMINAL ⇢</div>
                </button>
              ))}
            </div>

            <div className="hub-footer">AGUARDANDO COMANDO DE INTERFACE...</div>
          </div>
        </div>
      )}

      {/* STATION CONTENT */}
      {!isHub && (
        <div className="stations-content">
          <Outlet />
        </div>
      )}
    </div>
  );
}