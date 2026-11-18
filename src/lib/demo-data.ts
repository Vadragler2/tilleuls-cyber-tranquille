// Données d'exemple 100 % fictives — aucune connexion à un système réel.

export const COMMUNE = {
  name: "Mairie des Tilleuls",
  population: "2 500 habitants",
  profile: "Agent municipal",
} as const;

export type BackupId = "etat-civil" | "fichiers" | "comptabilite";

export interface Backup {
  id: BackupId;
  label: string;
  description: string;
  lastCopy: string;
  size: string;
  /** La copie a-t-elle été contrôlée (empreinte, lisibilité) ? */
  verifiedByDefault: boolean;
  /** Dernière restauration testée, avant toute action dans la démo. */
  restoreTestedByDefault: string | null;
  history: { when: string; result: string }[];
}

export const BACKUPS: Backup[] = [
  {
    id: "etat-civil",
    label: "État civil",
    description: "Actes, registres et demandes administratives",
    lastCopy: "Aujourd'hui · 02:15",
    size: "1,2 Go",
    verifiedByDefault: true,
    restoreTestedByDefault: "Il y a 7 jours",
    history: [
      { when: "Aujourd'hui · 02:15", result: "Copie complète" },
      { when: "Hier · 02:15", result: "Copie complète" },
      { when: "Avant-hier · 02:15", result: "Copie complète" },
    ],
  },
  {
    id: "fichiers",
    label: "Fichiers municipaux",
    description: "Documents partagés des agents",
    lastCopy: "Aujourd'hui · 01:30",
    size: "8,4 Go",
    verifiedByDefault: true,
    restoreTestedByDefault: "Il y a 7 jours",
    history: [
      { when: "Aujourd'hui · 01:30", result: "Copie complète" },
      { when: "Hier · 01:30", result: "Copie complète" },
      { when: "Avant-hier · 01:30", result: "Copie partielle (relancée)" },
    ],
  },
  {
    id: "comptabilite",
    label: "Comptabilité",
    description: "Logiciel de comptabilité et données financières",
    lastCopy: "Hier · 22:00",
    size: "640 Mo",
    verifiedByDefault: false,
    restoreTestedByDefault: null,
    history: [
      { when: "Hier · 22:00", result: "Copie complète" },
      { when: "Avant-hier · 22:00", result: "Copie complète" },
      { when: "Il y a 3 jours · 22:00", result: "Copie complète" },
    ],
  },
];

export type ServiceId = "etat-civil" | "fichiers" | "comptabilite";
export type Priority = 1 | 2 | 3;

export interface MunicipalService {
  id: ServiceId;
  label: string;
  description: string;
  defaultPriority: Priority;
  /** Secours préparé ou encore à étudier (compatibilité du logiciel métier). */
  backupReady: boolean;
  compatibility: string;
}

export const SERVICES: MunicipalService[] = [
  {
    id: "etat-civil",
    label: "État civil",
    description: "Actes, demandes et pièces administratives",
    defaultPriority: 1,
    backupReady: true,
    compatibility: "Logiciel métier compatible avec la reprise envisagée (hypothèse de démonstration).",
  },
  {
    id: "fichiers",
    label: "Fichiers municipaux",
    description: "Documents indispensables aux agents",
    defaultPriority: 1,
    backupReady: true,
    compatibility: "Fichiers standards : reprise envisageable depuis une copie isolée.",
  },
  {
    id: "comptabilite",
    label: "Comptabilité",
    description: "Outil métier et données financières",
    defaultPriority: 2,
    backupReady: false,
    compatibility:
      "Compatibilité à confirmer avec l'éditeur du logiciel : la reprise n'est pas garantie.",
  },
];

export type StepId = "signaler" | "isoler" | "verifier" | "valider" | "activer";

export const INCIDENT_STEPS: { id: StepId; title: string; short: string; description: string }[] = [
  {
    id: "signaler",
    title: "Signaler l'incident",
    short: "Signaler",
    description: "Prévenir la secrétaire de mairie et le référent informatique. Noter l'heure et ce qui a été observé.",
  },
  {
    id: "isoler",
    title: "Isoler les systèmes touchés",
    short: "Isoler",
    description: "Débrancher le poste concerné du réseau (câble et wifi) sans l'éteindre, pour ne pas effacer d'indices.",
  },
  {
    id: "verifier",
    title: "Vérifier l'intégrité d'une sauvegarde",
    short: "Vérifier",
    description: "S'assurer qu'une copie antérieure à l'incident est saine avant toute reprise.",
  },
  {
    id: "valider",
    title: "Faire valider la reprise",
    short: "Valider",
    description: "Un responsable ou un technicien confirme que la reprise peut être lancée. Aucune reprise automatique.",
  },
  {
    id: "activer",
    title: "Activer les services prioritaires de secours",
    short: "Activer",
    description: "Ouvrir l'accès de secours aux services de priorité 1, dans l'ordre défini par la commune.",
  },
];

export const VALIDATOR_ROLES = [
  "Secrétaire générale de mairie",
  "Technicien du prestataire",
  "Élu référent numérique",
] as const;

export const TICKET_CATEGORIES = [
  "Incident de sécurité",
  "Sauvegarde",
  "Logiciel métier",
  "Messagerie / courriel suspect",
  "Poste de travail",
  "Autre",
] as const;

export const TICKET_PRIORITIES = ["Basse", "Normale", "Haute", "Prioritaire"] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
