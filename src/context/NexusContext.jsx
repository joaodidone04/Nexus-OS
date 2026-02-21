import { createContext, useContext, useEffect, useState } from "react";

const NexusContext = createContext(null);

export function NexusProvider({ children }) {
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("nexus.operator");
    if (raw) setOperator(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (operator) {
      localStorage.setItem("nexus.operator", JSON.stringify(operator));
    }
  }, [operator]);

  function login(operatorData) {
    setOperator(operatorData);
  }

  function logout() {
    localStorage.removeItem("nexus.operator");
    setOperator(null);
  }

  return (
    <NexusContext.Provider value={{ operator, setOperator, login, logout }}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside NexusProvider");
  return ctx;
}
