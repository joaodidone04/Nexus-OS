const STORAGE_KEY = "nexus_profiles";

function readProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeProfiles(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * streamProfilesLocal(cb)
 * - chama cb imediatamente
 * - depois fica "streamando" via evento storage
 */
export function streamProfilesLocal(cb) {
  const emit = () => cb(readProfiles());
  emit();

  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) emit();
  };

  window.addEventListener("storage", onStorage);

  // para mudanças na mesma aba:
  const interval = setInterval(emit, 800);

  return () => {
    window.removeEventListener("storage", onStorage);
    clearInterval(interval);
  };
}

export function createProfileLocal(profileData) {
  const profiles = readProfiles();

  const id =
    (crypto?.randomUUID && crypto.randomUUID()) ||
    String(Date.now()) + "_" + Math.floor(Math.random() * 9999);

  const newProfile = { id, ...profileData };

  profiles.push(newProfile);
  writeProfiles(profiles);

  return newProfile;
}

export function updateProfileLocal(profileId, patch) {
  const profiles = readProfiles();

  const next = profiles.map((p) =>
    p.id === profileId ? { ...p, ...patch } : p
  );

  writeProfiles(next);

  return next.find((p) => p.id === profileId) || null;
}

export function deleteProfileLocal(profileId) {
  const profiles = readProfiles();
  const next = profiles.filter((p) => p.id !== profileId);
  writeProfiles(next);
  return true;
}