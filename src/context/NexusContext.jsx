import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const NexusContext = createContext(null);

const KEY_PROFILE = "nexus:currentProfile:v1";
const KEY_STATION = "nexus:currentStation:v1";

export function NexusProvider({ children }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [currentStation, setCurrentStation] = useState("");

  // hydrate
  useEffect(() => {
    try {
      const p = localStorage.getItem(KEY_PROFILE);
      if (p) setCurrentProfile(JSON.parse(p));
    } catch {}
    try {
      const s = localStorage.getItem(KEY_STATION);
      if (s) setCurrentStation(s);
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    if (!currentProfile) localStorage.removeItem(KEY_PROFILE);
    else localStorage.setItem(KEY_PROFILE, JSON.stringify(currentProfile));
  }, [currentProfile]);

  useEffect(() => {
    if (!currentStation) localStorage.removeItem(KEY_STATION);
    else localStorage.setItem(KEY_STATION, currentStation);
  }, [currentStation]);

  const value = useMemo(
    () => ({
      currentProfile,
      setCurrentProfile,
      currentStation,
      setCurrentStation,
    }),
    [currentProfile, currentStation]
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used within NexusProvider");
  return ctx;
}