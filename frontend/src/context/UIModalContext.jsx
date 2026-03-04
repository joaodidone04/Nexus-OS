import React, { createContext, useContext, useMemo, useState } from "react";

const UIModalContext = createContext(null);

export function UIModalProvider({ children }) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [stationsModalOpen, setStationsModalOpen] = useState(false);

  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);

  const openStationsModal = () => setStationsModalOpen(true);
  const closeStationsModal = () => setStationsModalOpen(false);

  const value = useMemo(
    () => ({
      profileModalOpen,
      openProfileModal,
      closeProfileModal,
      stationsModalOpen,
      openStationsModal,
      closeStationsModal,
    }),
    [profileModalOpen, stationsModalOpen]
  );

  return (
    <UIModalContext.Provider value={value}>{children}</UIModalContext.Provider>
  );
}

export function useUIModal() {
  const ctx = useContext(UIModalContext);
  if (!ctx) throw new Error("useUIModal must be used within UIModalProvider");
  return ctx;
}