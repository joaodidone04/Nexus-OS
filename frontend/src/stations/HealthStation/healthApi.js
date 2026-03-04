// frontend/src/stations/HealthStation/healthApi.js
const API_BASE =
  (import.meta.env.VITE_API_URL || "").trim() ||
  "http://localhost:3001";

// helper simples
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const API = {
  base: API_BASE,
  health: () => apiGet("/api/health"),
  // você pode ir adicionando aqui:
  // dietSummary: (profile_id, date) => apiGet(`/api/diet/summary?profile_id=${profile_id}&date=${date}`),
};