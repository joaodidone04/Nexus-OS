export function getModulesKey(profileId) {
  return `nexus_modules_${profileId || "default"}`;
}

const DEFAULT_MODULES = [
  { id: "CASA", name: "CASA", color: "#7c3aed" },
  { id: "TRABALHO", name: "TRABALHO", color: "#3b82f6" },
  { id: "CTG", name: "CTG", color: "#f97316" },
];

export function readModulesLocal(profileId) {
  try {
    const key = getModulesKey(profileId);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_MODULES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_MODULES;
  } catch {
    return DEFAULT_MODULES;
  }
}

export function writeModulesLocal(profileId, modules) {
  const key = getModulesKey(profileId);
  localStorage.setItem(key, JSON.stringify(modules));
  return true;
}