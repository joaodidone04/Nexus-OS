import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useNexus } from "./context/NexusContext";

import LoginScreen from "./screens/LoginScreen";
import NexusStations from "./screens/NexusStations";
import MissionsStation from "./stations/MissionsStation";

function FinanceStation() {
  return <div style={{ padding: 40 }}>Finance Station</div>;
}

function HealthStation() {
  return <div style={{ padding: 40 }}>Health Station</div>;
}

export default function App() {
  const navigate = useNavigate();
  const { currentProfile, setCurrentProfile } = useNexus();

  const isLogged = !!currentProfile;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <LoginScreen
            onSelectProfile={(profile) => {
              setCurrentProfile(profile);
              navigate("/stations", { replace: true });
            }}
          />
        }
      />

      <Route
        path="/stations"
        element={isLogged ? <NexusStations /> : <Navigate to="/login" replace />}
      >
        <Route index element={null} />
        <Route path="missions" element={<MissionsStation />} />
        <Route path="finance" element={<FinanceStation />} />
        <Route path="health" element={<HealthStation />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}