// ═══════════════════════════════════════════════════════════
//  NΞXUS — App.jsx  (com gate de onboarding)
// ═══════════════════════════════════════════════════════════
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import XPToast from "./xp/XPToast";
import LoginScreen from "./auth/LoginScreen";
import OnboardingScreen from "./auth/OnboardingScreen";

// Importe suas estações normalmente
import NexusStations from "./screens/NexusStations/NexusStations"; // ajuste o path

// ── Rota privada ────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated, loading, profile } = useAuth();

  // Aguardando firebase resolver
  if (loading) return <NexusLoader />;

  // Não autenticado → login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Autenticado mas ainda não fez onboarding → tela de cadastro
  // onboardingDone é false na primeira vez (setado pelo userService)
  if (profile && profile.onboardingDone === false) {
    return <OnboardingScreen />;
  }

  return children;
}

// ── Loader simples ──────────────────────────────────────────
function NexusLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#05050a",
      display: "grid", placeItems: "center",
    }}>
      <div style={{
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: "11px", letterSpacing: ".32em",
        color: "rgba(255,255,255,0.28)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        INICIALIZANDO NΞXUS...
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }`}</style>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Routes>
        {/* Login — acessível sem auth */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Stations — protegida + onboarding gate */}
        <Route
          path="/stations/*"
          element={
            <PrivateRoute>
              <NexusStations />
            </PrivateRoute>
          }
        />

        {/* Redirects */}
        <Route path="/"  element={<Navigate to="/stations" replace />} />
        <Route path="*"  element={<Navigate to="/stations" replace />} />
      </Routes>

      {/* Toast global de XP — aparece em qualquer tela autenticada */}
      <XPToast />
    </>
  );
}