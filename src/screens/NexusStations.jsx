import { Outlet, useNavigate } from "react-router-dom";
import { useEffect} from "react";
import { useNexus } from "../context/NexusContext";

export default function NexusStations() {
    const navigate = useNavigate();
    const [operator, logout] = useNexus();

    useEffect(() => {
        if (!operator) navigate("/login"); 
        }, [operator, navigate]);

        if (!operator) return null;   
    return (
    <div style={{ padding: 24 }}>
      <h1>Nexus OS</h1>
      <p>Welcome, {operator.name}!</p>

      <button onClick={() => { logout(); navigate("/login"); }} style={{ marginBottom: 16 }}>
        Logout
      </button>

      <hr style={{ margin: "16px 0" }} />
      <Outlet />
    </div>
  );
}