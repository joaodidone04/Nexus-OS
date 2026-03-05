const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://nexus-os-e4w9.onrender.com"; // fallback do Render

export const API = {
  base: API_BASE,
  health: async () => {
    const r = await fetch(`${API_BASE}/api/health`);
    if (!r.ok) throw new Error(`Health check falhou: ${r.status}`);
    return r.json();
  },
};