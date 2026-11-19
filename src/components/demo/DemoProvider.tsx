import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { demoReducer, initialDemoState, type DemoAction, type DemoState } from "@/lib/demo-state";
import { DEMO_SESSION_STORAGE_KEY, EMERGENCY_KIT_STORAGE_KEY } from "@/lib/demo-storage";

interface DemoContextValue {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Conserve l'état de la démo dans la session de l'onglet uniquement (aucune collecte). */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as DemoState });
    } catch {
      // Stockage indisponible : la démo fonctionne quand même, sans mémoire.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignoré */
    }
  }, [state, hydrated]);

  function resetDemo() {
    try {
      window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    } catch {
      // La session en mémoire est réinitialisée même si le stockage est indisponible.
    }
    try {
      window.localStorage.removeItem(EMERGENCY_KIT_STORAGE_KEY);
    } catch {
      // Le kit peut fonctionner uniquement en mémoire.
    }
    dispatch({ type: "RESET" });
    setResetCount((count) => count + 1);
  }

  return (
    <DemoContext.Provider value={{ state, dispatch, resetDemo }}>
      <Fragment key={resetCount}>{children}</Fragment>
    </DemoContext.Provider>
  );
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
