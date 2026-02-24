import { Link } from "react-router-dom";

export default function StationsHome() {
  return (
    <div>
      <h2>Escolha uma estação</h2>
      <p>Choose where to operate.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="missions">Missions</Link>
        <Link to="finance">Finance</Link>
        <Link to="health">Health</Link>
      </div>
    </div>
  );
}