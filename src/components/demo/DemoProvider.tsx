import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";

import { demoReducer, initialDemoState, type DemoAction, type DemoState } from "@/lib/demo-state";

const STORAGE_KEY = "municipal-cyber-kit-demo";

interface DemoContextValue {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Conserve l'état de la démo dans la session de l'onglet uniquement (aucune collecte). */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as DemoState });
    } catch {
      // Stockage indisponible : la démo fonctionne quand même, sans mémoire.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignoré */
    }
  }, [state, hydrated]);

  return <DemoContext.Provider value={{ state, dispatch }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo doit être utilisé dans DemoProvider");
  return ctx;
}

export function nowLabel() {
  const d = new Date();
  return `Aujourd'hui · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
