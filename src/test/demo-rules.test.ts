import { describe, expect, it } from "vitest";

import { simulatedReply } from "@/lib/assistant";
import {
  canCompleteStep,
  demoReducer,
  getBackupStats,
  getServicesView,
  initialDemoState,
  type DemoState,
} from "@/lib/demo-state";

const at = "10:00";

function activeWith(steps: DemoState["incident"]["steps"]): DemoState {
  return {
    ...initialDemoState,
    incident: { ...initialDemoState.incident, status: "active", steps },
  };
}

describe("Procédure d'incident simulée", () => {
  it("refuse d'activer la reprise sans vérification de sauvegarde", () => {
    expect(canCompleteStep(activeWith(["signaler", "isoler", "valider"]), "activer")).toBe(false);
  });

  it("refuse d'activer la reprise sans validation humaine", () => {
    expect(canCompleteStep(activeWith(["signaler", "isoler", "verifier"]), "activer")).toBe(false);
  });

  it("refuse la validation sans nom de rôle du valideur", () => {
    const s = demoReducer(activeWith(["signaler", "isoler", "verifier"]), {
      type: "COMPLETE_STEP",
      step: "valider",
    });
    expect(s.incident.steps).not.toContain("valider");
  });

  it("passe en mode secours après les 5 étapes dans l'ordre", () => {
    let s = demoReducer(initialDemoState, { type: "START_INCIDENT", at });
    s = demoReducer(s, { type: "COMPLETE_STEP", step: "signaler" });
    s = demoReducer(s, { type: "COMPLETE_STEP", step: "isoler" });
    s = demoReducer(s, { type: "COMPLETE_STEP", step: "verifier" });
    s = demoReducer(s, { type: "COMPLETE_STEP", step: "valider", validatedBy: "Technicien" });
    expect(s.incident.status).toBe("active");
    s = demoReducer(s, { type: "COMPLETE_STEP", step: "activer" });
    expect(s.incident.status).toBe("secours");
  });

  it("la réinitialisation remet la démo à l'état normal", () => {
    let s = demoReducer(initialDemoState, { type: "START_INCIDENT", at });
    s = demoReducer(s, { type: "RESET" });
    expect(s).toEqual(initialDemoState);
  });
});

describe("Sauvegardes, services et tickets", () => {
  it("une sauvegarde est à vérifier au départ, aucune après le test simulé", () => {
    expect(getBackupStats(initialDemoState).toVerify).toHaveLength(1);
    const s = demoReducer(initialDemoState, {
      type: "RESTORE_TEST_DONE",
      backup: "comptabilite",
      at,
    });
    expect(getBackupStats(s).toVerify).toHaveLength(0);
  });

  it("changer une priorité change l'ordre des services", () => {
    const s = demoReducer(initialDemoState, {
      type: "SET_PRIORITIES",
      priorities: { "etat-civil": 2, fichiers: 3, comptabilite: 1 },
    });
    expect(getServicesView(s)[0]?.id).toBe("comptabilite");
  });

  it("un ticket créé reçoit un numéro fictif et le statut « À traiter »", () => {
    const s = demoReducer(initialDemoState, {
      type: "CREATE_TICKET",
      ticket: { subject: "Test", category: "Autre", priority: "Normale", description: "" },
      at,
    });
    expect(s.tickets[0]?.id).toBe("MCK-0001");
    expect(s.tickets[0]?.status).toBe("À traiter");
  });
});

describe("Assistant simulé : relais vers un technicien", () => {
  const ctx = { incidentActive: false };

  it("une suspicion de rançongiciel déclenche le relais technicien prioritaire", () => {
    const r = simulatedReply("Un message de rançon s'affiche", ctx);
    expect(r.escalate).toBe(true);
    expect(r.ticket.priority).toBe("Prioritaire");
  });

  it("un clic sur un lien d'un mail frauduleux déclenche le relais", () => {
    expect(simulatedReply("J'ai cliqué sur le lien du mail", ctx).escalate).toBe(true);
  });

  it("un simple mail suspect ne déclenche pas le relais", () => {
    expect(simulatedReply("Je soupçonne un mail frauduleux", ctx).escalate).toBe(false);
  });

  it("une sauvegarde échouée ne déclenche pas le relais", () => {
    expect(simulatedReply("Une sauvegarde a échoué", ctx).escalate).toBe(false);
  });
});
