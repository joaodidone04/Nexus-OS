// ═══════════════════════════════════════════════════════════
//  NΞXUS — App.jsx
// ═══════════════════════════════════════════════════════════
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import XPToast        from "./xp/XPToast";
import LoginScreen    from "./auth/LoginScreen";
import OnboardingScreen from "./auth/OnboardingScreen";
import NexusStations  from "./screens/NexusStations/NexusStations";

// ── Importa as estações ─────────────────────────────────────
import MissionsStation from "./stations/MissionsStations/MissionsStation";
import FinanceStation  from "./stations/FinanceStation/FinanceStations";
import HealthStation   from "./stations/HealthStation/HealthStation";

// ── Rota privada ────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading)          return <NexusLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (profile && profile.onboardingDone === false) return <OnboardingScreen />;

  return children;
}

// ── Loader ──────────────────────────────────────────────────
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
        {/* Público */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Privado — NexusStations é o layout wrapper (hub + outlet) */}
        <Route
          path="/stations"
          element={
            <PrivateRoute>
              <NexusStations />
            </PrivateRoute>
          }
        >
          {/* Sub-rotas renderizadas no <Outlet /> dentro do NexusStations */}
          <Route path="missions" element={<MissionsStation />} />
          <Route path="finance"  element={<FinanceStation />}  />
          <Route path="health"   element={<HealthStation />}   />
        </Route>

        {/* Redirects */}
        <Route path="/"  element={<Navigate to="/stations" replace />} />
        <Route path="*"  element={<Navigate to="/stations" replace />} />
      </Routes>

      <XPToast />
    </>
  );
}