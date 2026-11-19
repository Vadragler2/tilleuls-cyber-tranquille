// État de la démonstration : réducteur pur, conservé dans la session du navigateur.
import {
  BACKUPS,
  INCIDENT_STEPS,
  SERVICES,
  type BackupId,
  type Priority,
  type ServiceId,
  type StepId,
  type TicketCategory,
  type TicketPriority,
} from "./demo-data";
import type { AssistantReply } from "./assistant";

export type IncidentStatus = "none" | "active" | "secours";

export interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  status: "À traiter";
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
}

export interface DemoState {
  version: 1;
  incident: {
    status: IncidentStatus;
    startedAt: string | null;
    steps: StepId[];
    validatedBy: string | null;
    lastClosedAt: string | null;
    activatedServices?: ServiceId[];
  };
  /** Tests de restauration simulés pendant la session, par sauvegarde. */
  restoreTests: Partial<Record<BackupId, string>>;
  priorities: Record<ServiceId, Priority>;
  backupAccessTestAt: string | null;
  tickets: Ticket[];
  ticketSeq: number;
  chat: ChatMessage[];
  /** Demande d'aide technicien venue d'un autre écran (ouvre le relais humain). */
  technicianRequested: boolean;
}

export const STEP_ORDER: StepId[] = INCIDENT_STEPS.map((s) => s.id);

export const initialDemoState: DemoState = {
  version: 1,
  incident: { status: "none", startedAt: null, steps: [], validatedBy: null, lastClosedAt: null },
  restoreTests: {},
  priorities: Object.fromEntries(SERVICES.map((s) => [s.id, s.defaultPriority])) as Record<
    ServiceId,
    Priority
  >,
  backupAccessTestAt: null,
  tickets: [],
  ticketSeq: 0,
  chat: [],
  technicianRequested: false,
};

export type DemoAction =
  | { type: "HYDRATE"; state: DemoState }
  | { type: "RESET" }
  | { type: "START_INCIDENT"; at: string }
  | { type: "COMPLETE_STEP"; step: StepId; validatedBy?: string }
  | { type: "CLOSE_INCIDENT"; at: string }
  | { type: "RESTORE_TEST_DONE"; backup: BackupId; at: string }
  | { type: "SET_PRIORITIES"; priorities: Record<ServiceId, Priority> }
  | { type: "BACKUP_ACCESS_TEST_DONE"; at: string }
  | {
      type: "CREATE_TICKET";
      ticket: Omit<Ticket, "id" | "status" | "createdAt">;
      at: string;
    }
  | { type: "CHAT_ADD"; message: Omit<ChatMessage, "id"> }
  | { type: "REQUEST_TECHNICIAN"; value: boolean };

function getEligibleRecoveryServices(priorities: DemoState["priorities"]): ServiceId[] {
  return SERVICES.filter((service) => service.backupReady && priorities[service.id] === 1).map(
    (service) => service.id,
  );
}

/** Raison pour laquelle une étape ne peut pas encore être accomplie, ou null si elle le peut. */
export function getStepBlocker(state: DemoState, step: StepId): string | null {
  const { incident } = state;
  if (incident.status !== "active") return "Aucun incident simulé en cours.";
  if (incident.steps.includes(step)) return "Étape déjà accomplie.";
  if (step === "activer") {
    if (!incident.steps.includes("verifier"))
      return "La reprise ne peut pas être activée tant que l'intégrité d'une sauvegarde n'est pas vérifiée.";
    if (!incident.steps.includes("valider"))
      return "La reprise ne peut pas être activée sans validation par un responsable ou un technicien.";
    if (getEligibleRecoveryServices(state.priorities).length === 0)
      return "Aucun service compatible n'est en priorité 1. Vérifiez les priorités dans Services.";
  }
  const index = STEP_ORDER.indexOf(step);
  const missing = STEP_ORDER.slice(0, index).find((s) => !incident.steps.includes(s));
  if (missing) {
    const title = INCIDENT_STEPS.find((s) => s.id === missing)?.short ?? missing;
    return `Terminez d'abord l'étape « ${title} ».`;
  }
  return null;
}

export function canCompleteStep(state: DemoState, step: StepId): boolean {
  return getStepBlocker(state, step) === null;
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "HYDRATE": {
      if (action.state?.version !== 1) return state;
      const restored = { ...initialDemoState, ...action.state };
      if (restored.incident.status === "secours" && !restored.incident.activatedServices) {
        restored.incident = {
          ...restored.incident,
          activatedServices: getEligibleRecoveryServices(restored.priorities),
        };
      }
      return restored;
    }
    case "RESET":
      return initialDemoState;
    case "START_INCIDENT":
      if (state.incident.status !== "none") return state;
      return {
        ...state,
        incident: {
          ...state.incident,
          status: "active",
          startedAt: action.at,
          steps: [],
          validatedBy: null,
        },
      };
    case "COMPLETE_STEP": {
      if (!canCompleteStep(state, action.step)) return state;
      if (action.step === "valider" && !action.validatedBy) return state;
      const steps = [...state.incident.steps, action.step];
      if (action.step === "activer") {
        return {
          ...state,
          incident: {
            ...state.incident,
            steps,
            status: "secours",
            activatedServices: getEligibleRecoveryServices(state.priorities),
          },
        };
      }
      return {
        ...state,
        incident: {
          ...state.incident,
          steps,
          validatedBy:
            action.step === "valider" ? (action.validatedBy ?? null) : state.incident.validatedBy,
        },
      };
    }
    case "CLOSE_INCIDENT":
      if (state.incident.status === "none") return state;
      return {
        ...state,
        incident: { ...initialDemoState.incident, lastClosedAt: action.at },
      };
    case "RESTORE_TEST_DONE":
      return { ...state, restoreTests: { ...state.restoreTests, [action.backup]: action.at } };
    case "SET_PRIORITIES":
      return { ...state, priorities: { ...action.priorities } };
    case "BACKUP_ACCESS_TEST_DONE":
      return { ...state, backupAccessTestAt: action.at };
    case "CREATE_TICKET": {
      const seq = state.ticketSeq + 1;
      const ticket: Ticket = {
        ...action.ticket,
        id: `MCK-${String(seq).padStart(4, "0")}`,
        status: "À traiter",
        createdAt: action.at,
      };
      return { ...state, ticketSeq: seq, tickets: [ticket, ...state.tickets] };
    }
    case "CHAT_ADD":
      return { ...state, chat: [...state.chat, { ...action.message, id: state.chat.length + 1 }] };
    case "REQUEST_TECHNICIAN":
      return { ...state, technicianRequested: action.value };
    default:
      return state;
  }
}

/* ---------- Sélecteurs ---------- */

export function getBackupsView(state: DemoState) {
  return BACKUPS.map((b) => {
    const simulatedTest = state.restoreTests[b.id] ?? null;
    return {
      ...b,
      verified: b.verifiedByDefault || simulatedTest !== null,
      restoreTested: simulatedTest ? `${simulatedTest} (simulation)` : b.restoreTestedByDefault,
      simulatedTest,
    };
  });
}

export function getBackupStats(state: DemoState) {
  const view = getBackupsView(state);
  const toVerify = view.filter((b) => !b.verified || !b.restoreTested);
  return { total: view.length, available: view.length, toVerify };
}

export type ServiceRuntime =
  "pret" | "a-etudier" | "indisponible" | "secours" | "hors-secours" | "non-active";

export function getServicesView(state: DemoState) {
  const activated = state.incident.activatedServices ?? [];
  return SERVICES.map((s, index) => {
    let runtime: ServiceRuntime = s.backupReady ? "pret" : "a-etudier";
    if (state.incident.status === "active") runtime = "indisponible";
    if (state.incident.status === "secours") {
      if (activated.includes(s.id)) runtime = "secours";
      else runtime = s.backupReady ? "non-active" : "hors-secours";
    }
    return { ...s, index, priority: state.priorities[s.id], runtime };
  }).sort((a, b) => a.priority - b.priority || a.index - b.index);
}

export function getPreparation(state: DemoState) {
  const restoreDone = Object.keys(state.restoreTests).length > 0;
  const items = [
    { label: "Sauvegardes disponibles et isolées", done: true },
    { label: "Services essentiels identifiés", done: true },
    { label: "Fiche réflexe incident partagée aux agents", done: true },
    {
      label: restoreDone
        ? "Test de restauration réalisé (simulation)"
        : "Test de restauration à planifier",
      done: restoreDone,
    },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { items, percent, restoreDone };
}
