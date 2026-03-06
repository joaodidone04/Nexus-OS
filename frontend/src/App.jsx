// ═══════════════════════════════════════════════════════════
//  NΞXUS — App.jsx (FIX: Auth ≠ Profile, rotas públicas)
// ═══════════════════════════════════════════════════════════
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import XPToast from "./xp/XPToast";
import LoginScreen from "./auth/LoginScreen";
import OnboardingScreen from "./auth/OnboardingScreen";
import NexusStations from "./screens/NexusStations/NexusStations";

// ── Importa as estações ─────────────────────────────────────
import MissionsStation from "./stations/MissionsStations/MissionsStation";
import FinanceStation from "./stations/FinanceStation/FinanceStations";
import HealthStation from "./stations/HealthStation/HealthStation";

// ── Páginas públicas (crie esses componentes) ───────────────
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AuthTest from "./pages/AuthTest";

// ── Loader ──────────────────────────────────────────────────
function NexusLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05050a",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Chakra Petch', sans-serif",
          fontSize: "11px",
          letterSpacing: ".32em",
          color: "rgba(255,255,255,0.28)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        INICIALIZANDO NΞXUS...
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }`}</style>
    </div>
  );
}

// ── Redirect inteligente ────────────────────────────────────
function HomeRedirect() {
  const { firebaseUser, loadingAuth } = useAuth();
  if (loadingAuth) return <NexusLoader />;
  return <Navigate to={firebaseUser ? "/stations" : "/login"} replace />;
}

// ── Rota privada ────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { firebaseUser, loadingAuth, profile } = useAuth();

  // ✅ Só depende do Firebase Auth
  if (loadingAuth) return <NexusLoader />;
  if (!firebaseUser) return <Navigate to="/login" replace />;

  // ✅ Onboarding só quando profile existe
  if (profile && profile.onboardingDone === false) return <OnboardingScreen />;

  return children;
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/auth-test" element={<AuthTest />} />

        {/* Privado — NexusStations é o layout wrapper (hub + outlet) */}
        <Route
          path="/stations"
          element={
            <PrivateRoute>
              <NexusStations />
            </PrivateRoute>
          }
        >
          <Route path="missions" element={<MissionsStation />} />
          <Route path="finance" element={<FinanceStation />} />
          <Route path="health" element={<HealthStation />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>

      <XPToast />
    </>
  );
}