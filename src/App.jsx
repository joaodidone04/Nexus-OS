import { Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import NexusStations from "./screens/NexusStations";
import StationsHome from "./stations/StationsHome";
import MissionsStation from "./stations/MissionsStation";

function FinanceStation() {
  return (
    <div>
      <h2>Finance Station</h2>
      <p>Coming soon.</p>
    </div>
  );
}

function HealthStation() {
  return (
    <div>
      <h2>Health Station</h2>
      <p>Coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />}/>
      <Route path="/login" element={<LoginScreen/>}/>

      <Route path="/stations" element={<NexusStations />}>
        <Route index element={<StationsHome />} />
        <Route path="missions" element={<MissionsStation />} />
        <Route path="finance" element={<FinanceStation />} />
        <Route path="health" element={<HealthStation />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />}/>
    </Routes>
  );
}
